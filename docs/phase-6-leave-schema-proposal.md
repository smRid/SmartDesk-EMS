# Phase 6 leave accounting proposal

## Decision

Use configurable leave policies plus an immutable balance ledger. A ledger is preferred over mutable counters because every reservation, approval, rejection, cancellation, manual grant, and adjustment remains auditable. Existing `leave_requests` rows remain valid.

## Additive schema

- `leave_policies`: one policy per leave type, with configurable annual entitlement, calendar/anniversary cycle, weekend rules, pending reservation behavior, half-day support, negative-balance exception behavior, and active state.
- `holiday_calendar`: company-configured non-working dates. No statutory holidays or Bangladesh-specific entitlement values are assumed.
- `leave_ledger`: signed day amounts scoped to employee, leave type, and cycle; optional request reference; unique event key prevents duplicate accounting.
- `leave_approval_history`: append-only decision history including actor, prior/new status, note, and explicit exception flag.
- `leave_requests` gains optional `day_fraction`, `cycle_start`, `cycle_end`, and `exception_approved`. Existing rows default to full-day semantics and require no rewrite.
- `leave_status` gains `cancelled` for releasing reservations.

## Accounting rules

- Entitlement is a positive `grant` ledger entry. Reserved and consumed values are negative entries.
- When policy reserves pending requests, submission writes a negative `reserve` entry. Approval writes a positive `release` plus a negative `consume` entry atomically. Rejection/cancellation writes a positive `release`.
- When pending requests do not reserve, only approval writes `consume`.
- Request creation rejects overlap with pending/approved requests and rejects insufficient available entitlement.
- Review uses a single PostgreSQL statement with row locking and unique event keys. This is required because the configured Neon HTTP driver does not provide interactive transactions.
- Calendar calculations use ISO date strings rather than JavaScript local-midnight timestamps. Weekends and configured holidays are excluded; half-day applies only to a single eligible working day.

## Compatibility and rollout

- Migration is additive and seeds disabled/zero-entitlement policies for review. Administrators must configure and activate policies before new governed requests can be submitted.
- Existing leave history remains readable. Existing approved rows are not silently debited; HR may add opening adjustments after reconciliation.
- Policy changes apply to future requests. Ledger entries retain the policy/cycle facts used when they were created.
