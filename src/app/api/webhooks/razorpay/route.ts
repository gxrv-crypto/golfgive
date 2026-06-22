/**
 * Razorpay webhook handler (PRD §04).
 * Verifies the x-razorpay-signature, then idempotently maps subscription
 * lifecycle events onto our subscriptions table.
 */
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { getRepos } from "@/lib/db/repositories";
import { setStatus } from "@/lib/services/subscription-service";
import type { SubscriptionStatus } from "@/types";

export const runtime = "nodejs";

const EVENT_STATUS: Record<string, SubscriptionStatus> = {
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.cancelled": "cancelled",
  "subscription.completed": "lapsed",
  "payment.failed": "lapsed",
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: string; payload?: { subscription?: { entity?: { id?: string } } } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = payload.event ? EVENT_STATUS[payload.event] : undefined;
  const razorpaySubId = payload.payload?.subscription?.entity?.id;

  if (status && razorpaySubId) {
    const subs = await getRepos().subscriptions.list();
    const match = subs.find((s) => s.razorpaySubscriptionId === razorpaySubId);
    if (match) await setStatus(match.userId, status);
  }

  // Always 200 so Razorpay doesn't retry on handled/ignored events.
  return NextResponse.json({ received: true });
}
