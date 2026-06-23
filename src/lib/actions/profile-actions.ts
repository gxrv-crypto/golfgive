"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { setLuckyNumbers, updateName, setPayoutDetails, setAvatar } from "@/lib/services/profile-service";
import { selectCharity, donate } from "@/lib/services/charity-service";
import { requireActiveSubscription } from "@/lib/services/subscription-service";
import { uploadAvatar } from "@/lib/supabase/storage";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { PayoutInput } from "@/lib/validations";

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
