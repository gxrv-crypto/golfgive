/**
 * Subscription service — plan selection, status checks, lifecycle transitions.
 * In production the status is driven by Razorpay webhooks; here we transition
 * it directly after a (mock or real) checkout completes.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import { PLANS, type PlanId } from "@/lib/config";
import type { Subscription } from "@/types";

export async function getSubscription(userId: string): Promise<Subscription | null> {
  return getRepos().subscriptions.getByUser(userId);
}

export async function isActive(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
    return false;
  }
  return true;
}

/** Record a not-yet-paid subscription before opening Razorpay Checkout. */
export async function setPendingSubscription(
  userId: string,
  plan: PlanId,
  refs: { razorpaySubscriptionId?: string; razorpayCustomerId?: string } = {},
): Promise<Subscription> {
  return getRepos().subscriptions.upsert({
    userId,
    plan,
    status: "pending",
    razorpaySubscriptionId: refs.razorpaySubscriptionId ?? null,
    razorpayCustomerId: refs.razorpayCustomerId ?? null,
  });
}

/** Activate a subscription after successful checkout. */
export async function activateSubscription(
  userId: string,
  plan: PlanId,
  refs: { razorpaySubscriptionId?: string; razorpayCustomerId?: string } = {},
): Promise<Subscription> {
  const period = PLANS[plan].interval === "year" ? 365 : 30;
  return getRepos().subscriptions.upsert({
    userId,
    plan,
    status: "active",
    razorpaySubscriptionId: refs.razorpaySubscriptionId ?? null,
    razorpayCustomerId: refs.razorpayCustomerId ?? null,
    currentPeriodEnd: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * period,
    ).toISOString(),
  });
}

export async function setStatus(
  userId: string,
  status: Subscription["status"],
): Promise<Subscription> {
  return getRepos().subscriptions.upsert({ userId, status });
}

/** Total active subscribers — used for prize-pool sizing. */
export async function activeSubscriberCount(): Promise<number> {
  const subs = await getRepos().subscriptions.list();
  return subs.filter((s) => s.status === "active").length;
}
