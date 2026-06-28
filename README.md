<<<<<<< HEAD
# SaaS Starter Kit

Production-grade, open-source SaaS boilerplate built with the modern Next.js stack. Auth, subscription billing, teams with role-based access, a protected dashboard, an admin panel, transactional email, and rate limiting — wired together and ready to extend.

## Features

- **Auth** — email/password + Google & GitHub OAuth via Supabase (`@supabase/ssr`)
- **Billing** — Stripe subscriptions (Free / Pro / Enterprise) with a hardened webhook handler (signature verification + idempotency)
- **Dashboard** — protected pages, profile settings, billing & plan upgrade via Stripe Checkout + Customer Portal
- **Teams** — organizations, email invitations, role-based access (owner / admin / member)
- **Admin panel** — users, subscriptions, and MRR (role-gated)
- **Email** — transactional emails (welcome, invoice, password reset, team invite) via Resend + React Email
- **Rate limiting** — per-route tiers via Upstash Ratelimit, enforced in middleware
- **Testing** — Jest + React Testing Library (logic, components, webhook, auth/authz)
- **Docker** — multi-stage build + a one-command local dev stack
- **CI** — GitHub Actions (lint / type-check / test / build) and GitLab CI

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Auth & DB | Supabase (Postgres + RLS) |
| Payments | Stripe |
| Styling | Tailwind CSS v4 + shadcn-style UI |
| State | Zustand |
| Data fetching | React Query |
| Email | Resend + React Email |
| Rate limiting | Upstash Ratelimit |
| Testing | Jest + React Testing Library |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in the values (see Environment variables below)

# 3. Set up the database (Supabase CLI)
supabase start            # starts local Supabase (Postgres, Auth, Studio)
supabase db reset         # applies supabase/migrations/*

# 4. Run the dev server
npm run dev               # http://localhost:3000
```

## Environment variables

All variables are documented in `.env.example`.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | App base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service role key — **server only**, bypasses RLS |
| `STRIPE_SECRET_KEY` | yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | Stripe publishable key |
| `STRIPE_PRICE_ID_PRO` | yes | Stripe Price ID for the Pro plan |
| `STRIPE_PRICE_ID_ENTERPRISE` | yes | Stripe Price ID for the Enterprise plan |
| `RESEND_API_KEY` | no* | Resend API key (email is a no-op if unset) |
| `EMAIL_FROM` | no | From address for transactional email |
| `UPSTASH_REDIS_REST_URL` | no* | Upstash Redis REST URL (rate limiting no-op if unset) |
| `UPSTASH_REDIS_REST_TOKEN` | no* | Upstash Redis REST token |

\* Optional in development — the related feature degrades to a safe no-op when unset.

## Database

Schema and RLS policies live in `supabase/migrations/`:

- `00001_initial_schema.sql` — `profiles`, `organizations`, `organization_members`, `organization_invitations`, `subscriptions`; helper functions (`my_org_ids`, `is_org_admin`, `is_app_admin`); `updated_at` and new-user triggers; RLS on every table.
- `00002_processed_webhook_events.sql` — idempotency ledger for webhooks.

Apply with `supabase db reset` (local) or `supabase db push` (linked project).

## Stripe setup

1. Create three products/prices in Stripe (Free is $0 / no price). Put the Pro and Enterprise Price IDs in your env.
2. Forward webhooks in development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.
3. The handler processes `checkout.session.completed`, `customer.subscription.updated|deleted`, and `invoice.payment_succeeded|failed`.

## Running with Docker

```bash
docker compose up --build
```

Starts the app, a Postgres-based Supabase DB (migrations auto-applied), Supabase Studio, and Redis. For full Auth/Storage parity, run the Supabase CLI (`supabase start`) alongside.

## Testing

```bash
npm test            # run the suite
npm run test:watch  # watch mode
```

Covers `cn`/config logic, UI components, the Zustand store, the Stripe webhook (signature + idempotency), checkout authorization, and invitation acceptance authorization.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (standalone output) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Jest |

## Deployment

**Vercel (recommended)**

1. Import the repo into Vercel.
2. Add all environment variables from the table above.
3. Set the Stripe webhook endpoint to `https://your-domain/api/webhooks/stripe` and use that endpoint's signing secret.
4. Point Supabase Auth redirect URLs at `https://your-domain/callback`.

**Docker / self-hosted**

The `Dockerfile` produces a standalone image (`output: 'standalone'`). Build and run:

```bash
docker build -t saas-starter-kit .
docker run -p 3000:3000 --env-file .env.local saas-starter-kit
```

## Project structure

```
src/
  app/            # App Router: (auth), (dashboard), api, invite, landing
  components/     # UI primitives + shared components
  emails/         # React Email templates
  hooks/          # React Query hooks
  lib/            # supabase, stripe, email, guards, rate-limit, utils
  providers/      # Query + Theme providers
  stores/         # Zustand stores
  types/          # Database types
supabase/migrations/  # SQL schema + RLS
```

## License

MIT
=======
# saas-starter-kit
Next.js SaaS Starter Kit
>>>>>>> 2e44f5caa3ddf235b6f293e27ab8e6ff049ce570
