# SalonBook Client

Next.js App Router frontend for the SalonBook salon appointment platform. Better Auth runs in this app and stores authentication records in MongoDB through the official Better Auth MongoDB adapter.

## Local setup

1. In this folder, run `npm install`.
2. Copy `.env.example` to `.env.local`. Add the MongoDB connection string and the same database name used by the server. Generate a unique Better Auth secret with `openssl rand -base64 32`.
3. To enable Google sign-in, create Google OAuth credentials and add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
4. In a separate terminal, start the API from `../server` with `npm run dev`.
5. Here, run `npm run dev` and open `http://localhost:3000`.

## Authentication and admin provisioning

Sign-up and sign-in support email/password and Google. Better Auth owns the `users`, session, account, verification, and JWKS records. Public registration can only create customers; `role` and `isBlocked` are server-owned fields.

The public `/services` page reads active services from the API and supports name search, category filtering, and price sorting. Signed-in users can open service details. Admins can manage the service catalog at `/dashboard/admin/services`.

Customers can request an appointment from an active service detail page and manage requests at `/dashboard/customer`. Only a confirmed, unpaid request shows **Pay now**; checkout opens Stripe's hosted test-mode page. Return pages show payment state but never change it—the API waits for its verified webhook. Admins can review and update appointment requests at `/dashboard/admin/appointments` and inspect webhook-recorded payments read-only at `/dashboard/admin/transactions`.

To provision an admin, add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` temporarily to your ignored `.env.local`, then run `npm run provision:admin -- --confirm-admin-provision`. The local CLI uses Better Auth to create the account and sets its role in the same Better Auth `users` collection. Remove those temporary admin credential values after provisioning. There is no public admin creation endpoint.

The frontend obtains API JWTs through Better Auth's `authClient.token()` method and sends them in an `Authorization: Bearer …` header. Tokens are used in memory for the request and are never written to localStorage.

## Environment variables

See `.env.example` for variable names. Keep actual MongoDB URI, Better Auth secret, Google OAuth credentials, and temporary admin credentials out of Git.

## Repositories

- Client: https://github.com/kaziaurpon/salonbook-client
- Server: https://github.com/kaziaurpon/salonbook-server
