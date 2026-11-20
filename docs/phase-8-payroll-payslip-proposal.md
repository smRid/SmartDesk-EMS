# Phase 8 salary and payslip proposal

## Scope

The existing salary ledger remains a simple contractual payment record:

`total = basic salary + allowance - deduction`

It is not a statutory payroll, tax, benefits, or Bangladesh labour-law engine. No tax brackets, benefits, employer contributions, or legal assumptions are added.

## Additive salary fields

- `period_start` and `period_end`: explicit payroll coverage. Existing records are backfilled to the calendar month containing `pay_date`.
- `currency`: ISO currency snapshot, defaulting to the application’s configured currency. The current repository configuration remains USD; BDT is used only if organization configuration is changed.
- `status`: `draft -> approved -> finalized -> paid`.
- `approved_by/at`, `finalized_by/at`, and `paid_by/at`: approval metadata.
- Unique `(employee_id, period_start, period_end)` prevents duplicate periods.

The existing basic, allowance, deduction, and total columns remain the canonical components. A generic component table is not justified until HR supplies component definitions and calculation rules. Payslip files are generated privately on demand, so no public file URL or persistent payslip reference is added.

## Maker-checker rules

- Entry creators produce drafts.
- The creator cannot approve their own entry.
- Only approved entries may be finalized; only finalized entries may be marked paid.
- Finalized/paid records are treated as immutable financial history.
- State transitions use conditional updates, preventing stale or repeated actions.

## Payslip security

- Admins may download any finalized/paid payslip.
- Employees may download only finalized/paid payslips belonging to their authenticated employee record.
- The route performs object-level authorization after loading the salary record, preventing IDOR through URL manipulation.
- PDFs are generated in memory and returned with `private, no-store`; they are never uploaded to public storage.
- Successful downloads are written to the audit log.

## PDF contents

The branded one-page PDF contains organization placeholders, employee name/ID, period, pay date, currency, basic salary, allowance, deduction, and net amount. It explicitly states that the document reflects configured salary entries and does not calculate statutory tax or benefits.
