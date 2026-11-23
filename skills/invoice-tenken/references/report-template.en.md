# Report template (English)

```
## Check result: <file name>
Verdict: ❌ Needs fixing (2 errors, 1 warning) / ✅ No problems found
Method: checked with the invoice-tenken tools / checked by hand because the tools were not available (turn on the Invoice Tenken extension)

### What was read (please check for reading mistakes)
| Item | On the document |
|---|---|
| Document type | Qualified invoice (適格請求書) |
| Issuer | 株式会社〇〇 |
| Registration number | T1234567890123 |
| Transaction date | 2026-10-31 (October statement) |
| Recipient | 株式会社△△ |
| 10% items | ¥123,255 (tax ¥12,325) |
| 8% items | ¥6,703 (tax ¥536) |
| Grand total | ¥142,819 |

### Errors (must be fixed)
1. <message> — Basis: Consumption Tax Act Art. 57-4(1) (URL)

### Warnings (need a human look)
1. <message> — Basis: …

### Confirmed
- The 10% tax amount is correct (rounding: round down)

### Notes
- Missing items may be supplied by a clearly linked document such as the delivery note (NTA overview p. 6).
- This check is an aid. The final judgement is yours or your tax accountant's.
```

When `lookup_registration` was used, end with the attribution required by Art. 6 of the Web-API terms — the Japanese text verbatim, then the English translation returned by the tool:

> このサービスは、適格請求書発行事業者公表システムWeb-API機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない
