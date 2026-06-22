"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { activateSubscription } from "@/lib/services/subscription-service";
import { selectCharity } from "@/lib/services/charity-service";
import { createSubscription } from "@/lib/payments/razorpay";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { PlanId } from "@/lib/config";

/**
 * Subscribe flow. In production the client opens Razorpay Checkout and the
 * webhook activates the subscription; here we provision the subscription
 * (mock id when keys are absent) and activate it directly so the demo works
 * end-to-end.
 */
export async function subscribeAction(input: {
  plan: PlanId;
  charityId: string;
  charityPct: number;
}): Promise<ActionResult<{ mock: boolean }>> {
  try {
    const user = await requireRole("subscriber", "admin");

    await selectCharity(user.id, {
      charityId: input.charityId,
      charityPct: input.charityPct,
    });

    const created = await createSubscription(input.plan, user.email);
    await activateSubscription(user.id, input.plan, {
      razorpaySubscriptionId: created.subscriptionId,
      razorpayCustomerId: created.customerId ?? undefined,
    });

    const tpl = Emails.subscriptionActivated(input.plan);
    await sendEmail({ to: user.email, ...tpl });

    revalidatePath("/dashboard");
    return { ok: true, data: { mock: created.mock } };
  } catch (err) {
    return toError(err);
  }
}
