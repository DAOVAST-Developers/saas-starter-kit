# Next.js SaaS Starter Kit — Implementation Plan

A production-grade, open-source SaaS boilerplate featuring auth, billing, teams, dashboard, and admin panel. Designed as a high-leverage GitHub portfolio project.

---

## Remaining Tasks (Fixes for Production Readiness)
The project scaffolding is in place, but we need to resolve a series of type errors and complete missing components to make it production-ready.

### 1. Fix TypeScript & Type Inference Errors
- **Next.js Typed Routes**: Disable `typedRoutes` in `next.config.ts` or fix all `Link` and route casting. We will disable it to reduce friction in a starter boilerplate.
- **Supabase Type Inference**: Resolve the `never` type return on `supabase.from(...).select(...)`. This is usually caused by slight mismatches in the `Database` type (e.g., missing schemas or incorrectly shaped interfaces) or by TypeScript version incompatibilities with `@supabase/supabase-js`.
- **Component Prop Errors**: Fix the `never` errors in components like `profile-form.tsx` and `sidebar.tsx` by correctly typing their props and integrating with the updated Supabase types.

### 2. Fix Store & Hook Integrations
- **Organization Store**: `src/stores/organization-store.ts` has been simplified, but `org-switcher.tsx`, `use-organization.ts`, and `lib/organizations.ts` still expect the old structure (`organizations`, `currentOrg`). We will refactor these to correctly fetch organizations using React Query and only store the `activeOrgId` in Zustand.

### 3. Fix Server Actions & Testing Spread Arguments
- **Server Actions (Team / Invite)**: Fix unknown properties passed in team actions (`org_id`, `name`, etc.).
- **Tests Spread Errors**: Fix `TS2556: A spread argument must either have a tuple type or be passed to a rest parameter` in Jest tests (e.g., `checkout/route.test.ts`) by properly mocking the Stripe client and using typed mocks.
- **Test Environment**: Fix missing `screen` import from `@testing-library/react` in UI tests.

---

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS Version**: You specified Tailwind CSS. I'll use **Tailwind CSS v4** (the latest) with the new CSS-first configuration. Confirm if you'd prefer v3 instead.

> [!IMPORTANT]
> **Shadcn/ui Components**: I plan to use **shadcn/ui** for the component library (buttons, forms, tables, modals, etc.). This is the industry standard pairing with Tailwind and will dramatically improve the UI quality. Approve?

> [!WARNING]
> **Supabase Local Dev**: The Docker setup will include Supabase local via `supabase init` + `supabase start`. This requires the Supabase CLI. The alternative is to only support cloud Supabase instances in the Docker setup.

> [!IMPORTANT]
> **Rate Limiting Provider**: The plan uses **Upstash Redis** for rate limiting (industry standard, works at the Edge). This requires an Upstash account. Alternative: in-memory rate limiting (simpler, but doesn't work across serverless instances). Which do you prefer?

## Open Questions

1. **Project Name**: Should the npm package/repo be named `nextjs-saas-starter`, `saas-starter-kit`, or something else?
2. **Database ORM**: Should we use raw Supabase client queries, or add **Drizzle ORM** for type-safe database access? Drizzle is the modern standard but adds complexity.
3. **Landing Page**: Do you want a marketing landing page as part of the kit, or just the authenticated app (login → dashboard)?

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | Supabase PostgreSQL + RLS |
| Payments | Stripe (Checkout + Webhooks) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Data Fetching | React Query (`@tanstack/react-query`) |
| Email | Resend + React Email |
| Rate Limiting | Upstash Ratelimit |
| Testing | Jest + React Testing Library |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Proposed Changes

### Phase 1: Project Foundation

#### [NEW] Project Scaffolding & Configuration

Initialize Next.js 15 with TypeScript, Tailwind CSS v4, and App Router.

**Files:**
- `package.json` — all dependencies
- `tsconfig.json` — strict TypeScript config
- `next.config.ts` — Next.js configuration
- `tailwind.config.ts` — Tailwind v4 config  
- `.env.example` — all environment variables documented
- `.env.local` — gitignored local env
- `.gitignore` — comprehensive ignore rules
- `postcss.config.mjs` — PostCSS for Tailwind

---

### Phase 2: Supabase & Database Schema

#### [NEW] `src/lib/supabase/client.ts`
Browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`.

#### [NEW] `src/lib/supabase/server.ts`
Server-side Supabase client using `createServerClient` with cookie handling for Server Components, Server Actions, and Route Handlers.

#### [NEW] `src/lib/supabase/admin.ts`
Admin Supabase client using `service_role` key for server-only operations (e.g., admin panel queries that bypass RLS).

#### [NEW] `src/lib/supabase/middleware.ts`
Helper to create Supabase client within Next.js middleware for session refresh.

#### [NEW] `supabase/migrations/00001_initial_schema.sql`
Database schema with RLS policies:

```sql
-- profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- organizations (teams)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- organization_members (join table with roles)
CREATE TABLE public.organization_members (
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- organization_invitations
CREATE TABLE public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- subscriptions (Stripe sync)
CREATE TABLE public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Plus RLS policies for all tables, helper functions (`my_org_ids()`, `is_org_admin()`), and triggers for `updated_at`.

---

### Phase 3: Authentication

#### [NEW] `src/middleware.ts`
Combined middleware handling:
1. Supabase session refresh (cookie management)
2. Route protection (redirect unauthenticated users from `/dashboard/*` to `/login`)
3. Rate limiting on `/api/*` routes via Upstash

#### [NEW] `src/app/(auth)/login/page.tsx`
Login page with:
- Email/password form
- Google OAuth button
- GitHub OAuth button
- "Forgot password" link
- Link to sign up

#### [NEW] `src/app/(auth)/signup/page.tsx`
Sign up page with email/password + OAuth options.

#### [NEW] `src/app/(auth)/forgot-password/page.tsx`
Password reset request form.

#### [NEW] `src/app/(auth)/reset-password/page.tsx`
New password form (accessed via email link).

#### [NEW] `src/app/(auth)/callback/route.ts`
OAuth callback handler — exchanges auth code for session, redirects to dashboard.

#### [NEW] `src/app/(auth)/layout.tsx`
Auth layout — centered card design with branding.

---

### Phase 4: Stripe Billing

#### [NEW] `src/lib/stripe/client.ts`
Stripe SDK initialization with secret key.

#### [NEW] `src/lib/stripe/config.ts`
Pricing plans configuration:
```typescript
export const PLANS = {
  free: { name: 'Free', price: 0, priceId: null, features: [...] },
  pro: { name: 'Pro', price: 29, priceId: 'price_xxx', features: [...] },
  enterprise: { name: 'Enterprise', price: 99, priceId: 'price_xxx', features: [...] },
} as const;
```

#### [NEW] `src/app/api/stripe/checkout/route.ts`
API route to create Stripe Checkout Session for subscription.

#### [NEW] `src/app/api/stripe/portal/route.ts`
API route to create Stripe Customer Portal session (manage subscription).

#### [NEW] `src/app/api/webhooks/stripe/route.ts`
Webhook handler processing:
- `checkout.session.completed` → create subscription record
- `customer.subscription.updated` → sync plan changes
- `customer.subscription.deleted` → mark as canceled
- `invoice.payment_succeeded` → update period, send invoice email
- `invoice.payment_failed` → notify user

With signature verification and idempotency checks.

---

### Phase 5: Dashboard & Protected Pages

#### [NEW] `src/app/(dashboard)/layout.tsx`
Dashboard layout with:
- Responsive sidebar navigation (collapsible)
- Top header with user avatar, org switcher, notifications
- Breadcrumb navigation

#### [NEW] `src/app/(dashboard)/dashboard/page.tsx`
Main dashboard with:
- Welcome card with user name
- Quick stats (plan, team members, usage)
- Recent activity feed
- Getting started checklist

#### [NEW] `src/app/(dashboard)/settings/page.tsx`
User settings:
- Profile (name, avatar upload)
- Email preferences
- Password change
- Danger zone (delete account)

#### [NEW] `src/app/(dashboard)/settings/billing/page.tsx`
Billing page:
- Current plan display with usage
- Plan comparison cards (Free / Pro / Enterprise)
- Upgrade/downgrade buttons → Stripe Checkout
- Billing history table
- "Manage Subscription" → Stripe Customer Portal

---

### Phase 6: Team/Organization Support

#### [NEW] `src/app/(dashboard)/settings/team/page.tsx`
Team management:
- Members list with roles (owner, admin, member)
- Invite form (email + role selector)
- Remove member / change role actions
- Pending invitations list

#### [NEW] `src/app/(dashboard)/settings/team/invite/route.ts`
Server action to send team invitation email via Resend.

#### [NEW] `src/app/invite/[token]/page.tsx`
Public invitation acceptance page.

#### [NEW] `src/stores/organization-store.ts`
Zustand store for active organization state, org switching.

#### [NEW] `src/hooks/use-organization.ts`
React Query hook for organization data fetching.

---

### Phase 7: Admin Panel

#### [NEW] `src/app/(dashboard)/admin/page.tsx`
Admin overview (protected — `role === 'admin'` only):
- Total users count
- Active subscriptions by plan (chart)
- Monthly Recurring Revenue (MRR) display
- Recent signups table

#### [NEW] `src/app/(dashboard)/admin/users/page.tsx`
Users management:
- Searchable, paginated users table
- User details (email, plan, signup date, last login)
- Actions: change role, impersonate, disable

#### [NEW] `src/app/(dashboard)/admin/subscriptions/page.tsx`
Subscriptions view:
- All subscriptions with filters (plan, status)
- Revenue breakdown

#### [NEW] `src/lib/guards/admin.ts`
Server-side admin role check utility.

---

### Phase 8: Transactional Emails

#### [NEW] `src/lib/email/resend.ts`
Resend client initialization.

#### [NEW] `src/emails/welcome.tsx`
Welcome email template (React Email component).

#### [NEW] `src/emails/invoice.tsx`
Invoice/payment confirmation email template.

#### [NEW] `src/emails/password-reset.tsx`
Password reset email template.

#### [NEW] `src/emails/team-invite.tsx`
Team invitation email template.

#### [NEW] `src/lib/email/send.ts`
Email sending utility with template selection and error handling.

---

### Phase 9: Rate Limiting

#### [NEW] `src/lib/rate-limit.ts`
Upstash Ratelimit configuration with different tiers:
- Auth routes: 5 requests / 60s
- API routes: 30 requests / 60s  
- Webhook routes: 100 requests / 60s

Integrated into the main `middleware.ts`.

---

### Phase 10: Shared Components & UI

#### [NEW] `src/components/ui/*`
shadcn/ui components installed via CLI:
- Button, Input, Label, Card, Badge
- Dialog, Sheet, Dropdown Menu
- Table, Tabs, Avatar, Skeleton
- Toast notifications (Sonner)
- Form (React Hook Form + Zod integration)

#### [NEW] `src/components/layout/sidebar.tsx`
Responsive sidebar with navigation links, org switcher, user menu.

#### [NEW] `src/components/layout/header.tsx`
Top header with breadcrumbs, search, notifications.

#### [NEW] `src/components/pricing-cards.tsx`
Reusable pricing plan cards used on billing page.

#### [NEW] `src/components/org-switcher.tsx`
Organization switcher dropdown component.

#### [NEW] `src/providers/query-provider.tsx`
React Query provider wrapper.

#### [NEW] `src/providers/theme-provider.tsx`
Dark/light mode theme provider.

---

### Phase 11: Testing

#### [NEW] `jest.config.ts`
Jest configuration for Next.js with TypeScript, path aliases, and module mocking.

#### [NEW] `src/__tests__/auth/login.test.ts`
Tests for login flow — email/password validation, OAuth redirect, error handling.

#### [NEW] `src/__tests__/auth/signup.test.ts`
Tests for signup flow — validation, duplicate email, success redirect.

#### [NEW] `src/__tests__/webhooks/stripe.test.ts`
Tests for Stripe webhook handler:
- Signature verification (valid + invalid)
- `checkout.session.completed` processing
- `customer.subscription.updated` sync
- Idempotency behavior

#### [NEW] `src/__tests__/api/team.test.ts`
Tests for team API routes — invite, remove, role change, authorization checks.

#### [NEW] `src/__tests__/lib/rate-limit.test.ts`
Tests for rate limiting — within limit, exceeded, different route tiers.

---

### Phase 12: Docker & CI/CD

#### [NEW] `Dockerfile`
Multi-stage production Dockerfile:
1. `deps` stage — install dependencies
2. `builder` stage — build Next.js
3. `runner` stage — minimal production image with `standalone` output

#### [NEW] `docker-compose.yml`
Full local development stack:
- `app` — Next.js application
- `supabase-db` — PostgreSQL  
- `supabase-auth` — GoTrue auth server
- `supabase-studio` — Supabase Studio UI
- `stripe-cli` — Stripe webhook forwarding
- `redis` — Upstash-compatible Redis for rate limiting

#### [NEW] `.dockerignore`
Optimized Docker ignore file.

#### [NEW] `.github/workflows/ci.yml`
GitHub Actions CI pipeline:
- Triggered on PR to `main`
- Steps: checkout → install → lint → type-check → test → build
- Node.js matrix (18, 20)
- Environment secrets for Supabase + Stripe test keys

#### [NEW] `.github/workflows/docker.yml`
Docker build verification on PR.

---

### Phase 13: Documentation

#### [NEW] `README.md`
Comprehensive README with:
- Project overview + feature list
- Architecture diagram (Mermaid)
- Quick start guide (< 5 minutes)
- Environment variables reference table
- Supabase setup guide
- Stripe setup guide (products, prices, webhooks)
- Docker usage
- Deployment guides (Vercel, Railway, Fly.io)
- Contributing guidelines
- License (MIT)

#### [NEW] `CONTRIBUTING.md`
Contribution guidelines.

#### [NEW] `LICENSE`
MIT License.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ (auth)   │  │(dashboard)│  │   API Routes      │  │
│  │ Login    │  │ Dashboard │  │ /api/stripe/*     │  │
│  │ Signup   │  │ Settings  │  │ /api/webhooks/*   │  │
│  │ Reset    │  │ Team      │  │ /api/team/*       │  │
│  │          │  │ Admin     │  │                   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                      │                │              │
│  ┌───────────────────┼────────────────┼──────────┐  │
│  │              Middleware Layer                   │  │
│  │  Session Refresh │ Auth Guard │ Rate Limit     │  │
│  └───────────────────┼────────────────┼──────────┘  │
└──────────────────────┼────────────────┼─────────────┘
                       │                │
       ┌───────────────┼────────────────┼────────────┐
       │               ▼                ▼            │
  ┌────────┐    ┌────────────┐   ┌──────────┐  ┌────────┐
  │Supabase│    │   Stripe   │   │  Resend  │  │Upstash │
  │Auth+DB │    │  Payments  │   │  Email   │  │ Redis  │
  └────────┘    └────────────┘   └──────────┘  └────────┘
```

## File Structure Overview

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── callback/route.ts
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── team/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── subscriptions/page.tsx
│   │   └── layout.tsx
│   ├── invite/[token]/page.tsx
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   └── portal/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── layout.tsx
│   └── page.tsx (landing page)
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── pricing-cards.tsx
│   └── org-switcher.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── middleware.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── config.ts
│   ├── email/
│   │   ├── resend.ts
│   │   └── send.ts
│   ├── guards/
│   │   └── admin.ts
│   └── rate-limit.ts
├── emails/
│   ├── welcome.tsx
│   ├── invoice.tsx
│   ├── password-reset.tsx
│   └── team-invite.tsx
├── stores/
│   └── organization-store.ts
├── hooks/
│   └── use-organization.ts
├── providers/
│   ├── query-provider.tsx
│   └── theme-provider.tsx
├── types/
│   ├── database.ts
│   └── supabase.ts
└── __tests__/
    ├── auth/
    ├── webhooks/
    ├── api/
    └── lib/
supabase/
└── migrations/
    └── 00001_initial_schema.sql
.github/
└── workflows/
    ├── ci.yml
    └── docker.yml
```

---

## Verification Plan

### Automated Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Manual Verification
1. **Auth flow**: Sign up → verify email → login → OAuth (Google/GitHub)
2. **Billing flow**: Free user → click upgrade → Stripe Checkout → webhook → plan updated
3. **Team flow**: Create org → invite member → accept invite → role management
4. **Admin panel**: Login as admin → view users/subscriptions/revenue
5. **Docker**: `docker compose up` → full stack running locally
6. **CI**: Open a PR → GitHub Actions runs tests and type checking

### Build Verification
```bash
# Production build
npm run build

# Docker build
docker compose build
```
