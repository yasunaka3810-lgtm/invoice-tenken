// Registration numbers of qualified invoice issuers.
// Corporations: "T" + corporate number (13 digits). Others (sole proprietors, unincorporated
// associations): "T" + 13 digits that are not a My Number and do not overlap corporate numbers
// (NTA_REGNO). Only corporate numbers have a published check digit formula (CORP_NO_CHECK):
//   check digit = 9 - (sum_{n=1..12} Pn * Qn mod 9)
//   Pn = n-th digit of the 12-digit base counted from the lowest digit, Qn = 1 (n odd) / 2 (n even)
import { Findings } from "./finding.js";
const FIX_LABELS = {
    en: {
        fullwidth: 'full-width characters made half-width',
        label: 'label removed',
        spaces: 'spaces removed',
        hyphens: 'hyphens removed',
        lowercase: 'lowercase t made T',
    },
    ja: {
        fullwidth: '全角を半角に',
        label: '「登録番号」などの見出しを除去',
        spaces: '空白を除去',
        hyphens: 'ハイフンを除去',
        lowercase: '小文字の t を T に',
    },
};
const HYPHENS = /[-‐‑‒–—―−－ｰー]/g;
const LABELS = /(適格請求書発行事業者)?登録番号|registration\s*(number|no\.?)|reg\.?\s*no\.?|番号|no\.?|[:：]/gi;
/** Check digit of a 13-digit corporate number computed from its 12-digit base. */
export function corporateCheckDigit(base12) {
    if (!/^\d{12}$/.test(base12))
        throw new Error('base must be 12 digits');
    let sum = 0;
    for (let n = 1; n <= 12; n++) {
        const p = Number(base12[12 - n]);
        sum += p * (n % 2 === 1 ? 1 : 2);
    }
    return 9 - (sum % 9);
}
export function normalizeRegNo(input) {
    const fixes = [];
    let s = input ?? '';
    const nfkc = s.normalize('NFKC');
    if (nfkc !== s)
        fixes.push('fullwidth');
    s = nfkc;
    const noLabel = s.replace(LABELS, '');
    if (noLabel !== s)
        fixes.push('label');
    s = noLabel;
    const noSpace = s.replace(/\s+/g, '');
    if (noSpace !== s)
        fixes.push('spaces');
    s = noSpace;
    const noHyphen = s.replace(HYPHENS, '');
    if (noHyphen !== s)
        fixes.push('hyphens');
    s = noHyphen;
    if (s.startsWith('t')) {
        s = 'T' + s.slice(1);
        fixes.push('lowercase');
    }
    return { value: s, fixes };
}
export function checkRegNo(input, lang) {
    const f = new Findings(lang);
    const { value, fixes } = normalizeRegNo(input);
    const base = {
        input,
        normalized: null,
        format: 'ok',
        check_digit: 'not_checked',
        fixes,
    };
    const done = (r) => ({ ...r, findings: f.items });
    if (value === '') {
        f.add('error', 'REGNO_EMPTY', { field: 'registration_number', basis: ['CTA_57_4_1', 'NTA_REGNO'] });
        return done({ ...base, format: 'empty' });
    }
    if (fixes.length > 0) {
        const sep = lang === 'ja' ? '・' : ', ';
        f.add('info', 'REGNO_NORMALIZED', {
            field: 'registration_number',
            params: { fixes: fixes.map((x) => FIX_LABELS[lang][x] ?? x).join(sep) },
        });
    }
    const hasT = value.startsWith('T');
    const digits = hasT ? value.slice(1) : value;
    const bad = [...new Set(digits.replace(/\d/g, '').split(''))];
    if (bad.length > 0) {
        f.add('error', 'REGNO_NON_DIGIT', {
            field: 'registration_number',
            params: { chars: bad.join(' ') },
            basis: ['NTA_REGNO'],
        });
        return done({ ...base, format: 'non_digit' });
    }
    if (digits.length !== 13) {
        f.add('error', 'REGNO_WRONG_LENGTH', {
            field: 'registration_number',
            params: { length: digits.length },
            basis: ['NTA_REGNO'],
        });
        return done({ ...base, format: 'wrong_length' });
    }
    if (!hasT) {
        f.add('error', 'REGNO_MISSING_T', { field: 'registration_number', basis: ['NTA_REGNO'] });
        return done({ ...base, format: 'missing_t' });
    }
    const expected = corporateCheckDigit(digits.slice(1));
    const actual = Number(digits[0]);
    if (expected === actual) {
        f.add('info', 'REGNO_CHECK_MATCH', { field: 'registration_number', basis: ['CORP_NO_CHECK', 'NTA_REGNO'] });
    }
    else {
        f.add('warning', 'REGNO_CHECK_MISMATCH', {
            field: 'registration_number',
            params: { expected, actual },
            basis: ['CORP_NO_CHECK', 'NTA_REGNO'],
        });
    }
    return done({
        ...base,
        normalized: 'T' + digits,
        check_digit: expected === actual ? 'match' : 'mismatch',
        expected_check_digit: expected,
    });
}
