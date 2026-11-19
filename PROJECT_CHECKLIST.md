# SalonBook Requirements and Progress Checklist

This is the tracking checklist for the complete assignment. It is intentionally kept in the client repository so progress survives chat context changes. After each implementation task, update the relevant items and verify the result against the original assignment.

Status: `[x]` complete, `[~]` partly complete, `[ ]` not complete.

## Current status

- [x] Separate local Git repositories exist for `client/` and `server/`; no parent Git repository.
- [x] Public GitHub repositories exist and are configured as the matching `origin` remotes.
- [x] Independent `package.json`, lockfile, `.gitignore`, `.env.example`, and README exist for each app.
- [x] TypeScript scaffold: Next.js App Router client; Express API; Mongoose MongoDB connection; health endpoint.
- [x] Client and server production builds compile; latest client build also generated every App Router route and server TypeScript build passed.
- [~] Client lint exits successfully with no errors and eight external-image optimization warnings. Better Auth logged five failed MongoDB index-creation attempts during the build; a separate read-only check confirmed all five expected indexes exist in the configured MongoDB database.
- [x] Server dependency audit removed the unused `express-rate-limit` package. `/api/health` now reports MongoDB readiness, and the server binds explicitly to `0.0.0.0` for hosting.
- [x] User confirmed both apps and the MongoDB connection run locally.
- [x] Both READMEs now document features, stack, environment variable names only, local run, deployment steps, repository URLs, and explicit not-deployed live URL placeholders.
- [~] Better Auth, registration/login, Google provider config, JWT handoff, Express JWT and current-role guards are implemented. Local email/password persistence and API authorization were verified; Google OAuth still needs a real browser consent test.
- [~] Public service browsing, admin service/image management, dashboards, appointments, and Stripe test-mode payment are implemented. Signed Stripe test-event replay, invalid-signature rejection, and payment idempotency were verified locally.
- [x] One initial scaffold commit exists in each repository and has been pushed.
- [~] Required meaningful commit totals currently synced to origin: client 14/20 and server 10/12. This audit is organized as six distinct client commits and two distinct server commits; after all eight are committed, the assignment commit counts will be 20/20 and 12/12.
- [ ] Product features are not deployed; live website and submission links remain outstanding.

## Repository, documentation, and delivery

- [x] Separate client and server repositories; no parent repository.
- [x] Client repository: `https://github.com/kaziaurpon/salonbook-client`.
- [x] Server repository: `https://github.com/kaziaurpon/salonbook-server`.
- [~] Meaningful client commits: 14/20 before this audit; commit the six documented audit changes to reach 20/20.
- [~] Meaningful server commits: 10/12 before this audit; commit the unused-dependency cleanup and readiness endpoint changes separately to reach 12/12.
- [x] Client README includes description, features, stack, install/run instructions, environment variable names, live link placeholder, and both repository links.
- [x] Server README includes description, features, stack, install/run instructions, environment variable names, live link placeholder, and both repository links.
- [ ] Production deployment and working live site URL.
- [ ] Securely provision evaluator admin credentials and provide submission details.

## Shared layout and public pages

- [x] SalonBook home page has an original salon-inspired banner illustration, featured active services from the API, category links, and a useful appointment-planning section.
- [x] Public navbar links to Home, Browse Services, Sign In, and Sign Up; signed-in users see their role-appropriate dashboard and Sign Out.
- [x] Authenticated navbar includes the user's name, profile link, role-appropriate dashboard link, and sign out.
- [~] Footer includes salon contact/address/hours and social-link fields; real values must be supplied in client environment variables before production.
- [x] Original responsive salon-themed public design implemented for desktop, tablet, and mobile with reusable components.
- [x] Shared Powder Blue `#8DB9F0`, Lavender `#E9E8F8`, and Peach `#F5B69E` design tokens and 60/30/10 guidance applied across current page styles; future page guidance documented in `DESIGN_SYSTEM.md`.
- [ ] Working links/buttons, status badges, confirmation dialogs; avoid unnecessary animation/clutter.
- [x] Home banner has title, description, original salon-inspired CSS illustration, and Explore Services CTA.
- [~] Home featured section requests up to six active services from the API; cards show all required fields. Current configured database has only one active service, so the requirement to display at least six is waiting on five more real service records.
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
- [x] Local email/password session persistence, JWT handoff, customer API access, admin-route denial to customers, blocked-user denial, and profile role/block-field rejection were verified against MongoDB and Express. Admin provisioning was previously confirmed by the user.
- [~] Google OAuth still requires a browser consent test with Google credentials and the configured callback.

## Service details, booking, and customer dashboard

- [x] Protected `/services/[id]` details page shows image, name, category, description, price, duration, and customer appointment form.
- [x] Invalid service IDs show a useful error; inactive services are omitted from public detail/list APIs.
- [x] Only authenticated customers can request appointments; admins cannot book as customers.
- [x] Booking form: date, predefined time slot, optional message; validation and toast feedback.
- [x] New appointment defaults to pending/unpaid; stores service/customer references and service price snapshot.
- [x] Prevent duplicate active requests for the same service/date/time across customers with a server check, unique reservation key, and a clear 409 conflict response.
- [x] Customer can cancel only their own pending request; cannot cancel confirmed/cancelled requests.
- [x] Customer appointment overview totals: total, pending, confirmed, cancelled requests; admin appointment queue also shows the same status totals.
- [x] Customer appointment list shows service image/name/category, date/time, price, appointment status, payment status, and message.
- [x] Customer sees their own appointment history with the service, category, date/time, price, appointment/payment status, request date, and message; the appointment card exposes the required details.
- [x] Customer can create Checkout only for their own confirmed, unpaid appointment; Pending, Cancelled, already paid, other-customer, and admin requests are rejected server-side.
- [x] Customer profile page supports permitted name, profile image URL, and phone edits through the authenticated Express API.

## Admin dashboard and management

- [x] Admin dashboard overview: registered customers, active services, appointment totals/statuses, and appointments marked paid; counts are served from the protected admin API.
- [x] Admin services list, create, update, delete, activate/deactivate; API checks admin role and the list is paginated.
- [x] Service form: name, category, description, positive price, positive duration, image upload, status active by default.
- [x] Service image upload uses the server-only ImgBB key; file type/size and upload failures are handled.
- [x] Admin destructive actions use an in-app confirmation dialog and CRUD actions report success/failure with toast notifications.
- [x] Only active services are public and available for future booking.
- [x] Admin sees all appointment requests with customer/service details, date/time, message, price, and statuses.
- [x] Admin can confirm only pending requests; can cancel pending or confirmed requests. Server guards status transitions and returns conflict responses when a request has changed.
- [x] Admin can search and paginate registered customers, view profile and appointment details, and block/unblock customer accounts through admin-only Express APIs.
- [x] Admin can view transactions read-only with customer, service, appointment date, amount/currency, Stripe session reference, status, and payment date.
- [x] No admin transaction mutation route exists; only the verified webhook can record successful payment.
- [x] Admin profile page supports permitted name, profile image URL, and phone edits through the authenticated Express API.

## Stripe payment and transactions

- [x] Backend creates test-mode Stripe Checkout only for an eligible confirmed, unpaid appointment owned by the caller; amount is read from the saved appointment.
- [x] Success/cancel pages give payment status guidance; success page polls authenticated API status and never trusts the Checkout redirect/session id to mark paid.
- [x] Webhook uses Express raw request bytes and verifies Stripe's signature before processing.
- [x] Only a signed `checkout.session.completed` event with paid Checkout session and matching server appointment/customer/amount/currency updates payment state.
- [x] Verified webhook atomically stores the minimal transaction record and marks appointment paid; unique Stripe session reference and MongoDB transaction make retries idempotent.
- [x] Checkout creation, payment-status lookup, and customer ownership are server guarded; admin transaction API is read-only.
- [x] Checkout loading, success/cancel guidance, toasts, unavailable states, webhook failures, and signature failures are handled without falsely marking paid.

## Profile, data model, and security

- [x] Four business collections: users (Better Auth), services, appointments, transactions; references are correct and no redundant business collections.
- [x] Better Auth `users` records include name, email, image, phone, role, and isBlocked; the additional phone field is not accepted through public Better Auth input.
- [x] Service model includes name, category, description, positive price, positive duration, image, status, and createdAt.
- [x] Appointment fields include serviceId, customerId, date, time, message, servicePrice, paymentStatus, status, and createdAt.
- [x] Transaction fields include only appointmentId, customerId, amount, currency, stripeSessionId, status, createdAt (plus MongoDB's required document id).
- [x] User profile update accepts only name/image/phone; strict server validation rejects role/isBlocked, email, or user-id fields and only updates the ID from the verified token.
- [x] Sensitive MongoDB, Better Auth, Google, Stripe, ImgBB, and application URL values are environment-only; examples contain names/empty values and `.env` files are ignored.
- [x] Local CORS allows the configured client origin and Authorization preflight; an untrusted origin receives no allow-origin header and is rejected.
- [~] Production CORS and domain configuration cannot be verified until deployment.

## UX, reliability, and final verification

- [x] Meaningful loaders for service fetch, appointment slots, booking submission, customer/admin dashboards, and Stripe Checkout return status.
- [x] Toast notifications for success/failure; no browser `alert()` for ordinary feedback.
- [x] Admin and customer dashboard navigation uses role-specific responsive sidebar layouts; server API roles remain authoritative.
- [x] Admin overview includes customer, blocked-customer, active-service, appointment-status, and successful-payment totals; customer and transaction management routes are linked in the admin navigation.
- [x] Handle API failures, invalid forms/routes, unauthorized access, upload failures, booking conflicts, cancelled Checkout, and webhook errors.
- [x] Dashboard layout has responsive sidebar/main area, role-based navigation, statistic cards, and appropriate tables/lists.
- [x] Search by service name and sort by price work on the client and API; paginated API and category filtering are also available.
- [~] Latest local production build direct HTTP reload returned 200 for home, service list/detail (including invalid ID), payment return, and customer/admin dashboard/profile/transaction routes. Protected API requests reject missing auth and enforce current role; production route reload still needs post-deploy verification.
- [~] Local CORS and route behavior passed; production CORS/404/504 behavior is pending deployment.
- [~] Client and server builds pass. Client lint now exits successfully with eight Next.js image-optimization warnings for external service/profile image URLs. Local direct reload returned 200 across tested routes. Stripe webhook signature, retry idempotency, and invalid-signature rejection passed. Manual CRUD/image upload and appointment edge cases remain to be retested.
- [x] Git-history scan found no tracked `.env` files or credential patterns in either repo. Environment files are ignored and examples contain variable names with blank values only.

## Decisions still to confirm or configure

- [ ] Production hosting/domains and allowed CORS/auth callback URLs; deployment was not performed.
- [~] Google OAuth credentials and browser test (local callback: `http://localhost:3000/api/auth/callback/google`).
- [~] Stripe was verified locally in test mode. After deployment configure `https://<api-domain>/api/payments/webhook`.
- [~] ImgBB API key is configured locally; a fresh manual upload verification is still needed.
- [ ] Add five more real active salon service records through Admin → Manage Services; current MongoDB count is one active service out of one total.
- [ ] Salon phone, address, hours, social links, and final category/content choices.
- [~] Local admin provisioning CLI verified. Use the actual evaluator account required by the assignment; never place its password in Git or invent credentials.
