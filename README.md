# SalonBook Client

SalonBook is a salon discovery and appointment-booking platform. This repository contains the responsive Next.js website, customer and admin workspaces, and Better Auth integration. The [SalonBook Server](https://github.com/kaziaurpon/salonbook-server) provides the REST API used for salon services, appointments, customer management, and payments.

## Project overview

Customers can browse salon services, manage their appointments, and pay for confirmed bookings. Administrators can manage the service catalog, appointments, customer access, and payment records from a protected dashboard.

The Client owns authentication and sessions. It stores Better Auth records in MongoDB and sends authenticated requests to the Server, which verifies the signed identity token using Better Auth's JWKS endpoint.

## Features

- Responsive public home page and service catalog with search, category filters, featured services, and price sorting.
- Protected service details and appointment requests with available-slot handling.
- Customer workspace for appointment history, cancellation, payment, and profile updates.
- Admin workspace for services, image uploads, appointments, customers, transactions, and profile updates.
- Email/password and Google sign-in with Better Auth.
- Stripe hosted checkout. Payment status is confirmed by the Server's signed webhook, not by the browser redirect.
- Light and dark themes, including a saved theme preference.
- Branded Powder Blue, Lavender, and Peach design with responsive layouts.

## Technology stack

| Area | Technology |
| --- | --- |
| Web framework | Next.js App Router |
| UI | React, TypeScript, CSS |
| Authentication | Better Auth, MongoDB adapter |
| API communication | Fetch-based client for the SalonBook Server |
| Notifications and icons | Sonner, Lucide React |
| Payments | Stripe Checkout |
| Hosting | Vercel |

## Installation and local development

### Requirements

- Node.js 20.9 or newer and npm.
- MongoDB Atlas or a local MongoDB instance.
- A local checkout of the [SalonBook Server](https://github.com/kaziaurpon/salonbook-server).

### Set up the Client

1. Clone this repository and enter the project directory.

   ```bash
   git clone https://github.com/kaziaurpon/salonbook-client.git
   cd salonbook-client
   ```

2. Install dependencies and create a local environment file:

   ```bash
   npm install
   cp .env.example .env.local
   ```

   If `.env.local` already exists, keep it and add any missing variables rather than replacing it.

3. Add the required local values to `.env.local`. Use the same MongoDB database and database name for the Client and Server. Generate a private Better Auth secret with `openssl rand -base64 32`.

4. Start the Server in a separate terminal by following its [local setup instructions](https://github.com/kaziaurpon/salonbook-server#installation-and-local-development).

5. Start the Client:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

### Google sign-in

For local Google sign-in, configure a Google OAuth Web application and add this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

### Create an administrator

Public registration creates customer accounts only. To provision an administrator, temporarily add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to `.env.local`, then run:

```bash
npm run provision:admin -- --confirm-admin-provision
```

Remove the temporary administrator values from `.env.local` after provisioning.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run provision:admin -- --confirm-admin-provision` | Provision an administrator account. |

## Required environment variables

Variable names only. Keep private values in `.env.local` or the hosting provider's environment settings; never commit them.

```text
MONGODB_URI
DATABASE_NAME
BETTER_AUTH_URL
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_BETTER_AUTH_URL
NEXT_PUBLIC_API_URL
ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
NEXT_PUBLIC_SALON_PHONE
NEXT_PUBLIC_SALON_EMAIL
NEXT_PUBLIC_SALON_ADDRESS
NEXT_PUBLIC_SALON_HOURS
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_FACEBOOK_URL
NEXT_PUBLIC_X_URL
```

`ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are needed only for administrator provisioning. The `NEXT_PUBLIC_SALON_*` and social-link variables contain public display information; the site has defaults when they are omitted.

## Deployment

The Client is deployed on Vercel. Use the repository root as the project root and the standard Next.js install/build settings (`npm install` and `npm run build`). Configure production environment variables in Vercel Project Settings → Environment Variables, then create a new deployment after changing environment values.

Production origins:

- Client: `https://salonbook-client-olive.vercel.app`
- Server API: `https://salonbook-server-slxb.onrender.com`

Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to the Client origin, and `NEXT_PUBLIC_API_URL` to the Server origin. Configure this production Google redirect URI in Google Cloud Console:

```text
https://salonbook-client-olive.vercel.app/api/auth/callback/google
```

For the Server's Render configuration, Stripe webhook setup, and shared authentication settings, follow the [Server deployment guide](https://github.com/kaziaurpon/salonbook-server#deployment).

## Links

- Live website: [salonbook-client-olive.vercel.app](https://salonbook-client-olive.vercel.app)
- Live API health: [salonbook-server-slxb.onrender.com/api/health](https://salonbook-server-slxb.onrender.com/api/health)
- Client repository: [kaziaurpon/salonbook-client](https://github.com/kaziaurpon/salonbook-client)
- Server repository: [kaziaurpon/salonbook-server](https://github.com/kaziaurpon/salonbook-server)
