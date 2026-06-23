/**
 * Lightweight fixed-window rate limiter.
 *
 * Defaults are env-controlled (see below) and apply across the API surface.
 * When Upstash Redis REST env vars are present the counter is shared across
 * instances; otherwise it falls back to a per-instance in-memory map (fine for
 * a single server / the demo). The limiter always **fails open** — if the
 * backing store errors, requests are allowed rather than blocked.
 *
 * Env:
 *   RATE_LIMIT_ENABLED   "true" | "false"   (default "true")
 *   RATE_LIMIT_MAX       requests per window (default 60)
 *   RATE_LIMIT_WINDOW    window in seconds   (default 60)
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (optional shared store)
 */
import "server-only";
import { NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Max requests allowed within the window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix epoch (ms) when the current window resets. */
  reset: number;
}

const ENABLED = (process.env.RATE_LIMIT_ENABLED ?? "true").toLowerCase() !== "false";

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  max: Number(process.env.RATE_LIMIT_MAX ?? 60),
  windowSeconds: Number(process.env.RATE_LIMIT_WINDOW ?? 60),
};

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

/* ----------------------------- in-memory store ------------------------------ */

const buckets = new Map<string, { count: number; reset: number }>();

function memoryHit(key: string, cfg: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = cfg.windowSeconds * 1000;
  let bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
  }
  return {
    success: bucket.count <= cfg.max,
    limit: cfg.max,
    remaining: Math.max(0, cfg.max - bucket.count),
    reset: bucket.reset,
  };
}

/* ----------------------------- upstash store -------------------------------- */

async function upstashHit(key: string, cfg: RateLimitConfig): Promise<RateLimitResult> {
  const windowMs = cfg.windowSeconds * 1000;
  // Pipeline: INCR then set TTL only when the key is new (NX).
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, String(windowMs), "NX"],
      ["PTTL", key],
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = (await res.json()) as Array<{ result: number }>;
  const count = Number(data[0]?.result ?? 0);
  const ttl = Number(data[2]?.result ?? windowMs);
  return {
    success: count <= cfg.max,
    limit: cfg.max,
    remaining: Math.max(0, cfg.max - count),
    reset: Date.now() + (ttl > 0 ? ttl : windowMs),
  };
}

/* ----------------------------- public API ----------------------------------- */

/**
 * Register a hit for `identifier`. Returns whether the request is within limits.
 * Disabled (via env) or on store failure it returns success (fail-open).
 */
export async function rateLimit(
  identifier: string,
  cfg: RateLimitConfig = DEFAULT_RATE_LIMIT,
): Promise<RateLimitResult> {
  if (!ENABLED) {
    return { success: true, limit: cfg.max, remaining: cfg.max, reset: Date.now() };
  }
  const key = `ratelimit:${identifier}`;
  try {
    return useUpstash ? await upstashHit(key, cfg) : memoryHit(key, cfg);
  } catch {
    // Fail open — never let the limiter take the app down.
    return { success: true, limit: cfg.max, remaining: cfg.max, reset: Date.now() };
  }
}

/** Best-effort client IP from proxy headers (Vercel/Next). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Convenience guard for route handlers. Returns a 429 `NextResponse` when the
 * caller is over the limit, or `null` to continue. `bucket` namespaces the
 * counter so different endpoints don't share one budget.
 */
export async function enforceRateLimit(
  req: Request,
  bucket: string,
  cfg: RateLimitConfig = DEFAULT_RATE_LIMIT,
): Promise<NextResponse | null> {
  const result = await rateLimit(`${bucket}:${clientIp(req)}`, cfg);
  if (result.success) return null;
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    },
  );
}
