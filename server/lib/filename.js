// File names that satisfy the search requirement of the Electronic Bookkeeping Act by
// "putting the date, amount and counterparty into the file name in a fixed order"
// (NTA e-bookkeeping Q&A, Q50: e.g. "20210131_㈱霞商店_110000").
import { Findings } from "./finding.js";
const FORBIDDEN = /[\\/:*?"<>|\u0000-\u001f]/g;
const ERAS = [
    { names: ['令和', 'R'], start: 2018 },
    { names: ['平成', 'H'], start: 1988 },
];
/** Accepts YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYYMMDD, YYYY年M月D日, 令和N年M月D日 (元年 too), R8.10.31. */
export function parseDate(input) {
    const s = (input ?? '').normalize('NFKC').trim();
    let y, m, d;
    let era;
    let mt = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/);
    if (mt) {
        [y, m, d] = [Number(mt[1]), Number(mt[2]), Number(mt[3])];
    }
    else if ((mt = s.match(/^(\d{4})(\d{2})(\d{2})$/))) {
        [y, m, d] = [Number(mt[1]), Number(mt[2]), Number(mt[3])];
    }
    else if ((mt = s.match(/^(令和|平成|R|H)\s*(\d{1,2}|元)[年.\-/](\d{1,2})[月.\-/](\d{1,2})日?$/i))) {
        const name = mt[1].toUpperCase();
        const e = ERAS.find((x) => x.names.includes(name) || x.names.includes(mt[1]));
        if (!e)
            return null;
        const n = mt[2] === '元' ? 1 : Number(mt[2]);
        [y, m, d] = [e.start + n, Number(mt[3]), Number(mt[4])];
        era = s;
    }
    else {
        return null;
    }
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d)
        return null;
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return era ? { iso, era } : { iso };
}
export function suggestFilename(input, lang) {
    const f = new Findings(lang);
    const parsed = parseDate(input.date);
    if (!parsed) {
        f.add('error', 'FILENAME_BAD_DATE', { field: 'date', params: { value: input.date } });
        return { ok: false, filename: null, date: null, findings: f.items };
    }
    if (parsed.era) {
        f.add('info', 'FILENAME_ERA_CONVERTED', { params: { from: parsed.era, to: parsed.iso } });
    }
    if (!Number.isSafeInteger(input.amount)) {
        f.add('error', 'AMOUNT_NOT_INTEGER', { field: 'amount', params: { field: 'amount', value: input.amount } });
        return { ok: false, filename: null, date: parsed.iso, findings: f.items };
    }
    let party = (input.counterparty ?? '').trim().replace(/\s+/g, ' ');
    if (input.abbreviate_corporate_type !== false) {
        party = party.replace(/株式会社/g, '㈱').replace(/有限会社/g, '㈲');
    }
    const removed = [...new Set(party.match(FORBIDDEN) ?? [])].filter((c) => c >= ' ');
    party = party.replace(FORBIDDEN, '').replace(/\s/g, '').replace(/^[.]+|[.]+$/g, '');
    if (removed.length > 0)
        f.add('info', 'FILENAME_CHARS_REMOVED', { params: { chars: removed.join(' ') } });
    const parts = {
        date: parsed.iso.replaceAll('-', ''),
        counterparty: party,
        amount: String(input.amount),
    };
    const order = input.order && input.order.length === 3 ? input.order : ['date', 'counterparty', 'amount'];
    const sep = (input.separator ?? '_').replace(FORBIDDEN, '') || '_';
    let stem = order.map((p) => parts[p]).join(sep);
    const suffix = (input.suffix ?? '').replace(FORBIDDEN, '').trim();
    if (suffix)
        stem += sep + suffix;
    if (stem.length > 150)
        stem = stem.slice(0, 150);
    let ext = (input.extension ?? '.pdf').trim();
    if (ext && !ext.startsWith('.'))
        ext = '.' + ext;
    ext = ext.replace(FORBIDDEN, '').toLowerCase();
    f.add('info', 'FILENAME_CONSISTENCY', { basis: ['DENCHO_Q50', 'DENCHO_Q57'] });
    f.add('info', 'FILENAME_MONTHLY', { basis: ['DENCHO_Q55'] });
    return { ok: true, filename: stem + ext, date: parsed.iso, findings: f.items };
}
