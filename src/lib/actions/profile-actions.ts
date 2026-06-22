"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { setLuckyNumbers, updateName } from "@/lib/services/profile-service";
import { selectCharity, donate } from "@/lib/services/charity-service";
import { type ActionResult, toError } from "@/lib/actions/result";

export async function setLuckyNumbersAction(numbers: number[]): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
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
