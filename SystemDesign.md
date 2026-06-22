# System Design — Digital Heroes Platform

> Architecture for the subscription-driven golf · charity · draw platform.
> **Component-based, scalable, secure-by-default.**
> Stack: Next.js · Supabase (DB/Auth/Storage) · Razorpay · Resend · Redis · Vercel.

---

## 01 · High-Level Architecture

```
                              ┌──────────────────────────┐
                              │        Clients           │
                              │  Web (Next.js) · Mobile   │
                              └─────────────┬────────────┘
                                            │ HTTPS
                                            ▼
                           ┌────────────────────────────────┐
                           │   Load Balancer / Edge (Vercel) │
                           │   - TLS termination             │
                           │   - Geo routing · CDN cache     │
                           │   - DDoS / WAF                  │
                           └───────────────┬────────────────┘
                                           │
                                           ▼
                      ┌────────────────────────────────────────┐
                      │        API Gateway Layer (Edge/Node)    │
                      │  - API Key validation                   │
                      │  - JWT / session auth                   │
                      │  - Rate limiting (Redis)                │
                      │  - RBAC enforcement (encrypted role)    │
                      │  - Request validation (Zod)             │
                      └───────────────┬────────────────────────┘
                                      │
          ┌───────────────┬──────────┼───────────┬─────────────────┐
          ▼               ▼          ▼           ▼                 ▼
   ┌────────────┐  ┌────────────┐ ┌────────┐ ┌──────────┐  ┌──────────────┐
   │ Auth/User  │  │Subscription│ │ Score  │ │  Draw &  │  │   Charity    │
   │  Service   │  │  Service   │ │Service │ │  Reward  │  │   Service    │
   └─────┬──────┘  └─────┬──────┘ └───┬────┘ └────┬─────┘  └──────┬───────┘
         │               │            │           │               │
         └───────────────┴────────────┴─────┬─────┴───────────────┘
                                            │
              ┌─────────────────────────────┼───────────────────────────┐
              ▼                             ▼                            ▼
      ┌───────────────┐           ┌──────────────────┐        ┌──────────────────┐
      │   Supabase    │           │      Redis       │        │   3rd-Party APIs │
      │ Postgres + RLS│           │ - Cache          │        │ - Razorpay       │
      │ Auth · Storage│           │ - Rate limit     │        │ - Resend (email) │
      └───────────────┘           │ - Job queue/lock │        └──────────────────┘
                                  └──────────────────┘
```

Each service is a **self-contained module** (route group + service layer + repository) so it can later be extracted into an independent microservice without rewrites.

---

## 02 · Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js (App Router) + shadcn/ui | SSR/ISR web app, component-based UI |
| **API** | Next.js Route Handlers / Edge Functions | Stateless, horizontally scalable |
| **Database** | Supabase Postgres | Relational data + Row Level Security |
| **Auth** | Supabase Auth (JWT) | Identity, sessions, refresh tokens |
| **Storage** | Supabase Storage | Winner proof uploads, charity media |
| **Cache / Limits** | Redis (Upstash) | Caching, rate limiting, locks, queues |
| **Payments** | Razorpay | Subscriptions + webhooks |
| **Email** | Resend | Transactional + notification emails |
| **Hosting / LB** | Vercel | Edge network, auto load balancing, CDN |

---

## 03 · Component-Based Service Breakdown

Each domain is an isolated component with a clear contract.

### Auth / User Service
- Signup, login, refresh, profile management.
- Issues JWT (Supabase Auth) containing `sub`, `email`, and an **encrypted role claim**.
- Enforces RBAC on every protected route.

### Subscription Service
- Manages Monthly / Yearly plans via Razorpay Subscriptions API.
- Listens to Razorpay webhooks → updates `subscriptions` table.
- Exposes real-time subscription-status check (cached in Redis).

### Score Service
- Enforces the rolling **last-5-scores** rule and 1-per-date constraint.
- Validates Stableford range (1–45).
- Reverse-chronological retrieval.

### Draw & Reward Service
- Random + algorithmic draw engines.
- Simulation mode (no persistence) vs. publish mode.
- Prize-pool tier calculation (40/35/25) and jackpot rollover.
- Uses Redis lock to guarantee a single draw execution per month.

### Charity Service
- Charity directory (search/filter), profiles, spotlight.
- Contribution % logic (min 10%), independent donations.

### Notification Service
- Wraps Resend; sends draw results, winner alerts, system updates.
- Queued via Redis to decouple from request lifecycle.

---

## 04 · Authentication & RBAC (Encrypted Role)

### Roles

| Role | Capabilities |
|---|---|
| `public` | Browse, view charities, initiate subscription |
| `subscriber` | Scores, charity selection, dashboard, winnings |
| `admin` | Full management: users, draws, charities, payouts |

### Encrypted Role Flow

1. On login, the user's role is fetched from the `profiles` table.
2. The role is **encrypted** (AES-256-GCM) using a server-side `ROLE_ENCRYPTION_KEY` and embedded as a custom JWT claim (via Supabase Auth Hook / custom claims), so the role is **never exposed in plaintext** to the client.
3. Middleware decrypts and verifies the role server-side on every protected request.
4. **Database-level** enforcement uses Supabase **Row Level Security (RLS)** as a second line of defence — even if the API is bypassed, Postgres policies block unauthorised access.

```ts
// middleware.ts (conceptual)
const token = getBearer(req);
const claims = verifyJwt(token);              // signature check
const role = decryptRole(claims.enc_role);    // AES-256-GCM
if (!ROUTE_ROLES[req.path].includes(role)) {
  return res.status(403).json({ error: "Forbidden" });
}
```

### Defence in Depth
- **JWT** for identity (signed, short-lived access token + refresh token).
- **Encrypted role claim** so role can't be read/tampered client-side.
- **RLS policies** in Postgres scoped by `auth.uid()` and role.
- **API Key** layer for service-to-service and external access (Section 06).

---

## 05 · Database Design (Supabase Postgres)

### Core Tables

```sql
profiles          (id PK→auth.users, name, role, charity_id, charity_pct, created_at)
subscriptions     (id PK, user_id FK, plan, status, razorpay_subscription_id,
                   razorpay_customer_id, current_period_end, created_at)
scores            (id PK, user_id FK, value INT CHECK (value BETWEEN 1 AND 45),
                   played_on DATE, created_at, UNIQUE(user_id, played_on))
charities         (id PK, name, description, media_urls[], is_featured, created_at)
draws             (id PK, period MONTH, type, logic, status, winning_numbers[],
                   published_at)
prize_pools       (id PK, draw_id FK, tier, share_pct, amount, rollover BOOLEAN)
draw_entries      (id PK, draw_id FK, user_id FK, matched_count, created_at)
winners           (id PK, draw_id FK, user_id FK, tier, amount,
                   proof_url, status, verified_by, paid_at)
donations         (id PK, user_id FK, charity_id FK, amount, created_at)
api_keys          (id PK, hashed_key, label, scopes[], last_used, revoked)
```

### Key Constraints & Logic
- `scores`: `UNIQUE(user_id, played_on)` enforces one entry per date. Rolling-5 trimmed via trigger or service logic (delete oldest beyond 5).
- `value` CHECK enforces Stableford range at the DB level.
- All tables carry **RLS policies**: subscribers see only their own rows; admins see all.

### Indexes
- `scores(user_id, played_on DESC)` — fast reverse-chronological fetch.
- `subscriptions(user_id, status)` — quick status checks.
- `winners(draw_id, status)` — admin verification lists.

---

## 06 · API Security — API Keys

Every API (internal service-to-service and external/partner) is gated by an **API key** in addition to user auth.

| Mechanism | Detail |
|---|---|
| **Storage** | Keys stored **hashed** (SHA-256) in `api_keys` — never plaintext. |
| **Transport** | Sent via `Authorization: Bearer` or `x-api-key` header over HTTPS only. |
| **Scopes** | Each key has scoped permissions (`read:scores`, `run:draws`, etc.). |
| **Rotation** | Keys are revocable + rotatable; `last_used` tracked for auditing. |
| **Validation** | Gateway hashes the incoming key, looks it up, checks scope + revoked flag. |

```ts
// API key guard (conceptual)
const raw = req.headers["x-api-key"];
const hashed = sha256(raw);
const key = await db.api_keys.findActive(hashed);
if (!key || !key.scopes.includes(requiredScope)) return res.status(401).end();
```

Layered model: **API Key (who/what app)** → **JWT (which user)** → **Encrypted Role + RLS (what they may do)**.

---

## 07 · Rate Limiting & Redis

Redis (Upstash — serverless-friendly) powers performance and protection.

### Redis Responsibilities

| Use | Implementation |
|---|---|
| **Rate limiting** | Sliding-window / token-bucket per IP, per user, and per API key. |
| **Caching** | Subscription status, charity directory, draw results (short TTL). |
| **Distributed lock** | Single monthly draw execution (`SET NX` lock with TTL). |
| **Job queue** | Email dispatch (Resend) decoupled from request path. |
| **Session/blocklist** | Revoked-token blocklist for instant logout. |

### Rate Limit Tiers

| Scope | Limit (example) |
|---|---|
| Unauthenticated (per IP) | 30 req / min |
| Authenticated user | 120 req / min |
| Sensitive (login, payment, draw) | 5–10 req / min |
| External API key | Per-key configurable quota |

```ts
// Sliding window via Upstash Ratelimit
const { success } = await ratelimit.limit(`${apiKey}:${userId}`);
if (!success) return res.status(429).json({ error: "Too many requests" });
```

When traffic is low these are cheap; under load they protect the DB and payment/email providers from abuse and cost spikes.

---

## 08 · Email — Resend

All transactional and notification email routes through **Resend**.

| Trigger | Email |
|---|---|
| Signup | Welcome + verify |
| Subscription events | Activated / renewed / lapsed / cancelled |
| Draw published | "You're entered" / results summary |
| Winner alert | Congratulations + proof-upload prompt |
| Payout status | Pending → Paid confirmation |
| System updates | Announcements |

**Pattern:** API enqueues an email job in Redis → a worker (cron / queue consumer) calls Resend. This keeps the request fast and lets failed sends retry without blocking the user. Use Resend templates + React Email for consistent, branded messages.

---

## 09 · Storage (Supabase Storage)

| Bucket | Contents | Access |
|---|---|---|
| `winner-proofs` | Score screenshots from winners | Private; signed URLs; admin read |
| `charity-media` | Charity images, event photos | Public read, admin write |
| `avatars` | User profile images | Owner write, public read |

- Uploads validated (type, size) before storage.
- Private buckets served via **time-limited signed URLs**.
- RLS-style storage policies tie objects to `auth.uid()`.

---

## 10 · Load Balancing & Scalability

### Load Balancing
- **Vercel Edge Network** terminates TLS, caches static/ISR content at the CDN edge, and auto-distributes traffic across serverless instances — effectively a managed load balancer with geo-routing and built-in DDoS protection.
- For a self-hosted variant: an L7 load balancer (NGINX / AWS ALB) fronting multiple stateless app instances behind a health check.

### Horizontal Scalability
- **Stateless API**: no server-side session in app memory — all state in Supabase/Redis/JWT — so instances scale out freely behind the LB.
- **Component-based services**: each domain can scale independently or be split into its own deployable unit.
- **Connection pooling**: use Supabase's pooler (PgBouncer) to handle many concurrent serverless connections.
- **Caching tier (Redis)**: absorbs read-heavy endpoints (status checks, directory) to protect Postgres.
- **Async work**: emails and heavy draw computation offloaded to queues/workers.

### Reliability
- Redis distributed lock guarantees exactly-once monthly draw.
- Idempotent webhook handlers (Razorpay) keyed on event id.
- Graceful degradation: if Redis is down, fall back to direct DB reads with conservative limits.

---

## 11 · Request Lifecycle (Example: Submit Score)

```
Client → HTTPS → Vercel LB/Edge
      → API Gateway:
          1. Validate API key (hash lookup, scope)
          2. Verify JWT signature
          3. Decrypt + check role (subscriber)
          4. Rate limit (Redis sliding window)
          5. Validate body (Zod: value 1–45, date)
      → Score Service:
          6. Check subscription active (Redis cache → DB)
          7. Enforce 1-per-date (UNIQUE) + rolling-5 trim
          8. Insert (RLS confirms ownership)
      → Response 201 (cache invalidated)
```

---

## 12 · Scalability Considerations (from PRD)

| PRD Requirement | Architectural Support |
|---|---|
| Multi-country expansion | Edge geo-routing, currency/locale-ready schema |
| Teams / corporate accounts | `organizations` table extensible from `profiles` |
| Campaign module | Pluggable service module, feature-flagged |
| Mobile app version | API-first design; same secured endpoints reused |

---

## 13 · Security Summary

- HTTPS enforced everywhere; HSTS.
- Layered access: **API Key → JWT → Encrypted Role → RLS**.
- Secrets (Razorpay keys, `ROLE_ENCRYPTION_KEY`, Resend, Redis) in env vars only.
- Webhook signature verification (Razorpay).
- Rate limiting on all sensitive endpoints.
- Hashed API keys and tokens at rest; signed/short-lived JWTs.
- Input validation (Zod) on every write path.
- Audit fields (`created_at`, `verified_by`, `last_used`) for traceability.

---

## 14 · Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Security
ROLE_ENCRYPTION_KEY=        # 32-byte key for AES-256-GCM role encryption
API_KEY_SALT=               # for hashing API keys
JWT_SECRET=                 # if custom signing
```
