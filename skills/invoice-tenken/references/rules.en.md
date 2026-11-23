# Rules and sources (English)

Every rule comes from official sources only. When a source gets a new edition, update this table and `server/src/lib/sources.ts` together. English wording is an explanatory translation; the Japanese originals are authoritative.

| What is checked | Rule | Source |
|---|---|---|
| Qualified invoice (適格請求書) items | (1) issuer name and registration number (2) transaction date (or period) (3) description, and a statement that reduced-rate items are reduced-rate (4) per-rate total of the consideration (tax excluded or included) and the applicable rate (5) per-rate consumption tax (6) recipient name | Consumption Tax Act Art. 57-4(1); NTA "Overview of the Qualified Invoice System" (Apr. 2026) p. 4 |
| How to show reduced-rate items | anything that makes it objectively clear: the rate printed on each line, a mark (＊, ※) explained on the document, a separate labelled section, or a separate invoice for reduced-rate items | NTA "Q&A on the Qualified Invoice System" (rev. May 2026) Q73 |
| Simplified invoice (適格簡易請求書) items | (1)–(4) as above (rate not required in 4), (5) tax amount **or** applicable rate; no recipient | Act Art. 57-4(2); overview p. 4 |
| Who may issue simplified invoices | retail, restaurants, photo studios, travel agencies, taxis, parking for the general public, and similar businesses selling to many unspecified customers | Enforcement Order Art. 70-11 |
| Return invoice (適格返還請求書) items | (1) issuer and number (2) date of return and date of the original sale (3) description (4) per-rate return amounts (5) tax amount or applicable rate | Act Art. 57-4(3); overview p. 8 |
| Return invoice exemption | not required when the return is under ¥10,000 including tax | Order Art. 70-9(3)(ii); overview p. 8 |
| Several documents / code tables | clearly linked documents may together satisfy the items; a number shared in a customer code table counts as written | overview p. 6 |
| Tax calculation and rounding | per-rate total × 10/100 or 8/100 (excluded) or × 10/110 or 8/108 (included); round to the yen once per rate per invoice, by any method; per-line rounding then summing is not allowed | Order Art. 70-10; overview p. 7 |
| Registration number format | corporations: "T" + corporate number (13 digits); others: "T" + 13 digits that are neither a My Number nor a corporate number | NTA publication site, "What is a registration number" |
| Corporate number check digit | 9 − (Σ Pn×Qn mod 9); Pn = n-th digit of the 12-digit base from the right, Qn = 1 (n odd) / 2 (n even) | NTA "Composition of the Corporate Number" (Ministerial Ordinance Art. 2) |
| Check digit of other numbers | no published rule found → a mismatch is only "check manually" | (no official statement) |
| Lookup | Web-API `/1/num` (by number) and `/1/valid` (number and date), up to 10 per request; each user needs their own ID, which must not be shared; show the Art. 6 attribution | Web-API spec Part 2 (Ver. 1.0); Web-API Terms Art. 6, 9 |
| E-bookkeeping file names | include transaction date, amount and counterparty in a fixed order (e.g. `20210131_㈱霞商店_110000`); amount with or without tax, consistently; monthly statements may use issue date and total | NTA e-bookkeeping Q&A (electronic transactions, Jul. 2026) Q50, Q57, Q55 |
| When search functions are not required | e.g. sales in the base period of ¥50 million or less and the data can be provided on a tax official's request | same Q&A, Q51 |

Source URLs are listed in `rules.ja.md`.
