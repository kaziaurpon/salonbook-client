# SalonBook Requirements and Progress Checklist

This is the tracking checklist for the complete assignment. It is intentionally kept in the client repository so progress survives chat context changes. After each implementation task, update the relevant items and verify the result against the original assignment.

Status: `[x]` complete, `[~]` partly complete, `[ ]` not complete.

## Current status

- [x] Separate local Git repositories exist for `client/` and `server/`; no parent Git repository.
- [x] Public GitHub repositories exist and are configured as the matching `origin` remotes.
- [x] Independent `package.json`, lockfile, `.gitignore`, `.env.example`, and README exist for each app.
- [x] TypeScript scaffold: Next.js App Router client; Express API; Mongoose MongoDB connection; health endpoint.
- [x] Client and server production builds compile.
- [x] User confirmed both apps and the MongoDB connection run locally.
- [~] READMEs exist, but the full assignment sections/links and feature instructions remain to be completed.
- [~] Authentication foundation is implemented: Better Auth, registration/login, Google provider config, JWT handoff, Express JWT and live-role guards. End-to-end auth still needs local credentials and account testing.
- [~] Public service browsing, service model/API, protected details, admin service management/image upload, and appointment request/status workflows are implemented; full dashboard overview and payments remain.
- [x] One initial scaffold commit exists in each repository and has been pushed.
- [~] Required meaningful commit totals are in progress: 4/20 client, 5/12 server. The client branch currently has one previously made local commit that is not pushed.
- [ ] Product features are not deployed; live website and submission links remain outstanding.

## Repository, documentation, and delivery

- [x] Separate client and server repositories; no parent repository.
- [x] Client repository: `https://github.com/kaziaurpon/salonbook-client`.
- [x] Server repository: `https://github.com/kaziaurpon/salonbook-server`.
- [~] Meaningful client commits: 4/20; continue with meaningful messages.
- [~] Meaningful server commits: 5/12; continue with meaningful messages. Current local branch matches its GitHub remote.
- [ ] Client README: description, features, stack, install/run instructions, environment variable names, live link, client/server repository links.
- [ ] Server README: description, features, stack, install/run instructions, environment variable names, live link, client/server repository links.
- [ ] Production deployment and working live site URL.
- [ ] Securely provision evaluator admin credentials and provide submission details.

## Shared layout and public pages

- [x] SalonBook home page has an original salon-inspired banner illustration, featured active services from the API, category links, and a useful appointment-planning section.
- [x] Public navbar links to Home, Browse Services, Sign In, and Sign Up; signed-in users see their role-appropriate dashboard and Sign Out.
- [~] Authenticated navbar state is shown; profile dropdown and name display remain to be added.
- [~] Footer has logo, description, navigation, and copyright; salon contact/address/hours and social links remain to be supplied.
- [x] Original responsive salon-themed public design implemented for desktop, tablet, and mobile with reusable components.
- [x] Shared Powder Blue `#8DB9F0`, Lavender `#E9E8F8`, and Peach `#F5B69E` design tokens and 60/30/10 guidance applied across current page styles; future page guidance documented in `DESIGN_SYSTEM.md`.
- [ ] Working links/buttons, status badges, confirmation dialogs; avoid unnecessary animation/clutter.
- [x] Home banner has title, description, original salon-inspired CSS illustration, and Explore Services CTA.
- [x] Home featured section requests up to six active services from the API; cards show image, name, category, price, duration, short description, and details link (actual count depends on active database records).
- [x] Home categories are loaded from the API and link to the matching Browse Services filter.
- [x] Additional appointment-planning section explains how to find a service and request a time.
- [x] Public Browse Services page shows active services in responsive cards when records exist.
- [x] Public Services page shows active-only service cards; API supports search by name, category filter, and price sorting.
- [x] Services page has loading, API error/retry, empty, and invalid service route states.

## Authentication and access control

- [x] Better Auth configured with environment-based URL/secret and official MongoDB adapter; auth-owned users, sessions, accounts, verifications, and JWKS share the MongoDB database.
- [~] Email/password registration and login implemented; Google OAuth is ready but requires credentials and callback configuration.
- [x] Registration fields include full name, email, password, and optional profile image URL (assignment permits URL or upload).
- [x] Password validation: minimum six characters, at least one uppercase and one lowercase letter; server-side Better Auth hook plus client validation.
- [x] Loading states, toast success/error feedback, and role-based post-auth redirects.
- [x] Public registration cannot set role/isBlocked; admin promotion is available only through a local CLI provisioning command.
- [x] Express verifies JWT signature, issuer, audience, and expiry through Better Auth JWKS, then reads current role and isBlocked from Better Auth's users collection.
- [x] Express server-side auth and role guard middleware; protected customer/admin API examples included.
- [x] Client dashboard route gates redirect unauthenticated users and wrong-role visits; session is Better Auth cookie-based.
- [x] Blocked accounts are signed out from client dashboard gates and denied by protected Express APIs.
- [x] Better Auth session hook updates client auth state; app uses session state on protected dashboard routes.
- [~] Auth feature builds successfully and the local admin provisioning CLI has created/promoted an account in MongoDB; email/password login, Google OAuth, and separate customer/admin API flows still need local verification. The recent build environment could not create Better Auth indexes, so confirm Atlas connectivity and index creation from the user's machine before relying on fresh auth records.

## Service details, booking, and customer dashboard

- [x] Protected `/services/[id]` details page shows image, name, category, description, price, duration, and customer appointment form.
- [x] Invalid service IDs show a useful error; inactive services are omitted from public detail/list APIs.
- [x] Only authenticated customers can request appointments; admins cannot book as customers.
- [x] Booking form: date, predefined time slot, optional message; validation and toast feedback.
- [x] New appointment defaults to pending/unpaid; stores service/customer references and service price snapshot.
- [x] Prevent duplicate active requests for the same date and time slot with a unique active-slot reservation.
- [x] Customer can cancel only their own pending request; cannot cancel confirmed/cancelled requests.
- [x] Customer appointment overview totals: total, pending, confirmed, cancelled requests.
- [x] Customer appointment list shows service image/name/category, date/time, price, appointment status, payment status, and message.
- [ ] Customer can view appointment details and payment status/history.
- [ ] Customer can pay only for confirmed, unpaid appointments; cannot pay pending/cancelled appointments.
- [ ] Customer profile page supports permitted profile edits.

## Admin dashboard and management

- [x] Admin dashboard overview: registered customers, active services, appointment totals/statuses, and appointments marked paid; counts are served from the protected admin API.
- [x] Admin services list, create, update, delete, activate/deactivate; API checks admin role and the list is paginated.
- [x] Service form: name, category, description, positive price, positive duration, image upload, status active by default.
- [x] Service image upload uses the server-only ImgBB key; file type/size and upload failures are handled.
- [x] Admin destructive actions use an in-app confirmation dialog and CRUD actions report success/failure with toast notifications.
- [x] Only active services are public and available for future booking.
- [x] Admin sees all appointment requests with customer/service details, date/time, message, price, and statuses.
- [x] Admin can confirm only pending requests; can cancel pending or confirmed requests.
- [ ] Admin can list/view registered customers and block/unblock customers.
- [ ] Admin can view transactions with customer, service, appointment date, amount, currency, Stripe reference, status, date.
- [ ] Admin cannot manually mark a payment successful.
- [ ] Admin profile page supports permitted profile edits.

## Stripe payment and transactions

- [ ] Backend creates Stripe Checkout only for an eligible confirmed appointment.
- [ ] Success and cancel pages show appropriate status and guidance.
- [ ] Stripe webhook signature is verified before any payment update.
- [ ] Only a verified successful webhook sets appointment payment status to paid.
- [ ] Verified webhook stores transaction; webhook handling is idempotent.
- [ ] Failed/expired checkout, cancelled checkout, and webhook errors handled without falsely marking paid.
- [ ] Payment processing has a meaningful loading state and toast/error feedback.

## Profile, data model, and security

- [ ] Four business collections: users (Better Auth), services, appointments, transactions; references are correct and no redundant business collections.
- [x] Better Auth `users` records include name, email, image, role, isBlocked; profile phone remains future work.
- [x] Service model includes name, category, description, positive price, positive duration, image, status, and createdAt.
- [x] Appointment fields include serviceId, customerId, date, time, message, servicePrice, paymentStatus, status, and createdAt.
- [ ] Transaction fields include appointmentId, customerId, amount, currency, stripeSessionId, status, createdAt.
- [ ] User profile update allows name/image/phone only; cannot change role/isBlocked or another user's data.
- [x] Sensitive MongoDB, Better Auth, Google, Stripe, ImgBB, and application URL values are environment-only; examples contain names/empty values and `.env` files are ignored.
- [ ] Server-side authorization, input validation, error handling, and production CORS are correct.

## UX, reliability, and final verification

- [ ] Meaningful loaders for service fetch, dashboard data, booking submission, payment processing.
- [ ] Toast notifications for success/failure; no browser `alert()` for ordinary feedback.
- [ ] Handle API failures, invalid forms/routes, unauthorized access, upload failures, booking conflicts, payment failures/cancellation.
- [ ] Dashboard layout has responsive sidebar/main area, role-based navigation, statistic cards, and appropriate tables/lists.
- [x] Search by service name and sort by price work on the client and API; paginated API and category filtering are also available.
- [ ] Production deep links reload without 404; private routes work after refresh and remain authenticated.
- [ ] No CORS/404/504 issues on production.
- [~] Builds pass after service and booking work; local service CRUD, appointment lifecycle, ownership rules, image uploads, Stripe, and deployment still need manual verification.
- [ ] No secrets are exposed in client bundles, repository history, logs, or README.

## Decisions still to confirm or configure

- [ ] Production hosting/domains and allowed CORS/auth callback URLs.
- [ ] Google OAuth client credentials and callback configuration (for local: `http://localhost:3000/api/auth/callback/google`).
- [ ] Stripe test/live credentials and webhook endpoint configuration.
- [ ] ImgBB API key.
- [ ] Salon phone, address, hours, social links, and final category/content choices.
- [ ] Appointment capacity policy and paid-appointment cancellation/refund policy.
- [~] Local admin provisioning CLI verified; confirm whether this account will be used for evaluation, then provide evaluator credentials securely at submission time.
