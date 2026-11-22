import { en } from "./en.js";
import { ja } from "./ja.js";
const dict = { en, ja };
/** Explicit argument, then INVOICE_TENKEN_LANG, then English (the source language). */
export function resolveLang(arg, env = process.env) {
    const pick = (v) => {
        if (!v)
            return null;
        const s = v.toLowerCase();
        if (s.startsWith('ja'))
            return 'ja';
        if (s.startsWith('en'))
            return 'en';
        return null;
    };
    return pick(arg) ?? pick(env.INVOICE_TENKEN_LANG) ?? 'en';
}
export function t(lang, key, params = {}) {
    const fn = dict[lang][key];
    return fn(params);
}
export function roundingLabel(lang, mode) {
    const labels = {
        en: { floor: 'round down', round: 'round half up', ceil: 'round up' },
        ja: { floor: '切捨て', round: '四捨五入', ceil: '切上げ' },
    };
    return labels[lang][mode];
}
export function formatYen(lang, n) {
    return lang === 'ja' ? `${n.toLocaleString('ja-JP')}円` : `¥${n.toLocaleString('en-US')}`;
}
/** "round down ¥100 / round half up ¥101 / round up ¥101" in the given language. */
export function formatCandidates(lang, c) {
    const sep = lang === 'ja' ? '・' : ' / ';
    return ['floor', 'round', 'ceil']
        .map((m) => `${roundingLabel(lang, m)} ${formatYen(lang, c[m])}`)
        .join(sep);
}
