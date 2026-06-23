# GolfGive API Reference

GolfGive is **API-first**: the same domain services that power Server Actions are
exposed as REST route handlers under `src/app/api`, so a future mobile client can
reuse them. All handlers run on the Node.js runtime.

- **Base URL (local):** `http://localhost:3000`
- **Format:** JSON request/response (`Content-Type: application/json`)
- **Auth:** session cookie (Supabase Auth, or the encrypted-role cookie in demo
  mode). Send credentials with the request (browsers do this automatically).
- **Validation:** every write is validated with Zod in the service layer; failures
  return `400` with `{ "error": "<message>" }`.

---

## Authentication

There is no token endpoint — authentication is **cookie-based**. Sign in through
the app (`/login`) or via the `loginAction` Server Action; the browser then holds
the session cookie that these endpoints read. Requests without a valid session to
a protected endpoint receive `401 Unauthorized`.

| Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Validation / bad request (`{ error }`) |
| `401` | Not authenticated |
| `403` | Authenticated but lacking the role |
| `429` | Rate limit exceeded |

---

## Rate limiting

Every `/api/*` route is wrapped by a fixed-window limiter keyed on
`endpoint + client IP`. Defaults (env-tunable): **60 requests / 60 seconds**.

On exceed the response is `429` with body `{ "error": "Too many requests. Please slow down." }`
and headers:

```
Retry-After: <seconds>
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <epoch-ms>
```

Tune via `RATE_LIMIT_ENABLED`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW` (see `.env.example`).

---

## Endpoints

### `GET /api/health`

Public. Reports service status and which integrations are active.

```json
{
  "status": "ok",
  "time": "2026-06-23T10:00:00.000Z",
  "integrations": { "supabase": true, "razorpay": false, "email": false }
}
```

---

### `GET /api/charities`

Public. Returns the full charity directory (with events).

**Response `200`**

```json
{
  "charities": [
    {
      "id": "uuid",
      "name": "Hope Foundation",
      "category": "Children",
      "description": "…",
      "mission": "…",
      "imageUrl": "https://…",
      "isFeatured": true,
      "raised": 1842000,
      "events": [],
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/scores`

Auth required. Returns the current user's scores (most recent first, max 5).

**Response `200`**

```json
{
  "scores": [
    { "id": "uuid", "userId": "uuid", "value": 38, "playedOn": "2026-06-18", "createdAt": "…" }
  ]
}
```

`401` if not authenticated.

---

### `POST /api/scores`

Auth required. Adds (or upserts by date) a Stableford score. Keeps only the last
5 scores per user (oldest auto-evicted by a DB trigger / store rule).

**Request body**

```json
{ "value": 41, "playedOn": "2026-06-20" }
```

| Field | Type | Rules |
|---|---|---|
| `value` | integer | `1`–`45` |
| `playedOn` | string | `YYYY-MM-DD`, not in the future |

**Response `201`**

```json
{ "score": { "id": "uuid", "userId": "uuid", "value": 41, "playedOn": "2026-06-20", "createdAt": "…" } }
```

`400` with `{ error }` on validation failure; `401` if not authenticated.

**Example**

```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "value": 41, "playedOn": "2026-06-20" }'
```

---

### `POST /api/webhooks/razorpay`

Razorpay → server webhook (not for clients). Verifies the
`x-razorpay-signature` header against `RAZORPAY_WEBHOOK_SECRET`, then maps
subscription lifecycle events onto the `subscriptions` table and sends the
matching transactional email.

- Invalid signature → `401`.
- Always returns `200 { "received": true }` for handled/ignored events so
  Razorpay does not retry.

---

## Server Actions (internal)

Most mutations the UI performs are **Server Actions** (`src/lib/actions/*`), not
REST. They share the same services, Zod validation and RBAC. Notable ones:

| Action | Role | Purpose |
|---|---|---|
| `signupAction` / `loginAction` / `logoutAction` | public | Auth |
| `uploadAvatarAction` | subscriber/admin | Avatar → `avatars` bucket |
| `setLuckyNumbersAction` | subscriber/admin | Pick draw numbers (active sub required) |
| `selectCharityAction` / `donateAction` | subscriber/admin | Charity choice + donations |
| `createCharityAction` / `updateCharityAction` / `deleteCharityAction` | admin | Manage charities |
| `uploadCharityImageAction` | admin | Charity image → `charity-media` bucket |
| `runDrawAction` | admin | Simulate / publish a draw |

All return a discriminated result: `{ ok: true, data? }` or `{ ok: false, error }`.
