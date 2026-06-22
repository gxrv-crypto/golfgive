"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import {
  setPendingSubscription,
  activateSubscription,
  getSubscription,
} from "@/lib/services/subscription-service";
import { selectCharity } from "@/lib/services/charity-service";
import {
  createSubscription,
  verifyCheckoutSignature,
  RAZORPAY_PUBLIC_KEY,
} from "@/lib/payments/razorpay";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { PlanId } from "@/lib/config";

interface StartResult {
  mock: boolean;
  /** Present when a real Razorpay Checkout must be opened. */
  subscriptionId?: string;
  keyId?: string;
  name?: string;
  email?: string;
  plan?: PlanId;
}

/**
 * Step 1 — save the charity choice, create the Razorpay subscription, and store
 * it as `pending`. In mock mode (no keys) it activates immediately. Otherwise it
 * returns the ids the client needs to open Razorpay Checkout.
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

    const created = await createSubscription(input.plan, user.email);
    await setPendingSubscription(user.id, input.plan, {
      razorpaySubscriptionId: created.subscriptionId,
      razorpayCustomerId: created.customerId ?? undefined,
    });

    if (created.mock) {
      await activateSubscription(user.id, input.plan, {
        razorpaySubscriptionId: created.subscriptionId,
        razorpayCustomerId: created.customerId ?? undefined,
      });
      const tpl = Emails.subscriptionActivated(input.plan);
      await sendEmail({ to: user.email, ...tpl });
      revalidatePath("/dashboard");
      return { ok: true, data: { mock: true } };
    }

    return {
      ok: true,
      data: {
        mock: false,
        subscriptionId: created.subscriptionId,
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

/**
 * Step 2 — verify the Razorpay Checkout signature server-side, then activate.
 */
export async function verifySubscriptionAction(input: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");

    if (!verifyCheckoutSignature(input)) {
      throw new Error("Payment verification failed");
    }

    const sub = await getSubscription(user.id);
    const plan = (sub?.plan ?? "monthly") as PlanId;
    await activateSubscription(user.id, plan, {
      razorpaySubscriptionId: input.razorpay_subscription_id,
    });

    const tpl = Emails.subscriptionActivated(plan);
    await sendEmail({ to: user.email, ...tpl });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
