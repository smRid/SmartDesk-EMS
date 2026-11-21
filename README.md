<div align="center">

# SmartDesk EMS

### Secure Employee Operations in One Focused Workspace

SmartDesk EMS is a full-stack Employee Management System for managing employee
records, departments, attendance, leave, salary, and payslips. It provides
separate role-aware workspaces for administrators and employees, backed by
server-side authorization, auditable workflows, and production-oriented
security controls.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_SmartDesk-0F8F83?style=for-the-badge)](https://smartdesk-ems.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://smartdesk-ems.vercel.app/)

</div>

---

## Preview

<p align="center">
  <img src="./public/preview1.png" alt="SmartDesk EMS landing and sign-in page" width="1000" />
</p>

<p align="center">
  <img src="./public/preview2.png" alt="SmartDesk EMS administration dashboard" width="1000" />
</p>

<p align="center">
  <img src="./public/preview3.png" alt="SmartDesk EMS employee management workspace" width="1000" />
</p>

<p align="center">
  <img src="./public/preview4.png" alt="SmartDesk EMS employee workspace" width="1000" />
</p>

> **Live site:** [https://smartdesk-ems.vercel.app/](https://smartdesk-ems.vercel.app/)

---

## Features

| Feature | Description |
| :-- | :-- |
| **Role-Aware Workspaces** | Separate administrator and employee dashboards with server-side authorization on protected reads and mutations |
| **Employee Management** | Create, search, filter, update, export, and deactivate employee records with department and employment details |
| **Department Management** | Maintain business units while preventing deletion when active employees are still assigned |
| **Attendance Tracking** | Employee check-in and check-out, shift-aware calculations, correction requests, administrative review, filters, and export |
| **Leave Management** | Submit leave requests, enforce policy and balance rules, detect overlapping dates, and approve or reject requests through controlled transitions |
| **Salary & Payslips** | Create salary records, calculate payroll totals, restrict employee access to owned records, and generate protected PDF payslips |
| **Profile & Settings** | Maintain administrator and employee profile data, profile images, and password changes |
| **Account Recovery** | Enumeration-safe forgot-password flow with one-time expiring reset tokens and replay protection |
| **Security Controls** | Secure cookies, session invalidation, disabled-account checks, distributed database-backed login throttling, audit events, and redacted logging |
| **Responsive Interface** | Accessible layouts, loading states, error boundaries, dark mode, mobile navigation, and responsive data views |
| **Operational Readiness** | Health endpoint, automated tests, migration workflow, release checklist, rollback guidance, and restore documentation |

---

## How It Works

1. **Authentication:** Users sign in with assigned credentials. SmartDesk validates the account, applies durable throttling, and creates a signed HTTP-only session.
2. **Authorization:** Protected pages, queries, actions, downloads, and exports verify the active session, role, account status, and employee ownership on the server.
3. **People Operations:** Administrators maintain employees and departments from the admin workspace.
4. **Attendance & Leave:** Employees record attendance and submit leave or correction requests; administrators review controlled workflow transitions.
5. **Payroll:** Administrators create salary records, while employees can view only their own salary history and protected payslips.
6. **Recovery & Sign-Out:** Password-reset tokens are single-use and expiring; sign-out invalidates the current session.

---

## Tech Stack

<div align="center">

| Technology | Purpose |
| :--: | :-- |
| **Next.js 16.4** | App Router, React Server Components, Server Actions, route handlers, Proxy, and production builds |
| **React 19** | Interactive forms, tables, filters, dialogs, dashboards, and attendance controls |
| **TypeScript 5** | Static typing across application, authorization, database, and test code |
| **Tailwind CSS 4** | Responsive layout, design tokens, dark theme, and component styling |
| **Neon PostgreSQL** | Serverless persistence for users, sessions, HR records, workflows, rate limits, and recovery tokens |
| **Drizzle ORM** | Typed queries, relational schema definitions, migrations, and database tooling |
| **Custom Credentials Auth** | bcrypt password verification, JOSE-signed sessions, secure cookies, and role-aware access |
| **React Hook Form + Zod** | Client forms, shared validation schemas, and structured field errors |
| **Cloudinary** | Validated employee profile-image storage and delivery |
| **Playwright** | Public smoke tests and authenticated end-to-end journeys |
| **Node Test Runner** | Unit and isolated database integration tests |
| **Lucide React** | Consistent application iconography |
| **Vercel** | Production hosting for the Next.js application |

</div>

---

## Project Structure

```text
SmartDesk-EMS/
|-- src/
|   |-- app/
|   |   |-- (admin)/admin/              # Protected administrator workspace
|   |   |-- (auth)/                     # Login and password recovery
|   |   |-- (employee)/employee/        # Protected employee workspace
|   |   |-- api/health/                 # Deployment health check
|   |   |-- salary/[id]/payslip/        # Authorized PDF download
|   |   |-- error.tsx                   # Application error boundary
|   |   |-- global-error.tsx            # Root error boundary
|   |   `-- layout.tsx                  # Root metadata and theme initialization
|   |-- components/
|   |   |-- attendance/                 # Punch and correction workflows
|   |   |-- dashboard/                  # Dashboard charts and loading states
|   |   |-- forms/                      # Auth, employee, leave, salary, and settings forms
|   |   |-- layout/                     # Application shell, sidebar, and top bar
|   |   |-- salary/                     # Salary actions
|   |   `-- ui/                         # Shared accessible UI primitives
|   |-- db/
|   |   |-- schema.ts                   # PostgreSQL schema
|   |   |-- seed.ts                     # Environment-driven seed data
|   |   `-- index.ts                    # Database client
|   `-- lib/
|       |-- actions.ts                  # Authorized server actions
|       |-- auth.ts                     # Session and authentication helpers
|       |-- authorization.ts            # Central authorization layer
|       |-- queries.ts                  # Selective data-access queries
|       |-- rate-limit.ts               # Durable authentication throttling
|       |-- password-reset.ts           # Secure account recovery
|       |-- payslip-pdf.ts              # Payslip generation
|       `-- *.test.ts                    # Unit and security tests
|-- drizzle/                            # SQL migrations and snapshots
|-- tests/
|   |-- e2e/                            # Playwright journeys and smoke tests
|   `-- integration/                    # Isolated database integration tests
|-- docs/
|   |-- release-readiness.md            # Deploy, rollback, restore, and verification plan
|   `-- security-threat-model.md        # Threat model and security checklist
|-- public/
|   |-- preview1.png
|   |-- preview2.png
|   |-- preview3.png
|   `-- preview4.png
|-- proxy.ts                            # Optimistic route redirects
|-- drizzle.config.ts                   # Drizzle Kit configuration
|-- playwright.config.ts                # Browser-test configuration
|-- next.config.ts                      # Next.js and security-header configuration
`-- README.md
```

---

## Environment Variables

Copy the example configuration before starting locally:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-secure-password"
SEED_EMPLOYEE_PASSWORD="replace-with-a-unique-temporary-password"
ENCRYPTION_KEY="replace-with-a-random-key-at-least-32-characters-long"

PASSWORD_RESET_DELIVERY_URL=""
PASSWORD_RESET_DELIVERY_SECRET=""
NODE_ENV="development"
```

| Variable | Required | Purpose |
| :-- | :--: | :-- |
| `DATABASE_URL` | Yes | Connects SmartDesk to PostgreSQL through Drizzle |
| `NEXTAUTH_SECRET` | Yes | Signs application sessions; use at least 32 random characters |
| `NEXTAUTH_URL` | Yes | Canonical server URL for the current environment |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application origin used by browser-facing flows |
| `CLOUDINARY_CLOUD_NAME` | Yes | Identifies the Cloudinary account used for profile images |
| `CLOUDINARY_API_KEY` | Yes | Authenticates Cloudinary server operations |
| `CLOUDINARY_API_SECRET` | Yes | Authorizes Cloudinary uploads and deletion; keep server-side |
| `ADMIN_EMAIL` | Yes for seeding | Email address for the initial administrator account |
| `ADMIN_PASSWORD` | Yes for seeding | Password for the initial administrator; never commit a real value |
| `SEED_EMPLOYEE_PASSWORD` | Yes for employee seed | Temporary employee password supplied explicitly during seeding |
| `ENCRYPTION_KEY` | Yes | Encrypts sensitive application values; use at least 32 random characters |
| `PASSWORD_RESET_DELIVERY_URL` | Production recovery | HTTPS endpoint used to deliver password-reset messages |
| `PASSWORD_RESET_DELIVERY_SECRET` | Production recovery | Authenticates calls to the configured recovery delivery endpoint |
| `NODE_ENV` | Yes | Selects development, test, or production behavior |
| `TEST_DATABASE_URL` | Integration tests only | Migrated, isolated database used by integration tests |

Never commit `.env` or production credentials. Use distinct secrets and databases for development, testing, and production.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/smRid/SmartDesk-EMS.git
cd SmartDesk-EMS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

Copy `.env.example` to `.env`, then replace every placeholder with environment-specific values.

### 4. Apply database migrations

```bash
npm run db:migrate
```

Review generated SQL before applying new migrations. Never automatically run migrations against production.

### 5. Seed local accounts

```bash
npm run db:seed
```

The seed reads administrator and employee credentials from environment variables; the repository contains no default passwords.

### 6. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
| :-- | :-- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run unit and security tests |
| `npm run test:integration` | Run database integration tests against `TEST_DATABASE_URL` |
| `npm run test:e2e` | Run the full Playwright suite |
| `npm run test:e2e:smoke` | Run safe public-route smoke tests |
| `npm run quality` | Run unit tests, integration tests, type checking, linting, and build |
| `npm run db:generate` | Generate Drizzle migrations from the schema |
| `npm run db:migrate` | Apply committed migrations to the configured database |
| `npm run db:push` | Push schema changes directly; use only in controlled development workflows |
| `npm run db:seed` | Seed environment-provided administrator and employee accounts |
| `npm run db:studio` | Open Drizzle Studio |

---

## Testing & Quality Gates

```bash
npm run type-check
npm run lint
npm test
npm run build
```

Use `npm run quality` to execute the complete non-browser quality gate. Integration tests run only when `TEST_DATABASE_URL` points to a migrated database that is distinct from the application database.

Install Chromium once, then run the safe public smoke suite:

```bash
npx playwright install chromium
npm run test:e2e:smoke
```

Authenticated or destructive E2E journeys require the explicit test environment described in [`docs/release-readiness.md`](./docs/release-readiness.md).

---

## Deployment

**Production site:** [https://smartdesk-ems.vercel.app/](https://smartdesk-ems.vercel.app/)

### Deploy on Vercel

1. Import `https://github.com/smRid/SmartDesk-EMS` into Vercel.
2. Keep the framework preset set to **Next.js** and use the repository root.
3. Configure every required production environment variable without copying development credentials.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://smartdesk-ems.vercel.app` or the final production domain.
5. Review and apply committed Drizzle migrations to the production database through a controlled release step.
6. Seed or provision the first administrator with a unique production password, then rotate or remove bootstrap credentials.
7. Deploy and verify `GET /api/health`, authentication, role separation, protected downloads, and critical workflows.

Release order, smoke tests, rollback, database restore rehearsal, and pending work are documented in [`docs/release-readiness.md`](./docs/release-readiness.md).

---

## Security & Access Notes

- Proxy performs optimistic redirects; protected queries, actions, routes, and downloads enforce authorization again on the server.
- The centralized authorization layer validates session state, active-account status, role, and employee ownership.
- Session cookies are HTTP-only, same-site restricted, secure in production, and invalidated on sign-out or credential changes.
- Authentication throttling is stored in PostgreSQL so it works across serverless instances.
- Password-reset responses are enumeration-safe, and reset tokens are hashed, expiring, single-use, and replay-protected.
- Profile uploads validate supported image type and size before Cloudinary storage.
- Structured logging redacts sensitive values; secrets and raw passwords must never be written to logs.
- Production deployments should rotate bootstrap credentials and signing/encryption keys under the documented rotation plan.

See [`docs/security-threat-model.md`](./docs/security-threat-model.md) for the concrete threat-model checklist.

---

## Health Check

```http
GET /api/health
```

The endpoint is intended for deployment and uptime checks. A healthy response confirms that the application is running and can reach its required services.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built with Next.js 16, React 19, TypeScript, Tailwind CSS, Neon PostgreSQL, Drizzle ORM, and Cloudinary.

</div>
