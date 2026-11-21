# SmartDesk EMS release readiness

## Required quality gates

Run from a clean checkout with production-equivalent environment variables:

```text
npm ci
npm run quality
npx playwright install --with-deps chromium
npm run test:e2e
npm audit
```

`npm run test:integration` skips unless `TEST_DATABASE_URL` is configured. The URL must identify an isolated, migrated database and must not equal the normal `DATABASE_URL`.

Destructive browser workflows additionally require `E2E_ALLOW_DESTRUCTIVE=true`, `E2E_DATABASE_CONFIRMED_ISOLATED=true`, both E2E accounts, and `DATABASE_URL=TEST_DATABASE_URL`. Never set these flags against staging or production.

## Migration and deployment sequence

1. Back up the target PostgreSQL database and record the restore point.
2. Rotate production secrets and verify HTTPS application/reset-delivery URLs.
3. Apply `drizzle/0000` through `drizzle/0004` in numerical order in staging, then production.
4. Run integration and E2E suites against the isolated migrated database.
5. Build once with `npm ci && npm run build`; deploy the immutable artifact to a canary.
6. Verify `/api/health`, login for both roles, authorization boundaries, one write workflow, logout, and protected downloads.
7. Promote gradually while monitoring structured `request.failed` and `health.database_unreachable` events.

## Rollback and restore plan

- Application rollback: redeploy the previously known-good immutable build. Do not roll back schema files independently.
- Database rollback: stop writes, preserve the failed database for investigation, and restore the recorded pre-deploy backup into a new database. Point the previous build at the restored database only after integrity checks.
- Secret rollback: do not restore compromised secrets. Issue new values and accept intentional session invalidation.
- Validate restored row counts for users, employees, departments, leave, attendance, salary, and audit tables; then smoke-test both roles.

## Verified behavior matrix

| Behavior | Automated evidence | Expected result |
|---|---|---|
| Public login and invalid credentials | `public-smoke.spec.ts` | Accessible login; enumeration-safe error |
| Unauthenticated protected access | `public-smoke.spec.ts` | Redirect to login |
| Admin/employee role boundaries | `auth-journeys.spec.ts` | Wrong-role route goes to forbidden |
| Logout/session invalidation | `auth-journeys.spec.ts`, authorization unit tests | Redirect to login; versioned session revoked |
| Employee CRUD entry points | `destructive-workflows.spec.ts` | Admin-only forms available |
| Leave/attendance/salary workflows | `destructive-workflows.spec.ts` | Correct role can reach and submit guarded actions |
| Cross-user and disabled access | authorization/attendance/leave unit tests | Access denied |
| Payslip generation | `payslip-pdf.test.ts` | One-page private PDF |
| Database lifecycle | `database.test.ts` | Isolated write/read/delete succeeds |
| Health and error reporting | public smoke + logger unit test | No secrets; redacted structured event |

## Observability and performance baseline

- Next.js `instrumentation.ts` emits JSON startup and request-failure events with sensitive-key redaction.
- `/api/health` checks database reachability, is never cached, and exposes no configuration values.
- Production build route output is the bundle baseline. Personalized dashboard queries remain uncached and execute independent aggregates in parallel to prevent cross-user caching.
- Dashboard queries execute independent aggregates in parallel with selective projections. Leave details are filtered by primary key in SQL instead of loading and filtering the entire leave history. Obtain `EXPLAIN (ANALYZE, BUFFERS)` from staging before adding indexes; production query-plan evidence is still required.

## Local verification evidence (2026-11-21)

- Unit tests: 30 passed.
- Type checking and ESLint: passed.
- Next.js 16 production build: passed; 28 routes generated, including `/api/health` and Proxy.
- Playwright Chromium: 3 safe public tests passed; 6 database/credential-dependent tests skipped by safety gates.
- Dependency audit: zero known vulnerabilities.
- Integration database lifecycle: skipped because `TEST_DATABASE_URL` is not configured.
- Current configured database: reachable but missing Phase 10 security tables; `/api/health` correctly reports degraded until migration `0004` is applied.

## Pending release decisions

- Configure an external log/trace sink and alert thresholds; console JSON is transport-neutral but is not durable observability by itself.
- Complete full browser workflows against a provisioned isolated database in CI.
- Run Lighthouse/Core Web Vitals against the deployed canary and record budgets.
- Perform and time an actual backup restore rehearsal with the chosen database provider.
- Decide whether MFA and a managed authentication provider are required before handling higher-risk employee data.
- Private employee document storage remains out of scope and must not use public Cloudinary URLs.
