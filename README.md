# SalonBook — Client

SalonBook is a responsive salon appointment booking platform. This repository contains the Next.js App Router frontend and Better Auth integration. The Express API lives in a separate repository and the frontend reads salon data from that API.

## Features

- Public home page and active service catalog with search, category filtering, and price sorting.
- Protected service details and appointment requests.
- Customer dashboard for appointment history, cancellation, payment, and profile updates.
- Admin dashboard for services, appointments, customers, read-only transactions, and profile updates.
- Email/password and Google sign-in through Better Auth.
- Stripe hosted test-mode checkout; the API webhook, never the browser return page, confirms payment.
- Powder Blue, Lavender, and Peach responsive interface.

## Stack

Next.js App Router, React, TypeScript, Better Auth, MongoDB Better Auth adapter, and Sonner notifications.

## Run locally

Requirements: Node.js 20.9 or newer, npm, MongoDB Atlas or a local MongoDB instance, and the separate SalonBook Server checkout.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`. If `.env.local` already exists, keep it and add any missing variable names instead of overwriting it.
3. Set the MongoDB URI and database name shared with the server. Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32` and keep it private.
4. In a separate terminal, start the API from the server repository with `npm run dev`.
5. Start this app with `npm run dev` and open `http://localhost:3000`.

To enable Google sign-in locally, add a Google OAuth Web application and authorize this exact callback URI:

```text
http://localhost:3000/api/auth/callback/google
```

To create an admin securely, temporarily set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env.local`, then run:

```bash
npm run provision:admin -- --confirm-admin-provision
```

Remove those temporary admin values afterwards. Public registration cannot create admins.

## Environment variable names

Names only; put values in ignored `.env.local`, never in Git:

```text
MONGODB_URI
DATABASE_NAME
BETTER_AUTH_URL
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_BETTER_AUTH_URL
NEXT_PUBLIC_API_URL
ADMIN_NAME (temporary provisioning only)
ADMIN_EMAIL (temporary provisioning only)
ADMIN_PASSWORD (temporary provisioning only)
NEXT_PUBLIC_SALON_PHONE
NEXT_PUBLIC_SALON_ADDRESS
NEXT_PUBLIC_SALON_HOURS
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_FACEBOOK_URL
NEXT_PUBLIC_TIKTOK_URL
```

The `NEXT_PUBLIC_` salon contact variables are public display information, not secrets. They are currently placeholders until the salon's real contact details and social links are supplied.

## Deployment — Vercel

1. Import the `salonbook-client` GitHub repository as a Next.js project. The repository root is the app root; use the default install/build settings (`npm install`, `npm run build`).
2. Add the client environment variables above in Vercel Project Settings → Environment Variables. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to the final client origin, for example `https://<client-domain>`; set `NEXT_PUBLIC_API_URL` to `https://<api-domain>`.
3. Use a unique production `BETTER_AUTH_SECRET` of at least 32 characters. Configure the production Google callback as `https://<client-domain>/api/auth/callback/google` in Google Cloud Console.
4. After setting variables or changing the domain, create a fresh deployment. Vercel applies environment changes to new builds/deployments.
5. Replace the live link placeholder below only after confirming direct route reloads, login persistence, CORS, and the Stripe webhook on the deployed system.

## Links

- Live website: **Not deployed yet — add the verified URL here.**
- Client repository: https://github.com/kaziaurpon/salonbook-client
- Server repository: https://github.com/kaziaurpon/salonbook-server
