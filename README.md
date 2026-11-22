# Invoice Tenken — Japanese invoice checker for Claude

[日本語](README.ja.md)

Invoice Tenken (インボイス点検) helps Claude check Japanese invoices and receipts against the qualified invoice system (インボイス制度 / 適格請求書等保存方式). Give Claude a PDF or photo of an invoice and ask it to check it. Claude reads the document, and this plugin's tools check the required items, the issuer's registration number, the consumption tax per rate and its rounding, and suggest file names for the Electronic Bookkeeping Act. Every finding cites its official source.

> This is a checking aid, not tax advice. Final decisions are yours or your tax accountant's.

## What it checks

| Tool | What it does |
|---|---|
| `check_invoice_fields` | Required items of qualified invoices, simplified invoices (receipts) and return invoices — Consumption Tax Act Art. 57-4 |
| `check_tax` | Consumption tax per rate (10% / 8%): which rounding method matches, tax rounded line by line (not allowed), totals — Enforcement Order Art. 70-10 |
| `check_registration_number` | Registration number format ("T" + 13 digits) and the corporate-number check digit |
| `suggest_filename` | File names with date, counterparty and amount in a fixed order (NTA e-bookkeeping Q&A Q50), e.g. `20261031_㈱みほん商事_142819.pdf` (a fictitious company) |
| `list_sources` | The official sources the checks are based on |

The skill `invoice-tenken` tells Claude the procedure: read the document, pass exactly what is printed (never guessing missing values), run the tools, and report errors, warnings and notes with their legal basis.

## Sources

Only official sources are used: the Consumption Tax Act and its Enforcement Order (e-Gov) and National Tax Agency documents (the qualified invoice overview, the invoice Q&A, the e-bookkeeping Q&A, the corporate number specification). See [skills/invoice-tenken/references/rules.en.md](skills/invoice-tenken/references/rules.en.md).

## Where it runs

- **Claude Code** and **Cowork** (on your computer): the skill and the tools.
- **Claude chat**: the skill loads, but plugin tools that run on your computer are not started in chat. Claude then follows the same rules by hand and says so in the report.

The tools run on your computer with Node.js. Nothing is sent over the network by this plugin. See [PRIVACY.md](PRIVACY.md).

## Install for one Claude Code session

```
claude --plugin-dir ./invoice-tenken
```

## Development notes

The JavaScript in `server/` is plain, readable code compiled from TypeScript. Dependencies (`@modelcontextprotocol/sdk`, `zod`) are pinned in `package-lock.json`.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Yasuyoshi Nakamura.
