import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { resolveLang } from "./i18n/index.js";
import { checkRegNo } from "./lib/regno.js";
import { checkFields } from "./lib/fields.js";
import { checkTax } from "./lib/tax.js";
import { suggestFilename } from "./lib/filename.js";
import { allSources } from "./lib/sources.js";
export const VERSION = '0.1.1';
export const lang = z
    .enum(['ja', 'en'])
    .optional()
    .describe('Language of the messages. Use the language the user writes in. Default: INVOICE_TENKEN_LANG or en.');
const rate = z.union([z.literal(10), z.literal(8)]);
const rateOrZero = z.union([z.literal(10), z.literal(8), z.literal(0)]);
const yen = z.number().int().describe('Whole yen');
const optText = z.string().nullable().optional();
export function json(value) {
    return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
export function createServer(edition) {
    const server = new McpServer({ name: 'invoice-tenken', version: `${VERSION}-${edition}` }, {
        instructions: 'Checks Japanese qualified invoices (適格請求書・インボイス), simplified invoices and return invoices. ' +
            'Read the document yourself (PDF or image), extract the fields, then call check_invoice_fields and check_tax. ' +
            'Report every finding with its legal basis. Never invent values that are not on the document: pass null instead. ' +
            'Every finding cites official sources only (e-Gov laws, National Tax Agency documents).',
    });
    server.registerTool('check_registration_number', {
        title: 'Check registration numbers / 登録番号の点検',
        description: 'Checks the format of qualified invoice issuer registration numbers (登録番号: "T" + 13 digits) and the corporate-number check digit. ' +
            'Normalizes full-width characters, spaces and hyphens. Does not tell whether the business is registered (use lookup_registration for that).',
        inputSchema: { numbers: z.array(z.string()).min(1).max(100), lang },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async ({ numbers, lang: l }) => {
        const lg = resolveLang(l);
        return json({ results: numbers.map((n) => checkRegNo(n, lg)) });
    });
    server.registerTool('check_invoice_fields', {
        title: 'Check required items / 記載事項の点検',
        description: 'Checks that a qualified invoice (適格請求書, Consumption Tax Act Art. 57-4(1)), simplified invoice (適格簡易請求書, 57-4(2)) ' +
            'or qualified return invoice (適格返還請求書, 57-4(3)) contains every required item. Pass what is printed on the document; ' +
            'use null for anything that is not there. Returns errors, warnings and the legal basis of each.',
        inputSchema: {
            document_type: z.enum(['qualified', 'simplified', 'return']).describe('qualified=適格請求書, simplified=簡易インボイス, return=返還インボイス'),
            issuer_name: optText.describe('Name of the issuer (発行者の氏名又は名称)'),
            registration_number: optText.describe('Registration number exactly as printed'),
            transaction_date: optText.describe('Transaction date (取引年月日) as printed'),
            transaction_period: optText.describe('Period for a statement covering several transactions, e.g. "2026年10月分"'),
            recipient_name: optText.describe('Recipient name (宛名) as printed'),
            items: z
                .array(z.object({
                description: optText,
                amount: yen.nullable().optional(),
                rate: rateOrZero.nullable().optional().describe('10, 8 (reduced) or 0 (non-taxable). null if the document does not show it'),
                rate_printed: z.boolean().nullable().optional().describe('The rate (e.g. "8%") is printed on this line'),
                marked_reduced: z.boolean().nullable().optional().describe('The line has a reduced-rate mark such as ＊ or ※'),
            }))
                .nullable()
                .optional(),
            reduced_rate_legend: z
                .boolean()
                .nullable()
                .optional()
                .describe('The document explains what its reduced-rate mark means (e.g. "＊は軽減税率対象")'),
            reduced_rate_section: z
                .boolean()
                .nullable()
                .optional()
                .describe('Reduced-rate items are listed in their own section labelled as reduced-rate (or the whole document is)'),
            rate_summaries: z
                .array(z.object({
                rate,
                amount: yen.nullable().optional().describe('Per-rate total of the consideration as printed'),
                rate_shown: z.boolean().nullable().optional().describe('The rate (10% / 8%) is printed next to this total'),
                tax_amount: yen.nullable().optional().describe('Per-rate consumption tax as printed'),
            }))
                .nullable()
                .optional(),
            return_date: optText.describe('Return invoices: date of the return or discount'),
            original_transaction_date: optText.describe('Return invoices: date of the original sale'),
            return_amount_including_tax: yen.nullable().optional(),
            lang,
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async (args) => json(checkFields(args, resolveLang(args.lang))));
    server.registerTool('check_tax', {
        title: 'Check consumption tax / 消費税額の検算',
        description: 'Recalculates consumption tax per rate (Order Art. 70-10): tax = per-rate total × 10/100 or 8/100 (tax-excluded) ' +
            'or × 10/110 or 8/108 (tax-included), rounded once per rate by any method. Reports which rounding methods match, ' +
            'detects tax rounded line by line, and checks the grand total.',
        inputSchema: {
            amount_basis: z.enum(['excluding_tax', 'including_tax']).describe('Whether the line amounts and per-rate totals exclude (税抜) or include (税込) tax'),
            lines: z
                .array(z.object({
                description: optText,
                amount: yen,
                rate: rateOrZero,
                stated_tax: yen.nullable().optional().describe('Tax printed on this line, if any'),
            }))
                .nullable()
                .optional(),
            rate_summaries: z
                .array(z.object({
                rate,
                amount: yen.nullable().optional(),
                stated_tax: yen.nullable().optional(),
            }))
                .nullable()
                .optional(),
            stated_tax_total: yen.nullable().optional().describe('Total consumption tax printed on the document'),
            stated_total: yen.nullable().optional().describe('Grand total (請求金額) printed on the document'),
            lang,
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async (args) => json(checkTax(args, resolveLang(args.lang))));
    server.registerTool('suggest_filename', {
        title: 'Suggest a file name / ファイル名の案',
        description: 'Suggests a file name with the transaction date, counterparty and amount in a fixed order, which satisfies the search ' +
            'requirement of the Electronic Bookkeeping Act (NTA Q&A Q50, e.g. "20261031_㈱見本商事_110000.pdf"). Does not touch any file.',
        inputSchema: {
            date: z.string().describe('Transaction date: 2026-10-31, 2026/10/31, 20261031, 令和8年10月31日, R8.10.31'),
            counterparty: z.string(),
            amount: yen,
            extension: optText,
            order: z.array(z.enum(['date', 'counterparty', 'amount'])).length(3).nullable().optional(),
            separator: optText,
            abbreviate_corporate_type: z.boolean().nullable().optional().describe('株式会社→㈱, 有限会社→㈲ (default true)'),
            suffix: optText.describe('Optional suffix such as 請求書 or 領収書'),
            lang,
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async (args) => json(suggestFilename(args, resolveLang(args.lang))));
    server.registerTool('list_sources', {
        title: 'List official sources / 根拠の一覧',
        description: 'Lists the official sources (laws and NTA documents) that the checks are based on.',
        inputSchema: { lang },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async ({ lang: l }) => {
        const lg = resolveLang(l);
        return json(allSources().map((s) => ({ id: s.id, title: s.title[lg], locator: s.locator[lg], url: s.url })));
    });
    return server;
}
