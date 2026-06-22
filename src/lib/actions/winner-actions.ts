"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { markPaid } from "@/lib/services/winner-service";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { getRepos } from "@/lib/db/repositories";
import { formatCurrency } from "@/lib/format";
import { type ActionResult, toError } from "@/lib/actions/result";

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
