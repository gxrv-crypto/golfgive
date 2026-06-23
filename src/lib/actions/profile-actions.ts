"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { setLuckyNumbers, updateName, setPayoutDetails, setAvatar } from "@/lib/services/profile-service";
import { selectCharity, donate } from "@/lib/services/charity-service";
import { requireActiveSubscription } from "@/lib/services/subscription-service";
import { uploadAvatar } from "@/lib/supabase/storage";
import {
  createDonationOrder,
  verifyOrderSignature,
  RAZORPAY_PUBLIC_KEY,
} from "@/lib/payments/razorpay";
import { type ActionResult, toError } from "@/lib/actions/result";
import { donationSchema, type PayoutInput } from "@/lib/validations";

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ avatarUrl: string | null }>> {
  try {
    const user = await requireRole("subscriber", "admin");
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("Please choose an image");
    const url = await uploadAvatar(user.id, file);
    await setAvatar(user.id, url);
    revalidatePath("/dashboard/settings");
    return { ok: true, data: { avatarUrl: url } };
  } catch (err) {
    return toError(err);
  }
}

export async function setLuckyNumbersAction(numbers: number[]): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await requireActiveSubscription(user);
    await setLuckyNumbers(user.id, { numbers });
    revalidatePath("/dashboard/draws");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function selectCharityAction(input: {
  charityId: string;
  charityPct: number;
}): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await selectCharity(user.id, input);
    revalidatePath("/dashboard/charity");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function donateAction(input: {
  charityId: string;
  amount: number;
}): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await donate(user.id, input);
    revalidatePath("/dashboard/charity");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

interface DonationStart {
  mock: boolean;
  /** Present when a real Razorpay Checkout must be opened. */
  orderId?: string;
  amount?: number; // paise
  currency?: string;
  keyId?: string;
  name?: string;
  email?: string;
}

/**
 * Step 1 — create a Razorpay Order for a one-off donation. In mock mode (no
 * live keys) the donation is recorded immediately; otherwise the client opens
 * Checkout and confirms via `verifyDonationAction`.
 */
export async function startDonationAction(input: {
  charityId: string;
  amount: number;
}): Promise<ActionResult<DonationStart>> {
  try {
    const user = await requireRole("subscriber", "admin");
    const { charityId, amount } = donationSchema.parse(input);

    const order = await createDonationOrder(amount);

    if (order.mock) {
      await donate(user.id, { charityId, amount });
      revalidatePath("/dashboard/charity");
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
      },
    };
  } catch (err) {
    return toError(err);
  }
}

/** Step 2 — verify the Razorpay Checkout signature, then record the donation. */
export async function verifyDonationAction(input: {
  charityId: string;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    const { charityId, amount } = donationSchema.parse({
      charityId: input.charityId,
      amount: input.amount,
    });

    if (!verifyOrderSignature(input)) {
      throw new Error("Payment verification failed");
    }

    await donate(user.id, { charityId, amount });
    revalidatePath("/dashboard/charity");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function updateNameAction(name: string): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await updateName(user.id, name);
    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function setPayoutDetailsAction(
  input: Partial<PayoutInput>,
): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await setPayoutDetails(user.id, input);
    revalidatePath("/dashboard/winnings");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
