# GolfGive 🏌️‍♂️❤️

> **Play. Win. Give.** — a subscription platform that combines golf score
> tracking, monthly draw-based prizes, and charitable giving.
>
> Built for the Digital Heroes trainee assignment from the supplied
> [PRD](./prd.md), [Design System](./Design.md) and [System Design](./SystemDesign.md).

GolfGive is **component-based and scalable by design**: every domain (auth,
subscriptions, scores, draws, charities, winners) is an isolated service sitting
behind a repository interface, so the in-memory store used for the demo can be
swapped for Supabase without touching UI or business logic.

---

## ✨ Runs instantly — zero config

The app ships with a **seeded in-memory data layer** and **mock payment/email**
adapters, so you can run the full experience (signup → subscribe → score →
draw → win → verify → pay out) with **no external services**.

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Demo credentials

| Role | Email | Password |
|---|---|---|
| **Subscriber** | `player@golfgive.app` | `player1234` |
| **Admin** | `admin@golfgive.app` | `admin1234` |

> New signups become subscribers and land in the **Subscribe** flow (mock
> Razorpay checkout activates the subscription so every downstream feature works).

---

## 🧱 Architecture

```
Browser ──▶ Next.js (App Router, RSC + Server Actions)
              │
   middleware │  cookie gate on /dashboard /admin /subscribe
              ▼
        Server Actions / Route Handlers
              │  Zod validation · encrypted-role session · RBAC
              ▼
        Domain Services  (score, draw, subscription, charity, winner …)
              │  business rules (rolling-5, prize tiers, jackpot rollover)
              ▼
        Repositories (interface)
              ├── In-memory store  ← default (demo/tests)
              └── Supabase adapter ← activated by env vars
```

Layered access control mirrors SystemDesign §04:
**cookie gate (middleware) → encrypted role (AES-256-GCM) → server-side RBAC → RLS** (in the SQL schema).

### Project layout

| Path | Responsibility |
|---|---|
| `src/app/(marketing)` | Public, emotion-driven pages (home, charities, pricing, how-it-works) |
| `src/app/(auth)` | Signup / login |
| `src/app/dashboard` | Subscriber panel (scores, draws, charity, winnings, settings) |
| `src/app/admin` | Admin panel (users, draws, charities, winners, reports) |
| `src/app/subscribe` | Plan + charity + checkout flow |
| `src/app/api` | REST surface (`scores`, `charities`, `health`) + Razorpay webhook |
| `src/lib/services` | Domain logic (one module per bounded context) |
| `src/lib/db` | Repository interfaces + in-memory store + seed |
| `src/lib/actions` | Server actions (thin, validated wrappers over services) |
| `src/lib/payments` | Razorpay integration (subscriptions + signature verification) |
| `src/lib/auth` | Session + AES-256-GCM encrypted role |
| `src/components/ui` | shadcn-style primitives (Radix) |
| `supabase/schema.sql` | Production Postgres schema with RLS + rolling-5 trigger |

---

## ✅ Feature coverage (PRD)

- **Subscriptions** — monthly/yearly plans, Razorpay subscription creation +
  webhook signature verification, lifecycle states, real-time active check.
- **Scores** — Stableford 1–45, one-per-date, rolling **last 5** (oldest auto-evicted),
  reverse-chronological, add/edit/delete.
- **Draws** — random **and** algorithmic (score-frequency weighted) engines,
  **simulate** (no persistence) vs **publish**, jackpot rollover.
- **Prize pool** — 40/35/25 tiers auto-sized from active subscribers, split
  equally among winners per tier.
- **Charity** — directory with search/filter, profiles + events, spotlight on
  home, selection with min-10% contribution slider, independent donations.
- **Winner verification** — proof upload, admin approve/reject, Pending → Paid.
- **Dashboards** — full subscriber + admin panels with reports/analytics.
- **UI/UX** — "Warm Impact" design system, dark mode, Framer Motion reveals,
  mobile-first, `prefers-reduced-motion` respected.

---

## 🗄️ Supabase (auth + database)

The app uses **Supabase Auth + Postgres automatically when env vars are present**
(`getRepos()` returns the Supabase adapter; `auth-service`/`session` use Supabase
Auth with `@supabase/ssr` cookies). With no env vars it falls back to the
in-memory store — same code, zero config.

Setup:

```bash
# 1. Create a new Supabase project, then run the schema in its SQL editor:
#    supabase/schema.sql   (includes payout columns for fresh projects)
# 2. Put the URL + anon + service-role keys in .env.local
# 3. If you created the project earlier, apply pending migrations:
#    paste supabase/migrations/*.sql into the SQL editor, OR
#    add SUPABASE_ACCESS_TOKEN to .env.local and run:
npm run migrate
# 4. Create an admin and seed demo data:
npm run create:admin     # admin@golfgive.app / admin1234
npm run seed             # charities + player@golfgive.app / player1234 + a draw
```

Both scripts use the service-role key and Node's `--env-file=.env.local`.
The data repository uses the service-role client on the trusted server; access
control is enforced in the app layer (action/layout guards), with **RLS** in the
schema as defence-in-depth.

## 🔌 Other integrations (optional)

Fill in any of these in `.env.local`. Each is independent.
- **Razorpay** — set `RAZORPAY_KEY_ID/SECRET`, create plans and set
  `RAZORPAY_PLAN_MONTHLY/YEARLY`, point the webhook at `/api/webhooks/razorpay`
  with `RAZORPAY_WEBHOOK_SECRET`. Mock mode is used until keys are present.
- **Resend** — set `RESEND_API_KEY` to send real transactional emails
  (welcome, subscription, winner, payout). Otherwise emails are logged.
- **Security** — set a 32-byte `ROLE_ENCRYPTION_KEY` in production.

Check integration status any time at **`GET /api/health`**.

---

## 🚀 Deploy

- **Vercel** — import the repo, add env vars, deploy. Edge network handles TLS,
  CDN and load balancing (SystemDesign §10).
- **Supabase** — new project, run the schema, enable RLS (already in the SQL).

---

## 🧪 Scripts

```bash
npm run dev     # local development
npm run build   # production build (type-checked)
npm run start   # run the production build
npm run lint    # eslint
```

---

Built with Next.js · React · Tailwind CSS v4 · Radix UI · Zod · Framer Motion.
