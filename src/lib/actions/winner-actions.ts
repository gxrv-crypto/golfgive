"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { markPaid, attachProof, reviewWinner } from "@/lib/services/winner-service";
import { uploadProof } from "@/lib/supabase/storage";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { getRepos } from "@/lib/db/repositories";
import { formatCurrency } from "@/lib/format";
import { type ActionResult, toError } from "@/lib/actions/result";

/** Winner uploads a proof screenshot to Supabase Storage. */
export async function uploadProofAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    const winnerId = String(formData.get("winnerId") ?? "");
    const file = formData.get("file") as File | null;
    if (!winnerId) throw new Error("Missing winning reference");
    if (!file) throw new Error("Please choose a file");

    const path = await uploadProof(user.id, winnerId, file);
    await attachProof(user.id, winnerId, path);
    revalidatePath("/dashboard/winnings");
    revalidatePath("/admin/winners");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

/** Admin approves or rejects a winner's uploaded proof (PRD §09). */
export async function reviewWinnerAction(
  winnerId: string,
  decision: "approved" | "rejected",
): Promise<ActionResult> {
  try {
    const admin = await requireRole("admin");
    await reviewWinner(admin.id, winnerId, decision);
    revalidatePath("/admin/winners");
    revalidatePath("/dashboard/winnings");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

/** Admin marks a winner's payout as completed. */
export async function markPaidAction(winnerId: string): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const winner = await markPaid(winnerId);
    const profile = await getRepos().profiles.getById(winner.userId);
    if (profile) {
      const tpl = Emails.payoutPaid(formatCurrency(winner.amount));
      await sendEmail({ to: profile.email, ...tpl });
    }
    revalidatePath("/admin/winners");
    revalidatePath("/dashboard/winnings");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
