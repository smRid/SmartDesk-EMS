# SmartDesk EMS — Professional UI & Enterprise Features Upgrade Playbook

**Basis:** SmartDesk EMS project documentation v1.1, updated 16 November 2026.  
**Purpose:** Copy the master instructions into an AI coding assistant that can access the repository; then run **one phase prompt at a time**.  
**Important:** This playbook was prepared from project documentation, not a complete source-code audit. Every phase asks the coding assistant to inspect the real implementation before editing it.

## Your existing foundation

- Next.js 16.4.6 App Router, React 19, TypeScript, Tailwind CSS v4.
- Neon PostgreSQL, Drizzle ORM/Kit, migrations and seed data.
- bcrypt + jose custom credentials authentication and cookie sessions.
- Admin and Employee roles, route protection, Zod, React Hook Form, Sonner, Cloudinary.
- Existing admin: dashboard, employees, departments, leaves, salary, settings.
- Existing employee: dashboard, profile, leaves, salary history, settings.
- Existing tables: `users`, `departments`, `employees`, `leave_requests`, `salaries`, `audit_logs`.
- Existing app structure: `src/app`, `src/components`, `src/db`, `src/lib`, `drizzle`, and `middleware.ts` (per documentation).

**Documented gaps:** no attendance module, no forgot-password flow, no PDF payroll export, no advanced charts, no external logging, no advanced pagination. Leave balances/policies, mature notification center, structured payroll approval and manager role are recommended enhancements, not documented as already implemented.

## Project-wide design direction

Make SmartDesk EMS feel like a mature B2B HR SaaS product. Use the current brand identity, refined rather than replaced:

- **Colors:** navy `#0F172A`, teal `#0D9488`, page background `#F8FAFC`, white cards, readable slate typography, restrained alert colors. Support current dark mode with equivalent contrast-safe tokens.
- **Typography:** modern sans-serif (Inter or Geist if already available), clear hierarchy, compact secondary text, generous line height.
- **Layout:** 256px collapsible sidebar on desktop, responsive header with page title + global actions, content width constraints, consistent page headers, sticky table tools when useful, mobile off-canvas navigation.
- **Components:** reuse existing primitives first; add shadcn/ui selectively where it reduces maintenance. Do not add a conflicting component library just for visual appearance.
- **Interaction:** search, real filters, sorting, pagination, row actions, keyboard accessibility, skeletons, empty/error/success states, safe confirmation dialogs, accessible toasts and forms.
- **Accessibility:** semantic HTML, visible focus, error labels, WCAG AA color contrast, 44px touch targets where practical, reduced-motion support.
- **Performance:** server components by default, client components only where interaction requires them, efficient Drizzle queries, server-side pagination for large tables.
- **Responsive acceptance sizes:** 320, 390, 768, 1024, 1440px. No horizontal overflow.
- **Data integrity:** never show fabricated dashboard metrics as if they are real; use labeled sample data only in local dev or Storybook-style previews.

## Universal instructions — paste this ONCE before the phases

```text
You are the senior Next.js full-stack engineer, principal UI/UX designer, database architect, SQA engineer, and security reviewer responsible for upgrading my EXISTING application, SmartDesk EMS.

PROJECT CONTEXT (from my documentation; verify against actual files before coding):
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.
- Neon PostgreSQL + Drizzle ORM/Kit.
- Authentication: bcrypt + jose, HTTP-only session cookie, Admin/Employee roles.
- Validation: Zod + React Hook Form. Notifications: Sonner. Images: Cloudinary.
- Existing DB tables: users, departments, employees, leave_requests, salaries, audit_logs.
- Existing modules: admin dashboard/employees/departments/leaves/salary/settings; employee dashboard/profile/leaves/salary/settings.
- Likely files: src/app, src/components, src/db/schema.ts, src/lib/auth.ts, src/lib/actions.ts, src/lib/queries.ts, src/lib/env.ts, middleware.ts.

NON-NEGOTIABLE RULES:
1. DO NOT recreate the app, replace the database, switch ORMs, or rewrite working business logic without a demonstrated need.
2. Inspect package.json, relevant routes, components, schema, auth, queries, actions, and existing tests before any edits. The documentation may be incomplete or outdated.
3. Before editing, provide: existing-state findings; specific file-change plan; new dependencies with justifications; migrations, if any; risks and rollback approach.
4. Implement one phase only, in small reviewable changes. Reuse existing design components and patterns; avoid unnecessary libraries.
5. Preserve current routes and both Admin/Employee workflows unless the phase explicitly changes them. Keep compatibility with the current database schema.
6. All data access and mutations must enforce server-side session, active-account, role, ownership, and business-level authorization. Route redirects alone are not authorization.
7. Do not expose secrets, hardcode credentials, leak employee/salary data, or touch production credentials. Do not automatically run destructive SQL, db:push against production, or production seeds.
8. For schema changes: make additive Drizzle changes, generate migrations, inspect SQL, test on a copy/dev database, and explain rollback.
9. Keep realistic loading, empty, error, success, validation, and offline/network states. Handle accessibility and mobile layouts.
10. Prefer real data from existing queries. Use clearly labeled fixtures only in tests and local previews; never ship fake figures as real KPIs.
11. Add tests for each new business rule, permissions boundary, and core user journey. Run npm run type-check, npm run lint, npm run build, and appropriate tests if scripts are available. Report failures honestly.
12. At the end provide: summary, exact files changed, schema impact, commands run/results, screenshots or textual visual checklist, unresolved decisions, security implications, and next phase.
13. If you cannot inspect or modify my repository, DO NOT pretend you made changes. Instead give exact code examples and a file-by-file implementation plan.
14. Stop after the requested phase. Do not silently implement future phases.

Design objective: polished modern enterprise HR portal using navy/teal branding, accessible, trustworthy, responsive, fast, and consistent—not flashy or animation-heavy.

Please acknowledge these constraints and begin with the specific phase I give next.
```

---

## Phase 0 — Codebase audit and safety baseline (DO THIS FIRST)

**Outcome:** A defensible inventory and an implementation plan that avoids regressions.

```text
PHASE 0 — AUDIT ONLY, DO NOT MODIFY CODE.
Inspect the actual SmartDesk EMS repository and compare it with document.md v1.1.
1) Map every Admin/Employee route and shared component; identify current layouts, API/server actions, and data-fetching patterns.
2) Inspect auth.ts, middleware.ts or proxy.ts, session checks, actions, queries, Drizzle tables/relations, Zod validators, Cloudinary integration, seed data, env parsing and rate limiting.
3) Audit desktop/mobile UX for visual consistency, accessibility, slow queries, unnecessary client rendering, error/empty states, and duplicated components.
4) Create a gap matrix: Existing / Partial / Missing / Risk, with route names and file evidence.
5) Identify security issues: ownership checks, stale account sessions, in-memory rate limiter, credentials in seed accounts, logout/session invalidation, CSRF assumptions, PDF/document permissions.
6) Produce a phase-by-phase, low-risk upgrade plan listing precise files, dependencies, new tables, estimates by relative complexity, verification and rollback.
Deliver audit report only. Do not invent results for code you cannot read.
```

**Exit criteria:** Verified route map, known gaps, backup/branch strategy, baseline build/test status, documented security risks.

## Phase 1 — Design system and reusable UI foundation

```text
PHASE 1 — DESIGN SYSTEM. Modernize existing UI without altering business logic.
1) Inspect existing src/components/ui and src/components/layout; decide which components to retain, refactor or selectively enhance with compatible shadcn/ui patterns.
2) Define CSS/Tailwind design tokens for light/dark surfaces, navy sidebar, teal actions, typography, 8px spacing scale, border/radius/shadow, hover/focus/disabled states, semantic status colors.
3) Create/upgrade reusable PageHeader, Breadcrumbs, StatCard, SectionCard, DataTableShell, SearchFilterBar, EmptyState, ErrorState, LoadingSkeleton, StatusBadge, ConfirmDialog, FormField, DateRangeFilter and Avatar components as justified by actual usages.
4) Ensure typography, spacing, buttons, tables, input styles, loading, forms and dialogs are consistent in admin and employee views.
5) Verify 320/390/768/1024/1440 widths, keyboard-only use, reduced motion and WCAG AA contrast.
Do not rewrite routes or queries. Show representative before/after layouts and component usage examples. Add visual smoke tests if test infrastructure exists.
```

**Exit criteria:** Tokens and common components documented; all existing pages still compile; no behavioral regressions.

## Phase 2 — Enterprise landing and login page

```text
PHASE 2 — REDESIGN /login. Keep working authentication fully intact.
Create a professional responsive EMS landing/login page with: branded nav, clear value proposition, 3-4 concise capability highlights, optional lightweight product-preview illustration built with CSS/SVG, trust/security note that makes no unverified promises, and a highly accessible login card.
Use white/teal/navy branding with subtle background treatment, not excessive gradients. Add email/password labels, proper autofill, password toggle, remember-me control only if server behavior is actually implemented, meaningful validation and pending states, login error that does not disclose account existence, and mobile-friendly form.
Keep existing RHF/Zod/server action/session/role redirects and theme preference intact. Link Forgot Password only to a real working flow; if not built, clearly mark it as upcoming or omit the link until Phase 10.
Test valid/invalid login, both roles, keyboard navigation, password toggle and responsive layouts. No fake login or dummy authentication. Preserve /login route.
```

**Exit criteria:** Attractive page, real auth integration, role redirects unchanged, accessible at 320px.

## Phase 3 — Admin and employee application shell

```text
PHASE 3 — APPLICATION SHELL. Refactor current layouts, not domain logic.
Design a collapsible navy sidebar (expanded + icon-only), clear active route, grouped navigation, mobile slide-over, top header, breadcrumb/page title, profile menu, theme toggle and logout.
Admin navigation: Dashboard, Employees, Departments, Leave Requests, Salary, Reports (only when built), Settings. Employee: My Dashboard, My Profile, My Leave, My Salary, Settings. Show feature-flagged future routes only when ready.
Add responsive content grid, consistent empty/loading/error shells, sticky contextual page actions, and accessible navigation/dialogs.
Honor active session and do not expose unauthorized navigation links; enforce authorization server-side independently. Keep route paths stable.
```

**Exit criteria:** Navigation works on desktop and mobile without route regressions or inaccessible menus.

## Phase 4 — Actionable admin and employee dashboards

```text
PHASE 4 — DASHBOARDS. Refactor /admin/dashboard and /employee/dashboard using REAL authorized data.
Admin: total active employees, departments, leave requests pending, approved/rejected trends, current salary-record summary (label accurately; do not call it finalized payroll unless it is), recent employee joins, leave actions, department distribution, useful 6- or 12-month chart if the database supports it.
Employee: greeting, profile completion, own pending/approved leaves, recent salary records, quick action to apply for leave/edit profile, important updates when available.
Add date filters with explicit scopes, chart accessible summaries, drill-down links, server-side aggregation, zero-data explanations, skeleton/loading/error states. Do not compute misleading percentages or mix pay dates with payroll periods.
Keep charts lightweight; test counts against SQL/Drizzle expected results. Ensure employees can never read other employees' data.
```

**Exit criteria:** Accurate metrics with clear definitions, working filters, no fake production data.

## Phase 5 — Employee management and advanced tables

```text
PHASE 5 — EMPLOYEE DIRECTORY AND DETAILS.
Upgrade /admin/employees and related create/edit/view flows. Add URL-backed search/filter/sort, server-side pagination, visible results count, column selection if justified, bulk export (authorized and rate-limited), and safe action menus.
Build employee details with tabs: Overview, Employment, Leave, Salary (privileged), Documents (new only if Phase 5 schema approved), Activity. Make profile forms multi-section but preserve current fields and validations.
Add optional employment status timeline, onboarding date, emergency contact and reporting manager only after reviewing DB impact. Use additive migrations; documents require secure private storage and access control, not merely public Cloudinary image URLs.
Protect salary/profile exports and test cross-employee, inactive-account and invalid-object authorization. Keep deactivation reversible and historical records intact.
```

**Exit criteria:** Functional pagination/filter/sort; same core CRUD as before; no privacy regressions.

## Phase 6 — Leave balances, policy and calendar

```text
PHASE 6 — ENHANCE EXISTING LEAVE FLOW.
Inspect leave_requests structure and existing pending->approved/rejected workflow. Design leave_policies, leave_balances or a ledger-based leave entitlement model, holiday_calendar, and approval_history where justified. Propose schema and migration BEFORE implementation.
Business rules: entitlement by leave type, calendar-year or anniversary-year policy configurable, holidays/weekends excluded according to company settings, half-day optional, overlapping requests blocked, insufficient balance blocked or explicitly exception-approved, pending requests may reserve entitlement if policy says so, approved leaves change balances atomically, rejected/cancelled requests release reserves.
Build employee leave balance cards, calendar/list view and request form; admin policy configuration, pending-review queue, reason/notes and audit trail. Maintain compatibility with existing leave history.
Write edge-case tests for leap years, overlapping dates, simultaneous approvals, weekends, holidays, inactive employees and timezone/date boundaries. Do not assume Bangladesh statutory leave values: keep rules configurable for review.
```

**Exit criteria:** Correct entitlement accounting, reliable concurrency-safe approvals, documented policy assumptions.

## Phase 7 — Attendance and shift management (new core feature)

```text
PHASE 7 — DESIGN AND IMPLEMENT ATTENDANCE as an additive module.
First propose schema for attendance_records, attendance_events (if event-sourced punches are needed), work_shifts, shift_assignments, attendance_adjustments, and holiday references. Explain timestamps in UTC, local calendar dates in Asia/Dhaka/configurable organization timezone, and unique constraints/indices.
Implement employee Check In / Check Out, today's status, daily/monthly history, prevention of duplicate open sessions, handling overnight shifts, time calculations, and employee attendance correction requests.
Admin: attendance dashboard, day/month filters, late/missing punch overview, corrections approval, CSV export and shift assignment. Do not rely on device/browser clock for trusted time. Ensure idempotency for repeated requests and log correction history.
Add server-side access checks, Zod validation, transactions where needed, loading/offline/error feedback, and tests for duplicate punches, concurrency, midnight, DST if applicable, cross-employee access and inactive accounts.
Keep biometric/GPS optional and off by default; require explicit business/privacy decisions before collecting location data.
```

**Exit criteria:** Real attendance records with trustworthy time and correction audit trail.

## Phase 8 — Salary history, pay periods and PDF payslips

```text
PHASE 8 — IMPROVE SALARY MODULE without pretending the existing simple salary ledger is a complete statutory payroll engine.
Inspect salaries and existing totalSalary = basicSalary + allowance - deduction. Preserve all historical records. Improve /admin/salary and /employee/salary with filters, currency formatting (BDT if organization config says so), period/date clarity, breakdown cards, and robust access checks.
Propose safe additions for payroll_period, salary_status, pay components, approval metadata and payslip references only if the real code and business requirements justify them. Distinguish salary entry creation, approval, finalization and payment status; use maker-checker rules for sensitive actions.
Build branded, server-generated PDF payslips as authorized downloads with employee name/ID, period, components, deductions, amount and organization data placeholders. Prevent IDOR via URL manipulation, avoid public file URLs, log downloads as appropriate and test access.
Never hardcode tax, benefits or Bangladesh labour-law calculations. Leave configurable rules pending HR/legal confirmation. Add rounding and duplicate-period tests.
```

**Exit criteria:** Secure payslip export with clear salary definitions and no fabricated tax rules.

## Phase 9 — Notifications, audit viewer and reports

```text
PHASE 9 — OPERATIONS AND REPORTING.
Create an in-app notification inbox for leave submitted/approved/rejected, approved attendance adjustments, salary slip available, profile changes as appropriate. Use a notifications table (recipient, type, entity, message, read status, created_at) and event-triggered generation; ensure ownership/permissions and no sensitive salary details in unsafe channels.
Build an admin audit-log viewer using the existing audit_logs with filter by actor/action/date/entity, privacy-aware redaction and immutable events. Verify current audit recording first.
Add exportable reports for employees by department/status, leave trends, attendance summaries (if available), and salary summaries restricted to authorized roles. Provide date filters, KPI definitions, accurate totals, CSV export with formula-injection protection, bounded server pagination, and PDF only where useful.
Avoid large unbounded queries. Add tests for notification recipients, audit traceability, export authorization and correct date scopes.
```

**Exit criteria:** Useful audit trail, reliable notifications and reproducible authorized reports.

## Phase 10 — Security hardening and account recovery

```text
PHASE 10 — SECURITY REVIEW AND FIXES.
Audit custom auth with Next.js 16 guidance. The docs call middleware Proxy in Next.js 16; determine whether the current middleware.ts should be migrated to proxy.ts based on actual repo/build behavior, not a blind rename. Use Proxy for optimistic redirects, not as the only authorization boundary.
Create or reinforce a centralized server-side data-access/authorization layer: verify active user and session on every protected action/query, enforce role plus employee ownership, and return minimal fields. Test inactive accounts and token/session revocation strategy.
Replace in-memory login throttling with durable distributed rate limiting suited to serverless deployments. Add sensible error messages, audit events, lockout/cooldown policy, secure cookie settings, sign-out/session invalidation, secret rotation plan and secure forgot-password flow with one-time expiring tokens and enumeration-safe responses.
Review Cloudinary upload validation, private document storage, protected downloads, CSP/security headers, dependency risks and sensitive-data logging. Remove or rotate known dev passwords before production; never output actual secrets.
Write automated authorization tests for admin/employee/unauthenticated/disabled users, cross-user ID access, brute-force behavior and password-reset replay/expiry.
```

**Exit criteria:** Security findings resolved or tracked; no authentication regressions; a concrete threat-model checklist exists.

## Phase 11 — Testing, performance, deployment and documentation

```text
PHASE 11 — QUALITY GATES AND RELEASE READINESS.
Implement or improve unit tests for validation/date/payroll helpers, integration tests for Drizzle queries and server actions against an isolated test database, and Playwright E2E journeys: login both roles; employee CRUD; leave submit/approve; attendance check-in/out/correction; salary view/PDF authorization; logout and forbidden access.
Measure performance in production build. Optimize expensive dashboard queries, selective columns, indexes backed by actual query plans, caching consistent with personalized data, unnecessary client components, code splitting, image optimization and accessible loading states.
Add error boundaries/not-found pages, structured logging with redaction, observability and deployment health checks. Test restore procedure and review secret handling.
Run npm run type-check, npm run lint, npm run build and test scripts; capture failures and resolutions. Produce release checklist, changelog, migration steps, verified behavior table, updated README/document.md, and an honest list of pending issues.
```

**Exit criteria:** Green checks, smoke-test evidence, rollback plan, documented deploy readiness.

## Phase 12 — Optional next-stage business features (not part of MVP)

```text
PHASE 12 — PRODUCT DISCOVERY FIRST; NO CODE YET.
Assess the need for Manager role/permissions, onboarding-offboarding checklists, employee documents, asset assignment, performance KPIs, expense claims and approval workflow builder.
Rank by employee impact, implementation cost, compliance/privacy risk, and dependency on existing modules. Produce user stories, proposed schema, route map, permission matrix, acceptance criteria and roll-out sequence. Do not build until approved.
```

---

## Execution workflow for EACH phase

1. Create a dedicated Git branch and a baseline backup before schema-sensitive work.
2. Paste the **Universal instructions** once into an AI coding assistant attached to the real repository.
3. Paste one phase prompt, beginning with **Phase 0**.
4. Review the file-by-file plan, security implications, and proposed migration before implementation.
5. Implement, preview the UI, test both Admin and Employee, and verify 320/390/768/1024/1440 widths.
6. Run checks: `npm run type-check`, `npm run lint`, `npm run build`, and relevant automated tests.
7. Review generated SQL before `npm run db:migrate` on a dev/staging database. Never auto-run migrations on production.
8. Commit the change, record the outcome, then proceed to the next phase.

## Suggested implementation order by product value

- **First:** Phase 0 → 1 → 2 → 3 → 4 → 5, with immediately discovered critical security fixes handled before release.
- **Then:** Phase 6 (leave policy) → 7 (attendance) → 8 (salary and PDF).
- **Next:** Phase 9 (notifications/reports) → 10 (full security hardening) → 11 (release readiness).
- **Later:** Phase 12, only after validating organizational needs.

**Security note:** Phase 10 is a consolidated hardening phase, **not permission to postpone critical auth fixes**. Any critical issue from Phase 0 blocks deployment and should be addressed before other work proceeds.

## Functional acceptance test scenarios

| User journey | Key expected result |
|---|---|
| Admin logs in | Admin dashboard; protected admin data only |
| Employee logs in | Employee dashboard; own data only |
| Employee modifies another employee ID in URL/API | 403/404; no data disclosure |
| Inactive employee opens active session | Session/authorization denied per implemented policy |
| Employee applies for overlapping leave | Controlled validation error |
| Two admins approve same leave simultaneously | Exactly one successful state transition |
| Employee checks in twice | No duplicate active attendance session |
| Employee checks out after midnight | Correct shift-aware hours |
| Admin creates salary record | Correct arithmetic and audit record |
| Employee opens another employee's payslip URL | Access rejected |
| User filters 5,000 employees | Paginated indexed query, stable response |
| Mobile user opens sidebar at 320px | Fully navigable; no horizontal overflow |
| Form submission fails due to network error | Recoverable state, no duplicate mutation |

## Official sources for implementation review

- Next.js authentication, Server Action authorization and data access layer: https://nextjs.org/docs/app/guides/authentication
- Next.js 16 Proxy (formerly Middleware): https://nextjs.org/docs/app/getting-started/proxy
- shadcn/ui existing Next.js project setup: https://ui.shadcn.com/docs/installation/next
- shadcn/ui sidebar: https://ui.shadcn.com/docs/components/base/sidebar
- shadcn/ui data table: https://ui.shadcn.com/docs/components/base/data-table
- Playwright test runner: https://playwright.dev/docs/intro

*Prepared as a developer prompt playbook. Implementation details must be confirmed against the real SmartDesk EMS source code.*
