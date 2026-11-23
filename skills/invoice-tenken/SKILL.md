---
name: invoice-tenken
description: Check Japanese invoices and receipts (インボイス・適格請求書・領収書) from PDF or image — required items, 登録番号, 消費税 per rate and rounding, 電帳法 file names. Use for インボイスの点検.
---

# Invoice check (インボイスの点検)

Checks Japanese invoices and receipts against the qualified invoice system (適格請求書等保存方式) and reports what is missing or does not add up, with the legal basis of every finding.

## Ground rules

- **Official sources only.** Every rule here comes from the Consumption Tax Act and its Enforcement Order (e-Gov) and from National Tax Agency documents. They are listed with page numbers in `references/rules.en.md` / `references/rules.ja.md`. Never add a rule from memory or from third-party sites. If something is not covered, say so and point the user to the NTA (or a tax accountant) instead of guessing.
- **Transcribe, never invent.** Pass exactly what is printed. When an item is not on the document, pass `null`. When a figure is hard to read, say which one and how sure you are; do not "fix" it so the totals work.
- **No interpretations of your own.** Report what the tools and `references/` say. Do not decide from memory whether a business may issue simplified invoices, whether a layout satisfies a requirement, or how a special case is treated; say the check does not cover it and name the NTA document to consult.
- **Answer in the user's language.** Pass `lang: "ja"` or `lang: "en"` to every tool.
- **Nothing leaves the computer** except registration numbers sent to the NTA Web-API by `lookup_registration`, and only when the user has set their own application ID. Do not upload documents anywhere.
- **Files change only after approval.** Renaming is always two steps: `plan_renames` → show the plan → the user approves → `apply_renames` with `confirm: true`. Never pass `confirm: true` on your own.
- This is a check aid, not tax advice. Final judgement stays with the user and their tax accountant.

## Workflow

1. **Read the document.** Open the PDF or image (in Claude Code use the Read tool; in Claude Desktop the attachment). In Claude Code, read an invoice PDF **without** the `pages` parameter: rendering selected pages needs extra software (poppler) that many computers lack, while the whole file can be read without it. If a PDF still cannot be read, ask the user for a screenshot or photo of it instead of guessing. If one PDF holds several invoices, check each separately (NTA e-bookkeeping Q&A Q54). For a folder, call `list_documents` (if available) and go one file at a time.
2. **Decide the document type.**
   - `qualified` — 適格請求書: a bill, delivery note or statement addressed to a business.
   - `simplified` — 適格簡易請求書: a receipt or till slip from retail, restaurant, photo, travel, taxi or parking businesses (Order Art. 70-11). Usually has no recipient name.
   - `return` — 適格返還請求書: a credit note for returns, discounts or rebates.
   If unclear, ask the user.
3. **Extract the fields** (as printed):
   - issuer name and registration number (登録番号) exactly as printed, full-width characters and hyphens included;
   - transaction date, or the period for a monthly statement (e.g. "2026年10月分");
   - recipient name (宛名) — for `qualified`;
   - each line: description, amount in whole yen, rate (10 / 8 / 0 for non-taxable) **only if the document shows it** (a rate column, a mark such as ＊ or ※ with a legend, or lines grouped under "8%対象"), whether the rate is printed on the line (`rate_printed`) and whether it carries a reduced-rate mark (`marked_reduced`);
   - whether the document explains its reduced-rate mark (`reduced_rate_legend`), and whether reduced-rate items are listed in their own labelled section (`reduced_rate_section`);
   - per-rate totals: amount, whether the rate is printed next to it, and the tax printed for it;
   - whether amounts are tax-excluded (税抜) or tax-included (税込) — `amount_basis`;
   - total tax and grand total as printed; tax printed on each line, if any;
   - for `return`: return date, date of the original sale, and the return amount including tax.
4. **Run the checks with the tools** (if they are not available, see "Without the MCP server" below). The tools come from the MCP server `invoice-tenken`: in Claude Code the plugin, in the Claude app the extension "Invoice Tenken" / "Invoice Tenken Pro" (インボイス点検). Their names are `check_invoice_fields`, `check_tax`, `check_registration_number`, `suggest_filename` and, in Pro, `lookup_registration` and the file tools. **If these tools are available, always use them; never redo their work by hand.** Only when none of them is available, follow "Without the MCP server" below.
   - `check_invoice_fields` — required items (it also checks the registration number format).
   - `check_tax` — per-rate tax, rounding, line-by-line rounding, grand total.
   - `lookup_registration` (paid edition, needs `NTA_INVOICE_APP_ID`) — with the transaction date and the printed name, when the user wants to know whether the issuer was registered on that day. If it returns `not_configured`, tell the user how to obtain an ID (README) and that they can check manually at https://www.invoice-kohyo.nta.go.jp/ .
5. **Report** with the template in `references/report-template.ja.md` (Japanese) or `references/report-template.en.md` (English): a one-line verdict, then errors, warnings and notes, each with its source (title, article or page, URL). Put the extracted values in a short table so the user can spot reading mistakes. State how the check was done: with the invoice-tenken tools, or by hand because the tools were not available (then suggest turning the extension on). Whenever `lookup_registration` returns an `attribution` (it does after a real lookup), show the Japanese text verbatim (required by Art. 6 of the Web-API terms).
6. **File names (optional).** If the user keeps electronic invoices, `suggest_filename` gives `YYYYMMDD_取引先_金額.ext` (NTA Q&A Q50). Ask whether they record amounts with or without tax and keep the same choice (Q57). In the paid edition, `plan_renames` / `apply_renames` / `undo_renames` rename files after approval, and `write_index_csv` writes an index (索引簿) for Excel.

## Reading the results

- `error` — a required item is missing, the number is malformed, or the tax or totals do not add up.
- `warning` — needs a human look: check digit does not match the corporate-number formula (normal for sole proprietors, whose numbers have no published check digit rule), reduced-rate indication not found, name differs from the published name.
- `info` — passed checks and context.
- Before calling a missing item a defect, remember that several clearly linked documents may together form one qualified invoice, and a registration number shared in a customer code table counts as written (NTA overview p. 6). Mention this when items are missing.
- The tax rule (Order Art. 70-10, NTA overview p. 7): tax is computed **once per rate** on the per-rate total — × 10/100 or 8/100 on tax-excluded totals, × 10/110 or 8/108 on tax-included totals — rounded by any method (round down, half up, round up). Adding up tax rounded line by line is not allowed. `check_tax` reports which methods match.

## Without the MCP server

If the `invoice-tenken` tools are not available (for example in Claude chat, where tools that run on the computer are not started), do steps 1–3 and 5 as above, but instead of step 4 **open `references/manual-check.md` and work through every step in it**: registration number (A), required items (B), consumption tax (C) and, if asked, file names (D). It repeats exactly what the tools check, with the same error / warning / info levels. Do the arithmetic in code when you can run code. Say in the report that the check was done by hand.

## Not covered

Bookkeeping requirements (帳簿の記載事項), the small-amount and book-only exceptions (少額特例・帳簿のみ保存), the transitional credit for purchases from non-registered businesses (経過措置), whether the issuer's business may issue simplified invoices in a given case, and anything beyond the printed document. Mention them only to point to the NTA overview, never to decide them.
