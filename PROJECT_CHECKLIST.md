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
- [ ] No SalonBook product features are implemented yet beyond the placeholder home page and API health endpoint.
- [ ] No commits have been made. The assignment's meaningful commit counts remain outstanding.
- [ ] Nothing has been pushed or deployed.

## Repository, documentation, and delivery

- [x] Separate client and server repositories; no parent repository.
- [x] Client repository: `https://github.com/kaziaurpon/salonbook-client`.
- [x] Server repository: `https://github.com/kaziaurpon/salonbook-server`.
- [ ] At least 20 meaningful client commits with meaningful messages.
- [ ] At least 12 meaningful server commits with meaningful messages.
- [ ] Client README: description, features, stack, install/run instructions, environment variable names, live link, client/server repository links.
- [ ] Server README: description, features, stack, install/run instructions, environment variable names, live link, client/server repository links.
- [ ] Production deployment and working live site URL.
- [ ] Securely provision evaluator admin credentials and provide submission details.

## Shared layout and public pages

- [~] Initial responsive-capable Next.js app shell and placeholder home page exist; product UI is not implemented.
- [ ] SalonBook navbar with public links: Home, Browse Services, Sign In, Sign Up.
- [ ] Authenticated navbar state updates immediately; profile dropdown includes name, Dashboard, Logout.
- [ ] Footer includes logo/description, navigation, contact, address/hours, social links, copyright.
- [ ] Responsive salon-themed design for desktop, tablet, and mobile; consistent typography, spacing, colors, reusable components.
- [ ] Working links/buttons, status badges, confirmation dialogs; avoid unnecessary animation/clutter.
- [ ] Home banner with title, description, salon-themed image, Explore Services CTA.
- [ ] Home featured section shows at least six active database services with all required card fields.
- [ ] Home categories section supports exploring services by category.
- [ ] One additional home section.
- [ ] Public Browse Services page shows only active services in responsive cards.
- [ ] Service name search, category filter, price sorting.
- [ ] Loading and error/empty states for service retrieval and invalid routes.

## Authentication and access control

- [ ] Better Auth configured with secrets/URLs from environment variables and MongoDB adapter.
- [ ] Email/password registration and login; Google OAuth.
- [ ] Registration fields: full name, email, password, profile image upload or URL.
- [ ] Password validation: minimum six characters, at least one uppercase and one lowercase letter; enforced server-side.
- [ ] Success/error feedback and role-based post-auth redirects.
- [ ] Public signup cannot create admins; admin role assigned securely.
- [ ] JWT verification middleware on Express protected APIs; role checked server-side on every protected API.
- [ ] Protected route redirects for unauthenticated users; sessions persist through refresh.
- [ ] Admin and customer dashboard access is role-restricted, including direct URL attempts.
- [ ] Blocked accounts cannot access protected platform features.
- [ ] Client auth state changes immediately after sign-in/sign-out.

## Service details, booking, and customer dashboard

- [ ] Protected `/services/[id]` details page shows image, name, category, description, price, duration, and booking option.
- [ ] Invalid service IDs show a useful error; inactive services cannot be booked.
- [ ] Only authenticated customers can request appointments; admins cannot book as customers.
- [ ] Booking form: date, predefined time slot, optional message; validation and toast feedback.
- [ ] New appointment defaults to pending/unpaid; stores service/customer references and service price snapshot.
- [ ] Prevent duplicate active requests for the same date and time slot.
- [ ] Customer can cancel only their own pending request; cannot cancel confirmed/cancelled requests.
- [ ] Customer dashboard overview totals: total, pending, confirmed, cancelled appointments.
- [ ] Customer appointment list shows service image/name/category, date/time, price, status, payment status, request date.
- [ ] Customer can view appointment details and payment status/history.
- [ ] Customer can pay only for confirmed, unpaid appointments; cannot pay pending/cancelled appointments.
- [ ] Customer profile page supports permitted profile edits.

## Admin dashboard and management

- [ ] Admin dashboard overview: registered customers, active services, appointment totals/statuses, successful payments.
- [ ] Admin services list, create, update, delete, activate/deactivate.
- [ ] Service form: name, category, description, positive price, positive duration, uploaded image, status active by default.
- [ ] Service image upload uses ImgBB key from environment; upload failures handled.
- [ ] Only active services are public/bookable.
- [ ] Admin sees all appointment requests with customer/service details, date/time, message, price, statuses, request date.
- [ ] Admin can confirm only pending requests; can cancel pending or confirmed requests.
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
- [ ] User fields include name, email, image, role, isBlocked; profile fields may include phone.
- [ ] Service fields include name, category, description, price, duration, image, status, createdAt.
- [ ] Appointment fields include serviceId, customerId, date, time, message, servicePrice, paymentStatus, status, createdAt.
- [ ] Transaction fields include appointmentId, customerId, amount, currency, stripeSessionId, status, createdAt.
- [ ] User profile update allows name/image/phone only; cannot change role/isBlocked or another user's data.
- [ ] Sensitive MongoDB, Better Auth, Google, Stripe, ImgBB, and application URL values are environment-only; no `.env` or credentials committed.
- [ ] Server-side authorization, input validation, error handling, and production CORS are correct.

## UX, reliability, and final verification

- [ ] Meaningful loaders for service fetch, dashboard data, booking submission, payment processing.
- [ ] Toast notifications for success/failure; no browser `alert()` for ordinary feedback.
- [ ] Handle API failures, invalid forms/routes, unauthorized access, upload failures, booking conflicts, payment failures/cancellation.
- [ ] Dashboard layout has responsive sidebar/main area, role-based navigation, statistic cards, and appropriate tables/lists.
- [ ] Search by service name and sort by price work on the client and API as appropriate.
- [ ] Production deep links reload without 404; private routes work after refresh and remain authenticated.
- [ ] No CORS/404/504 issues on production.
- [ ] Verify service CRUD, appointment lifecycle, ownership rules, role restrictions, blocked users, Stripe test flow, webhook, uploads, and deployed behavior.
- [ ] No secrets are exposed in client bundles, repository history, logs, or README.

## Decisions still to confirm or configure

- [ ] Production hosting/domains and allowed CORS/auth callback URLs.
- [ ] Google OAuth client credentials and callback configuration.
- [ ] Stripe test/live credentials and webhook endpoint configuration.
- [ ] ImgBB API key.
- [ ] Salon phone, address, hours, social links, and final category/content choices.
- [ ] Appointment capacity policy and paid-appointment cancellation/refund policy.
- [ ] Evaluator admin account creation/provisioning method.
