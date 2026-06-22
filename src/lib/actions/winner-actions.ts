"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { submitProof, reviewWinner, markPaid } from "@/lib/services/winner-service";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { getRepos } from "@/lib/db/repositories";
import { formatCurrency } from "@/lib/format";
import { type ActionResult, toError } from "@/lib/actions/result";

export async function submitProofAction(
  winnerId: string,
  proofUrl: string,
): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await submitProof(user.id, winnerId, proofUrl);
    revalidatePath("/dashboard/winnings");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function reviewWinnerAction(
  winnerId: string,
  decision: "approved" | "rejected",
): Promise<ActionResult> {
  try {
    const admin = await requireRole("admin");
    await reviewWinner(admin.id, winnerId, decision);
    revalidatePath("/admin/winners");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

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
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
