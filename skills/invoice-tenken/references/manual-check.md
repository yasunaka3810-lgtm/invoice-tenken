# Checking by hand (when the invoice-tenken tools are not available)

This file repeats, step by step, exactly what the tools check, so a check done by hand finds the same problems. Sources are in `rules.en.md` / `rules.ja.md`. Do every step; do not skip one because the document "looks fine".

**Arithmetic:** if you can run code (code execution), do all sums and rounding in code with whole numbers. Never round by eye.

**Severity words:** error = must be fixed; warning = needs a human look; info = passed or context. Use these levels exactly as below.

## A. Registration number (登録番号)

1. Normalize what is printed: full-width → half-width (Ｔ１２ → T12), remove spaces, hyphens (- ‐ ‑ – — − ー) and labels such as 「登録番号」「：」, lowercase t → T. Say that you normalized it.
2. The form is "T" + 13 digits (NTA "What is a registration number").
   - 13 digits without "T" → **error**. Wrong number of digits → **error**. Any non-digit → **error**. Stop here for this number.
3. Check digit (corporate numbers; Ministerial Ordinance on Designation of Corporate Numbers Art. 2): take the 12 digits after the first digit. Number them n = 1 … 12 **from the right**. Pn = the digit, Qn = 1 if n is odd, 2 if n is even. Check digit = 9 − (Σ Pn × Qn mod 9), always 1–9.
   - Worked example: T7000012050002 (the NTA's own corporate number). Base 000012050002; from the right: P1=2 (×1), P5=5 (×1), P7=2 (×1), P8=1 (×2), others 0 → Σ = 2+5+2+2 = 11; 11 mod 9 = 2; 9 − 2 = 7 = the first digit ✓.
   - Equal → **info**: "the 13 digits are a well-formed corporate number; whether the business is registered can only be confirmed on the NTA publication site".
   - Not equal → **warning** (not an error): "does not match the corporate-number check digit; if the issuer is a corporation the number is wrong; numbers of sole proprietors and unincorporated associations have no published check digit rule — confirm on the NTA publication site (https://www.invoice-kohyo.nta.go.jp/)".

## B. Required items (Consumption Tax Act Art. 57-4; NTA overview p. 4, p. 8)

For each item that is missing, report it at the level shown.

| Item | qualified 適格請求書 | simplified 簡易 | return 返還 |
|---|---|---|---|
| Issuer name | error | error | error |
| Registration number (form checked as in A) | error ¹ | error ¹ | error ¹ |
| Transaction date, or the period of a statement | error | error | — |
| Date of the return **and** date of the original sale | — | — | error each |
| Description of goods or services | error | error | error |
| Reduced-rate indication for every 8% item ² | warning | warning | warning |
| Per-rate total (or per-rate return total) for each rate used | error | error | error |
| Applicable rate printed next to each per-rate total | error | — ³ | — ³ |
| Per-rate consumption tax | error | — ³ | — ³ |
| Recipient name (宛名) | error | info: not required | — |

1. A number shared separately, for example in a customer code table, counts as written (NTA overview p. 6) — say so when the number is missing.
2. An 8% item counts as indicated if **any** of these is true (NTA invoice Q&A Q73): the rate is printed on its line; it has a mark (＊, ※ …) **and** the document explains the mark; it is listed in a section labelled as reduced-rate; or reduced-rate items are on a separate invoice that says so.
3. Simplified and return invoices need the per-rate tax **or** the applicable rate: **error** only if neither is shown.

Also:
- Simplified invoice → **info**: only retail, restaurant, photo, travel, taxi, public parking and similar businesses selling to many unspecified customers may issue it (Order Art. 70-11). Do not decide whether this issuer qualifies.
- Return of less than ¥10,000 including tax → **info**: the issuer is not obliged to issue a return invoice (Order Art. 70-9(3)(ii)).
- If any error was found → **info**: clearly linked documents (for example the delivery note) may together satisfy the items (NTA overview p. 6).
- No error and no warning → **info**: all required items are present.

## C. Consumption tax (Order Art. 70-10; NTA overview p. 7)

Do this for each rate (10% and 8%) separately. Non-taxable lines (0%) only count toward the grand total.

1. **Base.** Use the printed per-rate total. If lines are printed too, their sum must equal it → otherwise **error** (state both figures).
2. **Exact tax.** n = base × r; d = 100 for tax-excluded amounts, 100 + r for tax-included amounts (r = 10 or 8).
3. **Three candidates (whole yen).** floor = n ÷ d rounded toward zero; remainder = n − floor × d. round-up = floor + 1 if remainder > 0, else floor. half-up = floor + 1 if 2 × remainder ≥ d, else floor. For a negative base (returns, discounts) work on the absolute value and put the sign back.
4. **Compare with the printed tax for this rate.**
   - Equal to one or more candidates → **info**, naming the matching methods (round down / half up / round up). The law allows any method.
   - If every line prints its own tax, the printed per-rate tax equals the sum of those line taxes, and it matches no candidate → **error**: the tax was rounded line by line and added up, which is not allowed; give the three correct candidates.
   - Otherwise no match → **error**, giving the base and the three candidates.
   - Per-rate tax correct but the printed line taxes add up to something else → **info**: line taxes are for reference only.
   - No tax printed for this rate → **warning**, giving the three candidates (for a qualified invoice B already reported the missing item as an error).
5. **Different methods per rate** (the two rates have no matching method in common) → **info**: allowed, but check that the issuer is consistent.
6. **Total tax.** If a total tax is printed, it must equal the sum of the per-rate taxes → otherwise **error**.
7. **Grand total.** Tax-excluded: Σ bases + Σ per-rate taxes + non-taxable lines. Tax-included: Σ bases + non-taxable lines. Use the printed per-rate tax where printed; where not printed, the total may match any candidate. Mismatch → **error** (give both figures); match → **info**.

## D. File names (NTA e-bookkeeping Q&A Q50, Q55, Q57)

`YYYYMMDD_取引先_金額.ext` — e.g. `20210131_㈱霞商店_110000.pdf` (the NTA example). Write 株式会社 as ㈱ and 有限会社 as ㈲ like the example, remove characters that cannot be in file names (\ / : * ? " < > |), convert Japanese era dates (令和元年 = 2019, 令和8年 = 2026). Keep the same order and the same choice of amount with or without tax throughout a tax period; a monthly statement may use its issue date and total.

## E. In the report

- Write 「点検の方法: 手で点検（道具なし）」 / "Method: checked by hand (no tools)".
- Use the levels above and give the source of each finding.
- If the user wants the checks done by the tools instead, the free tools are at https://github.com/yasunaka3810-lgtm/invoice-tenken (Claude Code plugin; the Claude app extension is on the same page). Mention this once, only as a note.
