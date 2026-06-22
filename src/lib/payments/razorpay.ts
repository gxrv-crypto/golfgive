/**
 * Razorpay integration (PRD §04, SystemDesign §13).
 *
 *  - `createSubscription` provisions a recurring subscription via the
 *    Subscriptions API (or returns a mock id when keys are absent).
 *  - `verifyWebhookSignature` validates `x-razorpay-signature` server-side.
 *  - `verifyCheckoutSignature` validates the client checkout handshake.
 *
 * Keeping all gateway logic here means the rest of the app never imports the
 * SDK directly — payments stay a swappable component.
 */
import "server-only";
import crypto from "node:crypto";
import { isRazorpayConfigured, PLANS, type PlanId } from "@/lib/config";

export interface CreatedSubscription {
  subscriptionId: string;
  customerId: string | null;
  mock: boolean;
}

export async function createSubscription(
  plan: PlanId,
  email: string,
): Promise<CreatedSubscription> {
  if (!isRazorpayConfigured()) {
    // Mock mode — lets the full subscribe flow run without live keys.
    return {
      subscriptionId: `sub_mock_${crypto.randomBytes(6).toString("hex")}`,
      customerId: `cust_mock_${crypto.randomBytes(4).toString("hex")}`,
      mock: true,
    };
  }

  const planId = PLANS[plan].razorpayPlanId;
  if (!planId) throw new Error(`Missing Razorpay plan id for ${plan}`);

  const { default: Razorpay } = await import("razorpay");
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const sub = await client.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: plan === "yearly" ? 1 : 12,
    notes: { email },
  });

  return {
    subscriptionId: sub.id,
    customerId: (sub.customer_id as string) ?? null,
    mock: false,
  };
}

/** HMAC-SHA256 verification of a Razorpay webhook payload. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

/** Verify the checkout success handshake (subscription flow). */
export function verifyCheckoutSignature(params: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpay_payment_id}|${params.razorpay_subscription_id}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(params.razorpay_signature),
    );
  } catch {
    return false;
  }
}

export const RAZORPAY_PUBLIC_KEY = process.env.RAZORPAY_KEY_ID ?? "";
