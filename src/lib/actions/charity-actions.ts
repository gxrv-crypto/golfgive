"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import {
  createCharity,
  updateCharity,
  deleteCharity,
} from "@/lib/services/charity-service";
import { uploadCharityImage } from "@/lib/supabase/storage";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { CharityUpsertInput } from "@/lib/validations";

export async function uploadCharityImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string | null }>> {
  try {
    await requireRole("admin");
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("Please choose an image");
    const url = await uploadCharityImage(file);
    return { ok: true, data: { url } };
  } catch (err) {
    return toError(err);
  }
}

export async function createCharityAction(input: CharityUpsertInput): Promise<ActionResult> {
  try {
    await requireRole("admin");
    await createCharity(input);
    revalidatePath("/admin/charities");
    revalidatePath("/charities");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function updateCharityAction(
  id: string,
  input: Partial<CharityUpsertInput>,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    await updateCharity(id, input);
    revalidatePath("/admin/charities");
    revalidatePath("/charities");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteCharityAction(id: string): Promise<ActionResult> {
  try {
    await requireRole("admin");
    await deleteCharity(id);
    revalidatePath("/admin/charities");
    revalidatePath("/charities");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
