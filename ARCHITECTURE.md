# GolfGive Architecture

GolfGive is a **Next.js (App Router)** application organised as a set of isolated
domain services behind a repository interface. The same business logic backs both
the UI (Server Components + Server Actions) and the REST API, and the data layer
can switch from an in-memory store to Supabase purely via environment variables —
no UI or business-logic changes.

---

## 1. Layered design

```
Browser ──▶ Next.js (App Router, RSC + Server Actions)
              │
   middleware │  cookie gate on /dashboard /admin /subscribe
              ▼
        Server Actions / Route Handlers (/api)
              │  Zod validation · encrypted-role session · RBAC · rate limit
              ▼
        Domain Services  (auth, score, draw, subscription, charity, winner …)
              │  business rules (rolling-5, prize tiers, jackpot rollover)
              ▼
        Repositories (interface)
              ├── In-memory store  ← default (demo / tests)
              └── Supabase adapter ← activated by env vars
                     │
                     ▼
              Supabase (Postgres + Auth + Storage), Razorpay, Resend, Upstash
```

Each layer has one job:

- **Middleware** (`src/middleware.ts`) — cheap cookie/session gate on protected
  routes (refreshes the Supabase session when configured).
- **Actions / Route handlers** — thin, validated entry points. They authenticate,
  authorise (`requireUser` / `requireRole`), rate-limit, and delegate.
- **Services** (`src/lib/services/*`) — all business rules live here, one module
  per bounded context. They never know which repository backs them.
- **Repositories** (`src/lib/db/*`) — a single `Repositories` interface with two
  implementations selected by `getRepos()` based on `isSupabaseConfigured()`.

---

## 2. Access control (defence in depth)

Mirrors SystemDesign §04 — four independent layers:

1. **Cookie gate** in middleware (is there a session at all?).
2. **Encrypted role** — AES-256-GCM role cookie in demo mode (`src/lib/auth`).
3. **Server-side RBAC** — `requireRole("admin")` etc. in every action/route.
4. **Row Level Security** — Postgres RLS policies in `supabase/schema.sql`
   (owners see their rows; `is_admin()` sees all). The trusted server uses the
   service-role client; RLS is the backstop.

---

## 3. Data model

Defined once in `supabase/schema.sql` (single source of truth — schema + all
past migrations consolidated, idempotent).

| Table | Notes |
|---|---|
| `profiles` | 1:1 with `auth.users`; role, charity choice, lucky numbers, avatar, payout details |
| `charities` / `charity_events` | Directory + events; `image_url`, `is_featured`, `raised` |
| `subscriptions` | Plan, status enum, Razorpay ids, period end |
| `scores` | One per `(user, date)`, value 1–45; **rolling-5** enforced by `trim_scores` trigger |
| `draws` / `prize_pools` | Period `YYYY-MM`, logic + status enums, winning numbers, pool, jackpot carry |
| `winners` | Tier, matched count, amount, proof URL, verification status |
| `donations` | Independent one-off charity donations |
| `api_keys` | Hashed keys for a future external API surface |

Key invariants enforced at the DB level: Stableford range check, one score per
date, rolling-5 trim trigger, and RLS on every user-owned table.

---

## 4. Request lifecycle examples

**Add a score (UI):** form → `addScoreAction` → Zod `scoreSchema` →
`score-service.addScore` (range + per-date + rolling-5 rules) → repository write →
`revalidatePath` refreshes the dashboard.

**Add a score (API):** `POST /api/scores` → `enforceRateLimit` → `getSessionUser`
(401 if absent) → same `score-service.addScore` → `201 { score }`.

**Run a draw (admin):** `runDrawAction` (`requireRole("admin")`) →
`draw-service` random/algorithmic engine → simulate (no persistence) or publish →
prize pool sized from active subscribers → winners computed per tier.

---

## 5. Cross-cutting concerns

- **Validation** — `src/lib/validations.ts` (Zod) is the one contract shared by
  forms, actions and API routes.
- **Rate limiting** — `src/lib/rate-limit.ts`, fixed-window, env-tuned, in-memory
  by default or Upstash Redis (shared) when configured. Fails open.
- **Uploads** — `src/lib/supabase/storage.ts` handles avatars (`avatars`), charity
  images (`charity-media`, public) and winner proofs (`winner-proofs`, private +
  signed URLs). Server Action body limit raised via `SERVER_ACTIONS_BODY_SIZE_LIMIT`.
- **Payments** — `src/lib/payments/razorpay.ts`; mock until keys present; webhook
  verifies signatures and maps lifecycle → subscription status.
- **Email** — `notification-service`; logs in demo mode, sends via Resend when
  `RESEND_API_KEY` is set.
- **Config** — `src/lib/config.ts` single-sources plans, prize tiers, draw/score
  rules and route→role mapping.

---

## 6. Provisioning & deployment

- `npm run db:push` — applies `supabase/schema.sql` (Management API) **and**
  creates the storage buckets in one idempotent command.
- `npm run create:admin` / `npm run seed` — admin account + demo data.
- **Deploy:** Vercel (app) + Supabase (DB/Auth/Storage). Add env vars; everything
  else degrades gracefully to demo behaviour when an integration is unconfigured.

---

## 7. Directory map

| Path | Responsibility |
|---|---|
| `src/app/(marketing)` | Public pages (home, charities, pricing, how-it-works) |
| `src/app/(auth)` | Signup / login / password reset |
| `src/app/dashboard` | Subscriber panel |
| `src/app/admin` | Admin panel |
| `src/app/docs` | In-app documentation browser |
| `src/app/api` | REST surface + Razorpay webhook |
| `src/lib/services` | Domain logic (one module per context) |
| `src/lib/db` | Repository interface + in-memory + Supabase adapters |
| `src/lib/actions` | Server actions (validated wrappers over services) |
| `src/lib/auth` | Session + AES-256-GCM encrypted role |
| `src/lib/payments` | Razorpay integration |
| `src/lib/supabase` | Supabase clients + storage helpers |
| `src/components/ui` | shadcn-style Radix primitives |
| `supabase/schema.sql` | Postgres schema + RLS + triggers (single source of truth) |
