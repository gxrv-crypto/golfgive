"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import {
  setPendingSubscription,
  activateSubscription,
  getSubscription,
  cancelSubscription,
} from "@/lib/services/subscription-service";
import { selectCharity } from "@/lib/services/charity-service";
import {
  createOrder,
  verifyOrderSignature,
  RAZORPAY_PUBLIC_KEY,
} from "@/lib/payments/razorpay";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { PlanId } from "@/lib/config";

interface StartResult {
  mock: boolean;
  /** Present when a real Razorpay Checkout must be opened. */
  orderId?: string;
  amount?: number; // paise
  currency?: string;
  keyId?: string;
  name?: string;
  email?: string;
  plan?: PlanId;
}

/**
 * Step 1 — save the charity choice, create a Razorpay Order for the plan price,
 * and store the subscription as `pending`. In mock mode (no keys) it activates
 * immediately. Otherwise it returns what the client needs to open Checkout.
 */
export async function startSubscriptionAction(input: {
  plan: PlanId;
  charityId: string;
  charityPct: number;
}): Promise<ActionResult<StartResult>> {
  try {
    const user = await requireRole("subscriber", "admin");

    await selectCharity(user.id, {
      charityId: input.charityId,
      charityPct: input.charityPct,
    });

    const order = await createOrder(input.plan);
    await setPendingSubscription(user.id, input.plan, {});

    if (order.mock) {
      await activateSubscription(user.id, input.plan, {});
      const tpl = Emails.subscriptionActivated(input.plan);
      await sendEmail({ to: user.email, ...tpl });
      revalidatePath("/dashboard");
      return { ok: true, data: { mock: true } };
    }

    return {
      ok: true,
      data: {
        mock: false,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_PUBLIC_KEY,
        name: user.name,
        email: user.email,
        plan: input.plan,
      },
    };
  } catch (err) {
    return toError(err);
  }
}

/** Cancel the current user's subscription. */
export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    const sub = await getSubscription(user.id);
    await cancelSubscription(user.id);
    await sendEmail({
      to: user.email,
      ...Emails.subscriptionCancelled(sub?.plan ?? "monthly"),
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

/**
 * Step 2 — verify the Razorpay Checkout signature server-side, then activate.
 */
export async function verifySubscriptionAction(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");

    if (!verifyOrderSignature(input)) {
      throw new Error("Payment verification failed");
    }

    const sub = await getSubscription(user.id);
    const plan = (sub?.plan ?? "monthly") as PlanId;
    await activateSubscription(user.id, plan, {
      razorpayCustomerId: undefined,
    });

    const tpl = Emails.subscriptionActivated(plan);
    await sendEmail({ to: user.email, ...tpl });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
