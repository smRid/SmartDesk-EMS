SMART DESK EMS
PROFESSIONAL PROJECT DOCUMENTATION

Document version: 1.1
Last updated: 16 November 2026
Project: SmartDesk EMS
Project type: Employee Management System
Primary users: Admin and Employee
Framework: Next.js App Router
Language: TypeScript
Database: Neon PostgreSQL
ORM: Drizzle ORM


======================================================================
1. PROJECT OVERVIEW
======================================================================
SmartDesk EMS is a full-stack employee management system designed for
organization-level staff administration. It supports two primary roles:

1. Admin
2. Employee

The system was built to provide a clean operational workflow for:

- employee profile creation and maintenance
- department management
- leave request submission and review
- salary record creation and history viewing
- secure role-based login and session handling
- profile and password management

The public `/login` route also serves as the responsive product landing page.
It introduces the platform, summarizes its core capabilities, and connects
directly to the secure server-side authentication flow.

The user interface follows a dashboard-style layout inspired by the
provided UI references:

- dark navy sidebar
- teal top header
- light gray page background
- white content cards
- clear table-based data presentation
- simple, professional, business-oriented layout

The landing and login experience uses a responsive teal and navy enterprise
design. It is optimized for desktop, tablet, and phone layouts down to a
320-pixel viewport, with accessible 44-pixel navigation and form targets.


======================================================================
2. BUSINESS PURPOSE
======================================================================

This project is intended to help a company manage employees in a
centralized system.

The business goals of the platform are:

- allow admins to maintain employees, departments, salaries, and leave flow
- allow employees to access only their own profile, leave, and salary data
- keep organizational data secure through role-based access control
- reduce manual HR work by using structured forms, validation, and history
- support future expansion through a scalable database and modular codebase


======================================================================
3. HIGH-LEVEL FEATURE SUMMARY
======================================================================

Admin side features:

- secure admin login
- admin dashboard with summary cards
- employee CRUD management
- department CRUD management
- leave review and approval or rejection
- salary record creation
- admin profile update
- admin password change

Employee side features:

- secure employee login
- employee dashboard
- own profile view and limited update
- leave request creation
- leave history tracking
- salary history viewing
- password change

Platform-level features:

- role-based route protection
- session cookie authentication
- validation using Zod
- forms using React Hook Form
- database integration using Drizzle and Neon
- image upload support using Cloudinary
- toast feedback using Sonner
- audit log structure for change tracking
- responsive public landing and login page
- light and dark theme support with persisted local preference
- login attempt rate limiting
- accessible validation messages and password visibility control


======================================================================
4. TECHNOLOGY STACK
======================================================================

Frontend and framework:

- Next.js 16.4.6
- React 19
- TypeScript
- Tailwind CSS v4

UI support:

- custom reusable UI components
- Lucide React icons
- Sonner notifications

Backend and security:

- Next.js server actions
- jose for session token signing and verification
- bcrypt for password hashing
- middleware for role-based access enforcement
- in-memory login rate limiting

Database and data layer:

- Neon PostgreSQL
- Drizzle ORM
- Drizzle Kit

Validation and forms:

- React Hook Form
- Zod
- @hookform/resolvers

Uploads:

- Cloudinary

Dependency and tooling status:

- Next.js and eslint-config-next are aligned at 16.4.6-compatible releases
- Zod is constrained to a patched 4.6.x release
- npm overrides keep transitive esbuild and minimatch dependencies patched
- bcrypt and esbuild install scripts are explicitly approved in package.json
- the current lockfile audits with zero known npm vulnerabilities


======================================================================
5. REPOSITORY STRUCTURE
======================================================================

Important folders and files:

- src/app
  Contains all App Router pages, role layouts, login screen, and route groups.

- src/components
  Contains shared UI, layout components, form components, and action buttons.

- src/db
  Contains the Drizzle schema, database connection, and seed script.

- src/lib
  Contains business logic including auth, actions, queries, env parsing,
  utilities, constants, validations, Cloudinary helper, and rate limit helper.

- drizzle
  Contains generated SQL migrations and metadata snapshots.

- middleware.ts
  Protects admin and employee routes based on authenticated role.

- .env
  Holds database, auth, Cloudinary, and admin seed credentials.

- README.md
  Quick-start guide.

- document.md
  This full operational documentation.

- .env.example
  Safe environment-variable template without production secrets.


======================================================================
6. HOW THE PROJECT WAS BUILT
======================================================================

The project was built in the following logical order.

Step 1. Base application initialization

- A new Next.js application was scaffolded with:
  - TypeScript
  - App Router
  - Tailwind CSS
  - ESLint
- The generated starter code was moved to the repository root.

Step 2. Core dependencies installation

The system was prepared with the following core packages:

- drizzle-orm
- drizzle-kit
- @neondatabase/serverless
- bcrypt
- jose
- cloudinary
- react-hook-form
- zod
- @hookform/resolvers
- sonner
- lucide-react
- clsx
- tailwind-merge
- class-variance-authority
- date-fns
- dotenv

Step 3. Environment integration

The `.env` file was used to connect:

- Neon database
- Cloudinary storage
- auth session secret
- app base URL
- seed admin credentials

Validation for environment variables is handled in:

- src/lib/env.ts

This prevents booting the application with missing required config.

Step 4. Design system and UI shell

The app theme was created with:

- teal header
- dark sidebar
- shell gray background
- white cards
- reusable button, input, card, badge, table, avatar, empty state, and stat card

These components are in:

- src/components/ui
- src/components/layout

The public landing/login page was later rebuilt as a responsive enterprise
hero with:

- compact EMS branding and navigation
- product overview and capability list
- prominent backend-connected login card
- responsive stacking below wide desktop layouts
- accessible password reveal control and field errors
- decorative background treatment without external image dependencies

Step 5. Database design

The PostgreSQL schema was defined in Drizzle using:

- users
- departments
- employees
- leave_requests
- salaries
- audit_logs

The schema includes:

- foreign keys
- enum types
- unique constraints
- indexes
- cascading rules where appropriate

Schema file:

- src/db/schema.ts

Step 6. Authentication and authorization

Authentication was implemented as a custom credentials-based system.

Process:

- user submits email and password
- input is validated using Zod
- email is checked against the users table
- bcrypt compares the submitted password with the stored password hash
- if valid, a signed session token is generated using jose
- token is saved into an HTTP-only cookie
- middleware checks this cookie on protected routes
- users are redirected based on role

Auth files:

- src/lib/auth.ts
- middleware.ts
- src/lib/actions.ts

Step 7. Query and mutation layer

The system separates read and write logic:

- read logic is handled in src/lib/queries.ts
- write logic is handled in src/lib/actions.ts

This makes the code easier to maintain and reason about.


======================================================================
7. BUILD AND RUN GUIDE
======================================================================

7.1 Required environment setup

Before running the project, confirm `.env` contains:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- NEXT_PUBLIC_APP_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ENCRYPTION_KEY
- NODE_ENV

Validation requirements:

- `NEXTAUTH_SECRET` must contain at least 32 characters
- `ENCRYPTION_KEY` must contain at least 32 characters
- `ADMIN_PASSWORD` must contain at least 8 characters
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` must be valid URLs
- `NODE_ENV` must be `development`, `test`, or `production`
- when `NEXTAUTH_URL` is omitted at runtime, the application falls back to
  `NEXT_PUBLIC_APP_URL`

7.2 First-time setup

Run these commands:

1. npm install
2. npm run db:migrate
3. npm run db:seed
4. npm run dev

Open:

- http://localhost:3000

7.3 Development commands

- npm run dev
  Starts the local development server.

- npm run lint
  Runs ESLint checks.

- npm run type-check
  Runs TypeScript validation without generating output files.

- npm run build
  Creates a production build.

- npm run start
  Runs the production build after it is created.

7.4 Database commands

- npm run db:generate
  Generates a new SQL migration from the Drizzle schema.

- npm run db:migrate
  Applies pending migrations to the database.

- npm run db:push
  Pushes schema changes directly. Use carefully. Prefer migrations for teams.

- npm run db:seed
  Seeds the database with initial test data.

- npm run db:studio
  Opens Drizzle Studio for visual table inspection.


======================================================================
8. AUTHENTICATION FLOW
======================================================================

8.1 Login flow

1. User opens `/login`
2. The responsive landing page presents the EMS overview and login card
3. User enters email and password
4. Form validates required fields
5. Server validates email format and password length
6. Login rate limiting checks the client/email attempt key
7. Database checks whether the account exists and is active
8. bcrypt verifies the password hash
9. If valid:
   - session token is created
   - session cookie is saved
   - redirect happens by role
10. If invalid:
   - login fails
   - error message is shown

8.2 Logout flow

1. User clicks logout
2. Session cookie is removed
3. User is redirected to `/login`

8.3 Role protection

Admin can access:

- /admin/*

Employee can access:

- /employee/*

Unauthorized access behavior:

- unauthenticated user is redirected to login
- wrong role is redirected to forbidden page


======================================================================
9. ADMIN MANAGEMENT GUIDE
======================================================================

This section explains how an admin should operate the platform step by step.


----------------------------------------------------------------------
9.1 Admin login
----------------------------------------------------------------------

Step-by-step:

1. Open the app.
2. Go to `/login`.
3. Enter the seeded admin email from `.env`.
4. Enter the seeded admin password from `.env`.
5. Submit the login form.
6. The app redirects to `/admin/dashboard`.


----------------------------------------------------------------------
9.2 Admin dashboard
----------------------------------------------------------------------

Main purpose:

- provide quick overview of the organization
- show employee and leave trends
- provide direct access to key actions

Dashboard content:

- total employees
- total departments
- monthly payroll
- total leave requests
- approved leaves
- pending leaves
- rejected leaves
- recent employees
- recent leave requests
- department overview
- salary snapshot

How admin should use it:

1. Check staffing totals.
2. Review pending leave count.
3. Review recent employee additions.
4. Use quick links to add employees or salary records.


----------------------------------------------------------------------
9.3 Employee management by admin
----------------------------------------------------------------------

Primary route:

- /admin/employees

Admin can:

- search employees
- filter by department
- create employee
- view employee details
- edit employee
- inspect salary and leave context
- deactivate employee

How to add a new employee:

1. Go to `/admin/employees`.
2. Click `Add New Employee`.
3. Fill the employee form:
   - name
   - email
   - employee ID
   - date of birth
   - gender
   - marital status
   - designation
   - department
   - salary
   - phone
   - joining date
   - role
   - status
   - password
   - optional image
   - address
4. Submit the form.
5. The server validates:
   - email format
   - employee ID
   - uniqueness of email
   - uniqueness of employee ID
6. Password is hashed.
7. User row and employee row are inserted.
8. If image is uploaded, Cloudinary stores it.
9. The admin is redirected to the employee detail page.

How to edit an employee:

1. Open `/admin/employees`.
2. Click `Edit`.
3. Update needed fields.
4. Submit the form.
5. The server:
   - checks record exists
   - checks unique email if changed
   - checks unique employee ID if changed
   - uploads replacement image if provided
   - updates user table
   - updates employee table
   - removes old Cloudinary image if replaced

How to view employee details:

1. Click `View`.
2. Review profile summary:
   - personal details
   - contact info
   - department
   - salary summary
   - recent leaves
   - recent salary history

How to deactivate an employee:

1. Click `Delete`.
2. Confirm the action.
3. The system:
   - sets `users.is_active = false`
   - sets `employees.status = inactive`
4. Historical leave and salary data remain intact.

Important admin rules:

- admin cannot deactivate own account from employee screen
- email must stay unique
- employee ID must stay unique
- employee data is split across `users` and `employees`


----------------------------------------------------------------------
9.4 Department management by admin
----------------------------------------------------------------------

Primary route:

- /admin/departments

Admin can:

- create department
- edit department
- search department
- delete department if safe

How to create a department:

1. Go to `/admin/departments`.
2. Click `Add New Department`.
3. Enter:
   - department name
   - description
4. Submit.
5. Server validates the input.
6. Name uniqueness is checked.
7. Department row is inserted.

How to edit a department:

1. Click `Edit`.
2. Modify name or description.
3. Submit.
4. Server checks uniqueness again.

How to delete a department:

1. Click `Delete`.
2. Confirm the action.
3. The server checks if active employees are still assigned.
4. If active employees exist, deletion is blocked.
5. If none exist, deletion succeeds.

Management note:

Before deleting a department, reassign employees or deactivate them first.


----------------------------------------------------------------------
9.5 Leave management by admin
----------------------------------------------------------------------

Primary routes:

- /admin/leaves
- /admin/leaves/[id]

Admin can:

- search leave requests
- filter by status
- open leave detail page
- approve leave
- reject leave
- add admin note

How to review a leave request:

1. Open `/admin/leaves`.
2. Search by employee ID or filter by status.
3. Click `View`.
4. Review:
   - employee
   - leave type
   - department
   - date range
   - reason
   - total days
5. Enter optional admin note.
6. Click `Approve` or `Reject`.
7. System updates:
   - leave status
   - reviewedAt
   - reviewedBy
   - adminNote

Important leave rules:

- only pending requests can be reviewed
- already reviewed requests cannot be re-reviewed by current flow
- leave totals are calculated automatically


----------------------------------------------------------------------
9.6 Salary management by admin
----------------------------------------------------------------------

Primary routes:

- /admin/salary
- /admin/salary/new

Admin can:

- search salary records
- filter by date range
- create salary entry

How to create a salary record:

1. Open `/admin/salary/new`.
2. Select department.
3. Select employee from that department.
4. Enter:
   - basic salary
   - allowance
   - deduction
   - pay date
5. Review the total preview.
6. Submit.
7. System validates:
   - selected employee exists
   - employee belongs to selected department
   - amounts are valid
8. Total is calculated as:

   totalSalary = basicSalary + allowance - deduction

9. Salary row is inserted.

Salary management rules:

- salary is stored as historical data
- department and employee relationship is verified before insert
- salaries are visible to admin and relevant employee


----------------------------------------------------------------------
9.7 Admin settings
----------------------------------------------------------------------

Primary route:

- /admin/settings

Admin can:

- change own name and email
- change password

How to update admin profile:

1. Open admin settings.
2. Update full name and email.
3. Submit.
4. System checks if the new email is already in use.
5. If valid, it updates the user record.

How to change admin password:

1. Enter old password.
2. Enter new password.
3. Confirm new password.
4. Submit.
5. System validates:
   - old password matches current hash
   - new password and confirm password match
6. Password is re-hashed and updated.


======================================================================
10. EMPLOYEE MANAGEMENT GUIDE
======================================================================

This section explains how an employee should use the platform step by step.


----------------------------------------------------------------------
10.1 Employee login
----------------------------------------------------------------------

Seeded employee password:

- the value configured in `SEED_EMPLOYEE_PASSWORD`

Step-by-step:

1. Open `/login`.
2. Enter seeded employee email.
3. Enter password.
4. Submit.
5. App redirects to `/employee/dashboard`.


----------------------------------------------------------------------
10.2 Employee dashboard
----------------------------------------------------------------------

Primary route:

- /employee/dashboard

Employee sees:

- welcome card
- own profile summary
- pending leaves
- approved leaves
- rejected leaves
- latest salary info
- recent leave table
- recent salary table

How employee should use it:

1. Check leave status counts.
2. Review latest salary.
3. Quickly confirm recent request history.


----------------------------------------------------------------------
10.3 My Profile
----------------------------------------------------------------------

Primary route:

- /employee/profile

Employee can:

- view own profile
- update limited fields
- upload or replace profile image

Fields the employee can update:

- name
- phone
- address
- marital status
- profile image

Fields employee can only view:

- email
- employee ID
- department
- designation
- joining date

How to update profile:

1. Open profile page.
2. Review current profile summary.
3. Edit allowed fields.
4. Optionally upload a new profile image.
5. Submit.
6. System updates:
   - users.name
   - employees.phone
   - employees.address
   - employees.marital_status
   - employees.image_url and Cloudinary public id if new image uploaded


----------------------------------------------------------------------
10.4 Leave requests by employee
----------------------------------------------------------------------

Primary routes:

- /employee/leave
- /employee/leave/new

Employee can:

- view own leave history
- filter own leave list
- create leave request

How to create a leave request:

1. Go to `/employee/leave/new`.
2. Select leave type.
3. Select from date.
4. Select to date.
5. Enter reason.
6. Submit.
7. System validates:
   - start date exists
   - end date exists
   - end date is not before start date
   - reason length is acceptable
8. Total days is calculated automatically.
9. Leave is saved as pending.

How employee tracks leave status:

1. Go to `/employee/leave`.
2. Review table.
3. See whether each request is:
   - pending
   - approved
   - rejected
4. Review admin note when available.


----------------------------------------------------------------------
10.5 Salary history by employee
----------------------------------------------------------------------

Primary route:

- /employee/salary

Employee can:

- view only own salary records
- filter by date range

How to use it:

1. Open salary page.
2. Optionally choose from date and to date.
3. Apply filter.
4. Review:
   - pay date
   - basic salary
   - allowance
   - deduction
   - total salary


----------------------------------------------------------------------
10.6 Employee settings
----------------------------------------------------------------------

Primary route:

- /employee/settings

Employee can:

- change password

How to change password:

1. Enter old password.
2. Enter new password.
3. Confirm new password.
4. Submit.
5. System validates and updates password securely.


======================================================================
11. DATABASE DESIGN AND CONTROL
======================================================================

Database layer files:

- src/db/schema.ts
- src/db/index.ts
- drizzle.config.ts
- drizzle/0000_little_tarantula.sql
- src/db/seed.ts


----------------------------------------------------------------------
11.1 Main tables
----------------------------------------------------------------------

users

Purpose:

- authentication
- identity
- role control

Key fields:

- id
- name
- email
- password_hash
- role
- employee_id
- is_active
- created_at
- updated_at

departments

Purpose:

- organizational grouping

Key fields:

- id
- name
- description
- created_at
- updated_at

employees

Purpose:

- employee-specific business profile

Key fields:

- id
- user_id
- employee_id
- department_id
- designation
- dob
- gender
- marital_status
- phone
- address
- joining_date
- image_url
- cloudinary_public_id
- base_salary
- status

leave_requests

Purpose:

- leave workflow

Key fields:

- id
- employee_id
- leave_type
- start_date
- end_date
- total_days
- reason
- status
- admin_note
- applied_at
- reviewed_at
- reviewed_by

salaries

Purpose:

- payroll history

Key fields:

- id
- employee_id
- department_id
- basic_salary
- allowance
- deduction
- total_salary
- pay_date
- created_by

audit_logs

Purpose:

- record important actions for traceability

Examples:

- employee.created
- employee.updated
- employee.deactivated
- department.created
- department.updated
- department.deleted
- leave.approved
- leave.rejected
- salary.created
- password.changed


----------------------------------------------------------------------
11.2 Relationships
----------------------------------------------------------------------

- one user may map to one employee record
- one department may have many employees
- one employee may have many leave requests
- one employee may have many salary records
- admin user may review many leave requests
- admin user may create many salary records


----------------------------------------------------------------------
11.3 Database control workflow
----------------------------------------------------------------------

When changing the schema:

1. Update `src/db/schema.ts`
2. Run `npm run db:generate`
3. Review generated SQL in `drizzle/`
4. Run `npm run db:migrate`
5. If seed needs updates, edit `src/db/seed.ts`
6. Re-run `npm run db:seed` only when appropriate

When inspecting data:

1. Run `npm run db:studio`
2. Open Drizzle Studio
3. Inspect tables and row relationships

When introducing production schema changes:

1. make a schema change in code
2. generate a migration
3. review the SQL manually
4. back up production data if needed
5. apply migration
6. verify app behavior


----------------------------------------------------------------------
11.4 Important database safety rules
----------------------------------------------------------------------

- users.email is unique
- users.employee_id is unique
- departments.name is unique
- employees.employee_id is unique
- employees.user_id is unique
- foreign keys protect relational integrity
- active department deletion is blocked by business logic
- leave records keep approval metadata
- salary records preserve payroll history


----------------------------------------------------------------------
11.5 Seed data behavior
----------------------------------------------------------------------

Seed script adds:

- 1 admin account
- 3 departments
- 4 employees
- leave samples
- salary samples

Seed behavior is idempotent in a practical sense:

- it checks for existing departments
- it checks for existing admin by email
- it checks for existing employees by email and user mapping
- it avoids reseeding leave or salary if those tables already contain data

Important admin credential behavior:

- the seed script looks up an existing admin by the current `ADMIN_EMAIL`
- it does not automatically rename or reset an older admin when `.env`
  credentials change after the first seed
- changing `ADMIN_EMAIL` or `ADMIN_PASSWORD` therefore requires an explicit,
  reviewed database credential synchronization or a fresh development database


======================================================================
12. HOW TO HANDLE DATABASE OPERATIONS SAFELY
======================================================================

Recommended rules for database management:

1. Never edit production tables manually unless absolutely necessary.
2. Prefer schema changes through Drizzle migrations.
3. Keep `.env` safe because it contains live database credentials.
4. Do not hardcode credentials inside source files.
5. Review generated migration SQL before applying in production.
6. Use seed data only in development or staging.
7. If data changes are business-critical, back up before migration.

Recommended operational habits:

- run `npm run type-check` before deployment
- run `npm run lint` before deployment
- run `npm run build` before deployment
- keep migration history committed to git
- confirm route access by both roles after important changes


======================================================================
13. ERROR HANDLING STRATEGY
======================================================================

The project already includes multiple layers of error handling.


----------------------------------------------------------------------
13.1 Validation errors
----------------------------------------------------------------------

Handled by:

- Zod schemas
- React Hook Form
- server-side validation in actions

Examples:

- invalid email
- missing required input
- end date before start date
- salary negative values
- password confirmation mismatch

What happens:

- server action returns `status: error`
- fieldErrors are returned where possible
- UI shows toast and field-specific message


----------------------------------------------------------------------
13.2 Authentication errors
----------------------------------------------------------------------

Examples:

- wrong email
- wrong password
- missing session cookie
- expired or invalid session token

What happens:

- login shows invalid credential message
- protected routes redirect to login
- role mismatch redirects to forbidden page


----------------------------------------------------------------------
13.3 Authorization errors
----------------------------------------------------------------------

Examples:

- employee opening admin page
- non-authenticated user opening dashboard route

What happens:

- middleware intercepts request
- user is redirected appropriately


----------------------------------------------------------------------
13.4 Business rule errors
----------------------------------------------------------------------

Examples:

- duplicate email during employee creation
- duplicate employee ID
- duplicate department name
- deleting a department with active employees
- approving a leave request that was already reviewed
- creating salary for employee in wrong department
- missing employee profile for a logged-in employee account

What happens:

- action returns a controlled error message
- UI shows toast
- data is not modified


----------------------------------------------------------------------
13.5 Upload errors
----------------------------------------------------------------------

Potential issues:

- invalid file type
- empty file upload
- Cloudinary upload failure

Current behavior:

- non-image files are rejected by helper logic
- upload exceptions stop update flow

Recommended future improvements:

- add file size limits in UI
- show upload-specific error state
- add retry option for upload failures


----------------------------------------------------------------------
13.6 Database and infrastructure errors
----------------------------------------------------------------------

Potential issues:

- database connection failure
- failed migration
- bad environment config
- Neon outage
- Cloudinary outage

Current control points:

- env validation prevents app boot with missing config
- build and migration commands reveal setup failures
- server actions stop and return failure if operation cannot proceed

Recommended future improvements:

- add centralized logger
- add error boundary pages
- add monitoring using Vercel or third-party observability
- add retry or fallback behavior for external services


======================================================================
14. HOW TO HANDLE ERRORS STEP BY STEP
======================================================================

This section explains what to do when something goes wrong.


----------------------------------------------------------------------
14.1 Login is not working
----------------------------------------------------------------------

Checklist:

1. Confirm `.env` contains correct `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
2. Confirm the admin email stored in Neon matches `ADMIN_EMAIL`.
3. Confirm database has seeded data by running `npm run db:seed`.
4. Remember that reseeding does not update an older admin with a different email.
5. Confirm password is correct:
   - admin uses `.env` admin password
   - seeded employee users use the value configured in `SEED_EMPLOYEE_PASSWORD`
6. Confirm `NEXTAUTH_SECRET` is set and is at least 32 characters.
7. Restart the dev server after `.env` changes.


----------------------------------------------------------------------
14.2 Routes show forbidden or redirect incorrectly
----------------------------------------------------------------------

Checklist:

1. Confirm the logged-in account role in `users.role`.
2. Confirm middleware is active.
3. Clear browser cookies and log in again.
4. Verify the account is active:
   - `users.is_active = true`
5. Confirm employee account has matching employee record if using employee routes.


----------------------------------------------------------------------
14.3 Database commands fail
----------------------------------------------------------------------

Checklist:

1. Confirm `DATABASE_URL` is correct.
2. Confirm internet access to Neon.
3. Run:
   - npm run db:generate
   - npm run db:migrate
4. Review migration SQL for syntax or logic problems.
5. If schema and DB are out of sync, inspect through Drizzle Studio.


----------------------------------------------------------------------
14.4 Image upload fails
----------------------------------------------------------------------

Checklist:

1. Confirm Cloudinary credentials in `.env`.
2. Confirm selected file is an image.
3. Confirm upload network access is available.
4. Confirm Cloudinary account limits are not exceeded.


----------------------------------------------------------------------
14.5 Employee or department cannot be created
----------------------------------------------------------------------

Checklist:

1. Check field validation messages.
2. Check uniqueness:
   - email
   - employee ID
   - department name
3. Confirm all required fields are submitted.


----------------------------------------------------------------------
14.6 Department cannot be deleted
----------------------------------------------------------------------

Reason:

- active employees are still assigned to the department

Fix:

1. move employees to another department, or
2. deactivate employees, then
3. try deletion again


----------------------------------------------------------------------
14.7 Leave cannot be submitted
----------------------------------------------------------------------

Checklist:

1. check start date
2. check end date
3. check end date is not before start date
4. check reason is long enough
5. confirm employee session has employee profile mapping


----------------------------------------------------------------------
14.8 Build fails
----------------------------------------------------------------------

Checklist:

1. run `npm run lint`
2. run `npm run type-check`
3. run `npm run build`
4. confirm `.env` is valid
5. confirm dependencies are installed
6. confirm TypeScript errors are resolved


======================================================================
15. OPERATIONAL MAINTENANCE GUIDE
======================================================================

Recommended maintenance routine:

Daily or before deployment:

1. pull latest code
2. install dependencies if needed
3. run `npm run type-check`
4. run `npm run lint`
5. run `npm run build`

When schema changes:

1. update schema
2. generate migration
3. review SQL
4. apply migration
5. test related routes

When adding new admin feature:

1. add validation schema
2. add query logic if needed
3. add server action
4. add page and form
5. revalidate related routes
6. test role access

When adding new employee feature:

1. confirm employee-only authorization
2. limit data queries to logged-in employee record
3. validate inputs on server
4. test cross-role access restrictions


======================================================================
16. DEPLOYMENT MANAGEMENT NOTES
======================================================================

Recommended deployment target:

- Vercel

Production checklist:

1. add environment variables in Vercel
2. confirm production database URL
3. confirm Cloudinary credentials
4. set `NEXTAUTH_URL` to production domain
5. set `NEXT_PUBLIC_APP_URL` to the production domain
6. run `npm run type-check`
7. run `npm run lint`
8. run `npm run build`
9. apply migrations to production DB
10. verify login flow
11. verify admin routes
12. verify employee routes
13. verify uploads and dashboard data

Production caution:

- do not run seed on production unless intentional
- keep admin credentials secret
- rotate secrets if exposed


======================================================================
17. CURRENT LIMITATIONS AND FUTURE IMPROVEMENTS
======================================================================

Current limitations:

- no forgot password email flow
- no advanced analytics charts beyond summary blocks
- no attendance module
- no PDF payroll export
- no external logging service
- no advanced pagination yet

Recommended next upgrades:

- attendance management
- payroll PDF download
- notification center
- email alert for leave decision
- audit log dashboard
- stronger rate limiting with durable storage
- role-based permission matrix beyond admin and employee
- archive and restore for deactivated employees


======================================================================
18. QUICK COMMAND REFERENCE
======================================================================

Install dependencies:

- npm install

Run locally:

- npm run dev

Lint:

- npm run lint

Type-check:

- npm run type-check

Production build:

- npm run build

Generate migration:

- npm run db:generate

Apply migration:

- npm run db:migrate

Seed database:

- npm run db:seed

Open Drizzle Studio:

- npm run db:studio


======================================================================
19. FINAL SUMMARY
======================================================================
SmartDesk EMS is a structured, production-style employee management system
built with a modern full-stack architecture.

Its strongest implementation points are:

- clean App Router structure
- secure role-based session handling
- validated server-side actions
- consistent admin and employee workflows
- proper relational schema design
- migration and seed support
- business-rule enforcement for departments, employees, leave, and salary

This project can be maintained safely by following the documented command
flow, schema migration process, and operational rules defined above.

For daily usage:

- admins manage organization data from the admin panel
- employees manage only their own data from the employee panel
- database changes are controlled through Drizzle migrations
- errors are handled through validation, route protection, and controlled
  server-side responses

## Phase 11 release readiness

The project now includes unit tests, an isolated PostgreSQL integration test, Playwright smoke and role/workflow suites, global error and not-found pages, a database-aware health endpoint, and structured redacted server logging through Next.js instrumentation.

Use `npm run quality` for the non-browser quality gates and `npm run test:e2e` for browser journeys. Database-mutating browser tests are disabled unless an operator explicitly confirms an isolated test database. See `docs/release-readiness.md` for environment requirements, the verified behavior matrix, deployment sequence, rollback/restore procedure, performance notes, and remaining release decisions.

End of document.
