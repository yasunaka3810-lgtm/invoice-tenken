export const ROUNDINGS = ['floor', 'round', 'ceil'];
/**
 * Exact num/den rounded to a whole yen. Works on the absolute value and restores the sign,
 * so "floor" means toward zero for negative amounts (returns and discounts).
 */
export function roundRatio(num, den, mode) {
    if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den) || den <= 0) {
        throw new Error('roundRatio needs safe integers and a positive denominator');
    }
    const sign = num < 0 ? -1n : 1n;
    const n = BigInt(Math.abs(num));
    const d = BigInt(den);
    let q = n / d;
    const r = n % d;
    if (mode === 'ceil' && r > 0n)
        q += 1n;
    if (mode === 'round' && 2n * r >= d)
        q += 1n;
    return Number(sign * q);
}
/** Consumption tax for one rate group (Order Art. 70-10): rate/100 on tax-excluded totals,
 *  rate/(100+rate) on tax-included totals. */
export function taxForGroup(base, rate, basis) {
    const den = basis === 'excluding_tax' ? 100 : 100 + rate;
    const num = base * rate;
    return {
        floor: roundRatio(num, den, 'floor'),
        round: roundRatio(num, den, 'round'),
        ceil: roundRatio(num, den, 'ceil'),
    };
}
