/**
 * Domain models shared across services, repositories and UI.
 * Kept framework-agnostic so they can be reused by a future mobile app.
 */
import type { PlanId, DrawTier } from "@/lib/config";

export type Role = "public" | "subscriber" | "admin";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  charityId: string | null;
  charityPct: number;
  /** Lucky numbers the subscriber plays in draws (1..45, length 5). */
  luckyNumbers: number[];
  /** Public avatar URL (Supabase Storage `avatars` bucket). */
  avatarUrl?: string | null;
  /** Payout details for claiming winnings (set by the winner). */
  payoutUpi?: string | null;
  payoutAccountName?: string | null;
  payoutAccountNumber?: string | null;
  payoutIfsc?: string | null;
  createdAt: string;
}

export interface PayoutDetails {
  payoutUpi: string | null;
  payoutAccountName: string | null;
  payoutAccountNumber: string | null;
  payoutIfsc: string | null;
}

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "lapsed"
  | "pending";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  razorpaySubscriptionId: string | null;
  razorpayCustomerId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export interface Score {
  id: string;
  userId: string;
  /** Stableford points, 1..45. */
  value: number;
  playedOn: string; // ISO date (yyyy-mm-dd)
  createdAt: string;
}

export interface Charity {
  id: string;
  name: string;
  category: string;
  description: string;
  mission: string;
  imageUrl: string;
  isFeatured: boolean;
  /** Aggregate raised, in major currency units. */
  raised: number;
  events: CharityEvent[];
  createdAt: string;
}

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
}

export type DrawLogic = "random" | "algorithmic";
/** For algorithmic draws: bias toward most- or least-frequently played scores. */
export type DrawWeighting = "most" | "least";
export type DrawStatus = "draft" | "simulated" | "published";

export interface Draw {
  id: string;
  /** e.g. "2026-06" */
  period: string;
  logic: DrawLogic;
  status: DrawStatus;
  winningNumbers: number[];
  poolTotal: number;
  jackpotCarry: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface PrizePool {
  tier: DrawTier;
  sharePct: number;
  amount: number;
  rollover: boolean;
  winnerCount: number;
  perWinner: number;
}

export type WinnerStatus = "pending" | "approved" | "rejected" | "paid";

export interface Winner {
  id: string;
  drawId: string;
  userId: string;
  userName: string;
  tier: DrawTier;
  matchedCount: number;
  amount: number;
  proofUrl: string | null;
  status: WinnerStatus;
  verifiedBy: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  charityId: string;
  amount: number;
  createdAt: string;
}

/** Result of simulating/publishing a draw. */
export interface DrawResult {
  draw: Draw;
  pools: PrizePool[];
  winners: Winner[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
