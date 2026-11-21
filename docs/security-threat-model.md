# SmartDesk EMS security threat model

## Assets and trust boundaries

- Assets: credentials, sessions, employee profiles, leave/attendance history, salary records, payslips, audit events, and recovery tokens.
- Untrusted inputs: browser requests, URL identifiers, form fields, uploaded files, forwarded IP headers, and external password-reset delivery responses.
- Trusted boundaries: authenticated server actions, route handlers with object-level checks, the PostgreSQL database, configured Cloudinary image account, and the explicitly configured recovery delivery service.

## Resolved controls

- Next.js 16 `proxy.ts` performs optimistic redirects only. Layouts, actions, queries, and protected downloads retain server-side authorization.
- JWTs restrict algorithms, issuer and audience; active account and session-version checks occur against the database. Logout, password change, and password reset revoke existing tokens.
- Login and recovery throttling use a durable PostgreSQL counter suitable for multiple serverless instances. Keys are SHA-256 hashed before storage.
- Login and password-reset responses avoid account enumeration. Reset tokens are random, stored only as hashes, expire after 30 minutes, and are single use.
- Password reset delivery is sent only to an explicitly configured HTTPS service. Tokens and secrets are never logged.
- Uploads are limited to 5 MB JPEG/PNG/WebP images and verified by file signatures. Employee document storage remains unimplemented; public Cloudinary URLs must not be used for private documents.
- Security headers include CSP, clickjacking protection, MIME sniffing protection, restrictive permissions policy, referrer policy, and production HSTS.
- Protected CSV/PDF downloads enforce role/ownership and rate limits. Sensitive audit metadata avoids raw passwords, tokens, IP addresses, and unknown-user email addresses.
- Seeded employee passwords are no longer hardcoded and must be supplied explicitly.

## Recovery and lockout policy

- Login: five attempts per client key and per account key per 15-minute window. Either limit starts the cooldown.
- Password reset: three requests per client key and per account key per hour, always returning the same public response.
- Successful login clears the login counter. Administrative account reactivation does not restore old sessions.
- Reset completion and password changes increment `session_version`, revoking all existing sessions.

## Deployment checklist

- Rotate `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, database, Cloudinary, reset-delivery, and initial-admin credentials before production. Rotation of `NEXTAUTH_SECRET` intentionally invalidates all sessions.
- Configure HTTPS URLs and the password-reset delivery endpoint; test delivery without recording reset URLs.
- Apply pending database migrations before deployment.
- Run `npm audit`, type checking, tests, lint, and production build in CI.
- Restrict database and Cloudinary service credentials to server runtimes.
- Confirm reverse-proxy trusted-IP handling before relying on `x-forwarded-for` for abuse controls.
- Review audit retention, employee-data retention, and breach-response procedures with HR/legal.

## Tracked residual risks

- The custom authentication implementation does not provide MFA, breached-password screening, device/session inventory, or refresh-token rotation. Adopt a maintained authentication provider before higher-risk deployment.
- CSP currently permits inline scripts/styles for Next.js compatibility. A nonce-based CSP is recommended for a later hardening pass.
- Profile images use public Cloudinary delivery by design; sensitive documents require private authenticated storage and are not supported.
- PostgreSQL rate limiting is durable and distributed but can add database load during attacks. A managed edge rate limiter/WAF is recommended at scale.
- Password-reset email delivery depends on the configured external service and its own security/availability.
