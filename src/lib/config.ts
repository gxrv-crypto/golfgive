/**
 * Central application configuration.
 * Business constants live here so pricing, prize splits and draw rules
 * are single-sourced and easy to tune for multi-country expansion.
 */

export const APP = {
  name: "GolfGive",
  tagline:
    "Track your golf. Win monthly prize draws. Give to charities that matter.",
  legalName: "Digital Heroes",
  currency: "INR",
  currencySymbol: "₹",
  locale: "en-IN",
} as const;

export type PlanId = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  /** Price in major currency units (₹). */
  price: number;
  /** Billing cadence label. */
  interval: "month" | "year";
  /** Effective monthly cost for comparison. */
  perMonth: number;
  highlight?: string;
  features: string[];
  /** Razorpay plan id, injected from env in production. */
  razorpayPlanId?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: 499,
    interval: "month",
    perMonth: 499,
    features: [
      "Full score tracking",
      "Every monthly draw",
      "Choose your charity",
      "Cancel anytime",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_MONTHLY,
  },
  yearly: {
    id: "yearly",
    name: "Yearly",
    price: 4790,
    interval: "year",
    perMonth: 399,
    highlight: "Save 20%",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority winner payouts",
      "Locked-in pricing",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_YEARLY,
  },
};

/** Portion of every subscription that funds the prize pool. */
export const PRIZE_POOL_CONTRIBUTION_PCT = 0.4;

/** Minimum mandatory charity contribution (% of subscription). */
export const MIN_CHARITY_PCT = 10;

export type DrawTier = "five" | "four" | "three";

export interface TierConfig {
  tier: DrawTier;
  label: string;
  /** Numbers that must match. */
  match: number;
  /** Share of the prize pool. */
  sharePct: number;
  rollover: boolean;
}

export const TIERS: Record<DrawTier, TierConfig> = {
  five: { tier: "five", label: "5-Number Match", match: 5, sharePct: 40, rollover: true },
  four: { tier: "four", label: "4-Number Match", match: 4, sharePct: 35, rollover: false },
  three: { tier: "three", label: "3-Number Match", match: 3, sharePct: 25, rollover: false },
};

/** Draw number constraints — Stableford scores 1..45, pick 5. */
export const DRAW = {
  pick: 5,
  min: 1,
  max: 45,
} as const;

/** Score entry rules. */
export const SCORE = {
  min: 1,
  max: 45,
  keepLast: 5,
} as const;

export const ROUTE_ROLES: Record<string, Array<"public" | "subscriber" | "admin">> = {
  "/dashboard": ["subscriber", "admin"],
  "/admin": ["admin"],
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
