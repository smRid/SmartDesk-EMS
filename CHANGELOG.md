# Changelog

## Unreleased

### Added

- Playwright smoke, authorization, and isolated destructive-workflow suites.
- Isolated PostgreSQL integration test and combined quality command.
- Global error/not-found experiences, database health endpoint, and redacted structured server logging.
- Release, migration, rollback, restore, observability, and verification documentation.

### Security and reliability

- Tests now cover validation/date helpers, authorization boundaries, reset-token behavior, throttling, logging redaction, payroll, attendance, leave accounting, and private payslip generation.
- Destructive E2E workflows require explicit isolated-database confirmation to prevent accidental production mutations.
