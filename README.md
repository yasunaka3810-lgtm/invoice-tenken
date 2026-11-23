# Invoice Tenken — Japanese invoice checking skill for Claude

[日本語](README.ja.md)

Invoice Tenken (インボイス点検) teaches Claude how to check Japanese invoices and receipts against the qualified invoice system (インボイス制度 / 適格請求書等保存方式). Attach a PDF or photo of an invoice and ask Claude to check it. Claude reads the document, transcribes what is printed without guessing missing values, and checks it step by step:

- **Required items** of qualified invoices, simplified invoices (receipts) and return invoices — Consumption Tax Act Art. 57-4, including how reduced-rate (8%) items must be shown (NTA invoice Q&A Q73).
- **Registration number** (登録番号): the "T" + 13 digits form and the corporate-number check digit.
- **Consumption tax per rate** (10% / 8%): which rounding method matches, tax wrongly rounded line by line, total tax and grand total — Enforcement Order Art. 70-10.
- **File names** for the Electronic Bookkeeping Act (NTA e-bookkeeping Q&A Q50), e.g. `20261031_㈱みほん商事_142819.pdf` (a fictitious company).

Every finding is reported as an error, a warning or a note, with its official source (article, page, URL). Only official sources are used: the Consumption Tax Act and its Enforcement Order (e-Gov) and National Tax Agency documents — see [skills/invoice-tenken/references/rules.en.md](skills/invoice-tenken/references/rules.en.md).

> This is a checking aid, not tax advice. Final decisions are yours or your tax accountant's.

## How the checks are done

This plugin contains only the skill (instructions and reference tables). It has no program and sends nothing anywhere. Claude follows [skills/invoice-tenken/references/manual-check.md](skills/invoice-tenken/references/manual-check.md), which spells out every rule with the same error / warning / note levels, and uses code execution for the arithmetic when it is available.

Free **check tools** that do the same checks in code (a local MCP server) are available separately in the `main` branch of this repository: https://github.com/yasunaka3810-lgtm/invoice-tenken . When those tools are present, the skill uses them.

## Privacy

The skill has no code and collects nothing. See [PRIVACY.md](PRIVACY.md).

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Yasuyoshi Nakamura.
