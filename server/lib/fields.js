// Required items of qualified invoices (Consumption Tax Act Art. 57-4, NTA overview p. 4 and p. 8).
//   qualified  (57-4(1)): issuer name + registration number / date / description (+ reduced-rate
//                         indication) / per-rate totals and applicable rate / per-rate tax / recipient
//   simplified (57-4(2)): same without the recipient; tax amount OR applicable rate
//   return     (57-4(3)): issuer + number / return date and original sale date / description /
//                         per-rate return totals / tax amount OR applicable rate
import { Findings } from "./finding.js";
import { checkRegNo } from "./regno.js";
const present = (v) => v !== null && v !== undefined && !(typeof v === 'string' && v.trim() === '');
export function checkFields(input, lang) {
    const f = new Findings(lang);
    const type = input.document_type;
    const law = type === 'qualified' ? 'CTA_57_4_1' : type === 'simplified' ? 'CTA_57_4_2' : 'CTA_57_4_3';
    const page = type === 'return' ? 'NTA_OVERVIEW_P8' : 'NTA_OVERVIEW_P4';
    const basis = [law, page];
    const items = input.items ?? [];
    const summaries = input.rate_summaries ?? [];
    // (1) issuer name and registration number
    if (!present(input.issuer_name))
        f.add('error', 'ISSUER_NAME_MISSING', { field: 'issuer_name', basis });
    let regno = null;
    if (!present(input.registration_number)) {
        f.add('error', 'REGNO_MISSING', { field: 'registration_number', basis: [...basis, 'NTA_OVERVIEW_P6'] });
    }
    else {
        regno = checkRegNo(input.registration_number, lang);
        f.items.push(...regno.findings);
    }
    // (2) dates
    if (type === 'return') {
        if (!present(input.return_date))
            f.add('error', 'RETURN_DATE_MISSING', { field: 'return_date', basis });
        if (!present(input.original_transaction_date)) {
            f.add('error', 'ORIGINAL_DATE_MISSING', { field: 'original_transaction_date', basis });
        }
    }
    else if (!present(input.transaction_date) && !present(input.transaction_period)) {
        f.add('error', 'DATE_MISSING', { field: 'transaction_date', basis });
    }
    // (3) description and reduced-rate indication
    if (!items.some((i) => present(i.description))) {
        f.add('error', 'CONTENT_MISSING', { field: 'items', basis });
    }
    // Shown if the rate is printed on the line, or a mark is explained by a legend, or the item is
    // in a section labelled as reduced-rate (NTA invoice Q&A Q73).
    const reducedUnmarked = items.filter((i) => i.rate === 8 &&
        i.rate_printed !== true &&
        !(i.marked_reduced === true && input.reduced_rate_legend === true) &&
        input.reduced_rate_section !== true);
    if (reducedUnmarked.length > 0) {
        f.add('warning', 'REDUCED_INDICATION_MISSING', {
            field: 'items',
            params: { count: reducedUnmarked.length },
            basis: [...basis, 'NTA_INVOICE_QA_73'],
        });
    }
    // (4)(5) per-rate totals, applicable rate, tax amount
    const rates = [...new Set([
            ...items.filter((i) => i.rate === 10 || i.rate === 8).map((i) => i.rate),
            ...summaries.map((s) => s.rate),
        ])].sort((a, b) => b - a);
    if (rates.length === 0) {
        f.add('warning', 'NO_RATE_INFO', { field: 'rate_summaries', basis });
    }
    for (const rate of rates) {
        const s = summaries.find((x) => x.rate === rate);
        const field = `rate_${rate}`;
        if (!present(s?.amount))
            f.add('error', 'RATE_TOTAL_MISSING', { field, params: { rate }, basis });
        const rateShown = s?.rate_shown === true;
        const taxShown = present(s?.tax_amount);
        if (type === 'qualified') {
            if (!rateShown)
                f.add('error', 'RATE_NOT_SHOWN', { field, params: { rate }, basis });
            if (!taxShown)
                f.add('error', 'TAX_AMOUNT_MISSING', { field, params: { rate }, basis });
        }
        else if (!rateShown && !taxShown) {
            f.add('error', 'TAX_OR_RATE_MISSING', { field, params: { rate }, basis });
        }
    }
    // (6) recipient
    if (type === 'qualified' && !present(input.recipient_name)) {
        f.add('error', 'RECIPIENT_MISSING', { field: 'recipient_name', basis });
    }
    if (type === 'simplified') {
        if (!present(input.recipient_name))
            f.add('info', 'RECIPIENT_NOT_REQUIRED', { field: 'recipient_name', basis });
        f.add('info', 'SIMPLIFIED_SCOPE', { basis: ['ORDER_70_11', 'NTA_OVERVIEW_P4'] });
    }
    if (type === 'return' && present(input.return_amount_including_tax) && input.return_amount_including_tax < 10000) {
        f.add('info', 'RETURN_UNDER_10000', {
            params: { amount: input.return_amount_including_tax },
            basis: ['ORDER_70_9_3', 'NTA_OVERVIEW_P8'],
        });
    }
    if (f.errors > 0) {
        f.add('info', 'SEVERAL_DOCUMENTS', { basis: ['NTA_OVERVIEW_P6'] });
    }
    else if (f.warnings === 0) {
        f.add('info', 'ALL_PRESENT', { basis });
    }
    return {
        ok: f.errors === 0,
        document_type: type,
        errors: f.errors,
        warnings: f.warnings,
        registration_number: regno,
        findings: f.items,
    };
}
