# SmartDesk EMS

A production-style Employee Management System built with Next.js App Router, TypeScript, Tailwind CSS, Drizzle ORM, Neon PostgreSQL, custom credentials auth, React Hook Form, Zod, Sonner, and Cloudinary.

## Included modules

- Admin dashboard with staffing, leave, and payroll summaries
- Employee management with profile image upload support
- Department CRUD with active-employee deletion protection
- Leave request workflow with approve/reject review
- Salary history and salary creation flow
- Admin and employee settings with password change
- Role-protected admin and employee layouts plus middleware

## Tech stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- Drizzle ORM + Drizzle Kit
- Neon PostgreSQL
- bcrypt
- jose-based secure cookie session handling
- Cloudinary
- React Hook Form + Zod
- Sonner
- Lucide React

## Environment

The app reads from `.env`. Required values are already wired in `src/lib/env.ts`.

Key variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Local run

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Then open `http://localhost:3000`.

Admin credentials are seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

Employee seed credentials must be supplied through `SEED_EMPLOYEE_PASSWORD`; no default password is stored in the repository.

## Quality and release checks

Run `npm run quality` for unit tests, isolated database integration tests, type checking, linting, and the production build. Integration tests run only when `TEST_DATABASE_URL` points to a migrated database distinct from the normal application database.

Run `npx playwright install chromium` once, then `npm run test:e2e:smoke` for safe public smoke tests. Authenticated and destructive browser journeys require the explicit E2E environment variables documented in [`docs/release-readiness.md`](docs/release-readiness.md).

Deployment health is available at `GET /api/health`. Release order, migrations, verification, rollback, restore rehearsal, and known pending work are tracked in [`docs/release-readiness.md`](docs/release-readiness.md).

## Project structure

```text
src/
  app/
  components/
  db/
  lib/
drizzle/
```

## Deployment notes

- Deploy to Vercel
- Keep the same Neon `DATABASE_URL`
- Add the same Cloudinary credentials in Vercel environment variables
- Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production URL
- Run `npm run db:migrate` against production before first launch
