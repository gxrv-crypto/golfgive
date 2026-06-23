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
import { APP, isRazorpayConfigured, PLANS, type PlanId } from "@/lib/config";

export interface CreatedSubscription {
  subscriptionId: string;
  customerId: string | null;
  mock: boolean;
}

export interface CreatedOrder {
  orderId: string;
  amount: number; // in paise
  currency: string;
  mock: boolean;
}

/**
 * Create a one-time Razorpay Order for a plan's price.
 *
 * We use Orders (not the Subscriptions API) for checkout because Razorpay's
 * recurring/e-mandate checkout requires an activated account with the
 * Subscriptions feature enabled; Orders work on any test account. The recurring
 * period is then tracked in our own `subscriptions` table. `createSubscription`
 * remains available for when the account is activated.
 */
export async function createOrder(plan: PlanId): Promise<CreatedOrder> {
  const amount = PLANS[plan].price * 100; // paise
  if (!isRazorpayConfigured()) {
    return {
      orderId: `order_mock_${crypto.randomBytes(6).toString("hex")}`,
      amount,
      currency: APP.currency,
      mock: true,
    };
  }

  const { default: Razorpay } = await import("razorpay");
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await client.orders.create({
    amount,
    currency: APP.currency,
    receipt: `gg_${plan}_${Date.now()}`,
    notes: { plan },
  });

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    mock: false,
  };
}

/**
 * Create a one-time Razorpay Order for an arbitrary donation amount (in rupees).
 * Mirrors `createOrder` but for free-form amounts rather than plan prices.
 */
export async function createDonationOrder(amountRupees: number): Promise<CreatedOrder> {
  const amount = Math.round(amountRupees * 100); // paise
  if (!isRazorpayConfigured()) {
    return {
      orderId: `order_mock_${crypto.randomBytes(6).toString("hex")}`,
      amount,
      currency: APP.currency,
      mock: true,
    };
  }

  const { default: Razorpay } = await import("razorpay");
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await client.orders.create({
    amount,
    currency: APP.currency,
    receipt: `gg_donation_${Date.now()}`,
    notes: { type: "donation" },
  });

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    mock: false,
  };
}

/** Verify the Order checkout handshake (order_id|payment_id). */
export function verifyOrderSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
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
