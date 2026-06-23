"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { simulateDraw, publishDraw } from "@/lib/services/draw-service";
import { getRepos } from "@/lib/db/repositories";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { formatCurrency } from "@/lib/format";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { DrawResult, DrawLogic, DrawWeighting } from "@/types";

export async function simulateDrawAction(
  period: string,
  logic: DrawLogic,
  weighting: DrawWeighting = "most",
): Promise<ActionResult<DrawResult>> {
  try {
    await requireRole("admin");
    const result = await simulateDraw(period, logic, weighting);
    return { ok: true, data: result };
  } catch (err) {
    return toError(err);
  }
}

export async function publishDrawAction(
  period: string,
  logic: DrawLogic,
  weighting: DrawWeighting = "most",
): Promise<ActionResult<DrawResult>> {
  try {
    await requireRole("admin");
    const result = await publishDraw(period, logic, weighting);

    // Notify each winner (PRD §13 — draw results / winner alerts).
    const repos = getRepos();
    await Promise.all(
      result.winners.map(async (w) => {
        const profile = await repos.profiles.getById(w.userId);
        if (profile) {
          const tpl = Emails.winnerAlert(formatCurrency(w.amount));
          await sendEmail({ to: profile.email, ...tpl });
        }
      }),
    );

    revalidatePath("/admin/draws");
    revalidatePath("/dashboard/draws");
    return { ok: true, data: result };
  } catch (err) {
    return toError(err);
  }
}
