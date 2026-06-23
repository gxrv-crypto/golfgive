/**
 * Razorpay webhook handler (PRD §04).
 * Verifies the x-razorpay-signature, then idempotently maps subscription
 * lifecycle events onto our subscriptions table.
 */
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { getRepos } from "@/lib/db/repositories";
import { setStatus } from "@/lib/services/subscription-service";
import { sendEmail, Emails } from "@/lib/services/notification-service";
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
    const repos = getRepos();
    const subs = await repos.subscriptions.list();
    const match = subs.find((s) => s.razorpaySubscriptionId === razorpaySubId);
    if (match) {
      await setStatus(match.userId, status);

      // Notify the subscriber about the lifecycle change.
      const profile = await repos.profiles.getById(match.userId);
      if (profile) {
        const tpl =
          payload.event === "subscription.charged"
            ? Emails.subscriptionRenewed(match.plan)
            : payload.event === "subscription.cancelled"
              ? Emails.subscriptionCancelled(match.plan)
              : status === "lapsed"
                ? Emails.subscriptionLapsed()
                : payload.event === "subscription.activated"
                  ? Emails.subscriptionActivated(match.plan)
                  : null;
        if (tpl) await sendEmail({ to: profile.email, ...tpl });
      }
    }
  }

  // Always 200 so Razorpay doesn't retry on handled/ignored events.
  return NextResponse.json({ received: true });
}
