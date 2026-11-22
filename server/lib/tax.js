// Consumption tax check for one invoice (Order Art. 70-10, NTA overview p. 7):
// the tax is computed once per rate on the per-rate total, rounding to the yen by any method.
// Computing tax per line and adding it up is not allowed.
import { Findings } from "./finding.js";
import { ROUNDINGS, taxForGroup } from "./money.js";
import { formatCandidates, roundingLabel } from "../i18n/index.js";
const BASIS = ['NTA_OVERVIEW_P7', 'ORDER_70_10'];
export function checkTax(input, lang) {
    const f = new Findings(lang);
    const lines = input.lines ?? [];
    const summaries = input.rate_summaries ?? [];
    const intFields = [
        ...lines.map((l, i) => [`lines[${i}].amount`, l.amount]),
        ...lines.map((l, i) => [`lines[${i}].stated_tax`, l.stated_tax]),
        ...summaries.map((s) => [`rate_summaries(${s.rate}%).amount`, s.amount]),
        ...summaries.map((s) => [`rate_summaries(${s.rate}%).stated_tax`, s.stated_tax]),
        ['stated_tax_total', input.stated_tax_total],
        ['stated_total', input.stated_total],
    ];
    for (const [field, v] of intFields) {
        if (v !== null && v !== undefined && !Number.isSafeInteger(v)) {
            f.add('error', 'AMOUNT_NOT_INTEGER', { field, params: { field, value: v } });
        }
    }
    if (f.errors > 0) {
        return {
            ok: false,
            amount_basis: input.amount_basis,
            groups: [],
            non_taxable_total: 0,
            computed_total: { floor: 0, round: 0, ceil: 0 },
            findings: f.items,
        };
    }
    const rates = [...new Set([
            ...lines.filter((l) => l.rate !== 0).map((l) => l.rate),
            ...summaries.map((s) => s.rate),
        ])].sort((a, b) => b - a);
    const groups = [];
    for (const rate of rates) {
        const field = `rate_${rate}`;
        const rateLines = lines.filter((l) => l.rate === rate);
        const summary = summaries.find((s) => s.rate === rate);
        const lineSum = rateLines.reduce((a, l) => a + l.amount, 0);
        let base;
        let baseSource;
        if (summary?.amount !== null && summary?.amount !== undefined) {
            base = summary.amount;
            baseSource = 'summary';
            if (rateLines.length > 0 && lineSum !== base) {
                f.add('error', 'TAX_GROUP_SUM_MISMATCH', {
                    field,
                    params: { rate, stated: base, computed: lineSum },
                    basis: ['CTA_57_4_1'],
                });
            }
        }
        else {
            base = lineSum;
            baseSource = 'lines';
        }
        const computed = taxForGroup(base, rate, input.amount_basis);
        const lineTaxes = rateLines.map((l) => l.stated_tax);
        const allLinesTaxed = rateLines.length > 0 && lineTaxes.every((x) => typeof x === 'number');
        const lineTaxSum = allLinesTaxed ? lineTaxes.reduce((a, b) => a + b, 0) : null;
        const statedTax = summary?.stated_tax !== null && summary?.stated_tax !== undefined ? summary.stated_tax : lineTaxSum;
        let matching = [];
        if (statedTax === null) {
            f.add('warning', 'TAX_NOT_STATED', {
                field,
                params: { rate, expected: formatCandidates(lang, computed) },
                basis: ['CTA_57_4_1', ...BASIS],
            });
        }
        else {
            matching = ROUNDINGS.filter((m) => computed[m] === statedTax);
            if (matching.length > 0) {
                f.add('info', 'TAX_MATCH', {
                    field,
                    params: {
                        rate,
                        stated: statedTax,
                        methods: matching.map((m) => roundingLabel(lang, m)).join(lang === 'ja' ? '・' : ', '),
                    },
                    basis: BASIS,
                });
                if (allLinesTaxed && summary?.stated_tax !== null && summary?.stated_tax !== undefined && lineTaxSum !== statedTax) {
                    f.add('info', 'LINE_TAX_REFERENCE', { field, params: { rate }, basis: ['NTA_OVERVIEW_P7'] });
                }
            }
            else if (lineTaxSum !== null && statedTax === lineTaxSum) {
                f.add('error', 'TAX_PER_LINE_ROUNDING', {
                    field,
                    params: { rate, lineSum: lineTaxSum, expected: formatCandidates(lang, computed) },
                    basis: BASIS,
                });
            }
            else {
                f.add('error', 'TAX_MISMATCH', {
                    field,
                    params: { rate, stated: statedTax, base, ...computed },
                    basis: BASIS,
                });
            }
        }
        groups.push({
            rate,
            base,
            base_source: baseSource,
            stated_tax: statedTax,
            computed,
            matching_methods: matching,
        });
    }
    if (groups.length === 2 && groups.every((g) => g.matching_methods.length > 0)) {
        const [a, b] = groups;
        if (!a.matching_methods.some((m) => b.matching_methods.includes(m))) {
            f.add('info', 'MIXED_ROUNDING', { basis: ['NTA_OVERVIEW_P7'] });
        }
    }
    // Total tax printed on the document.
    if (input.stated_tax_total !== null && input.stated_tax_total !== undefined) {
        const allStated = groups.every((g) => g.stated_tax !== null);
        const sum = (m) => groups.reduce((a, g) => a + (allStated ? g.stated_tax : g.computed[m]), 0);
        const ok = allStated ? sum('floor') === input.stated_tax_total : ROUNDINGS.some((m) => sum(m) === input.stated_tax_total);
        if (!ok) {
            f.add('error', 'TAX_TOTAL_MISMATCH', {
                field: 'stated_tax_total',
                params: { stated: input.stated_tax_total, computed: sum('floor') },
            });
        }
    }
    // Grand total.
    const nonTaxable = lines.filter((l) => l.rate === 0).reduce((a, l) => a + l.amount, 0);
    const totalFor = (m) => groups.reduce((a, g) => a + g.base + (input.amount_basis === 'excluding_tax' ? (g.stated_tax ?? g.computed[m]) : 0), 0) + nonTaxable;
    const computedTotal = { floor: totalFor('floor'), round: totalFor('round'), ceil: totalFor('ceil') };
    if (input.stated_total !== null && input.stated_total !== undefined) {
        if (ROUNDINGS.some((m) => computedTotal[m] === input.stated_total)) {
            f.add('info', 'TOTAL_MATCH', { field: 'stated_total', params: { stated: input.stated_total } });
        }
        else {
            f.add('error', 'TOTAL_MISMATCH', {
                field: 'stated_total',
                params: { stated: input.stated_total, computed: computedTotal.floor },
            });
        }
    }
    return {
        ok: f.errors === 0,
        amount_basis: input.amount_basis,
        groups,
        non_taxable_total: nonTaxable,
        computed_total: computedTotal,
        findings: f.items,
    };
}
