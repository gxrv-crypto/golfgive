"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { simulateDraw, publishDraw } from "@/lib/services/draw-service";
import { type ActionResult, toError } from "@/lib/actions/result";
import type { DrawResult, DrawLogic } from "@/types";

export async function simulateDrawAction(
  period: string,
  logic: DrawLogic,
): Promise<ActionResult<DrawResult>> {
  try {
    await requireRole("admin");
    const result = await simulateDraw(period, logic);
    return { ok: true, data: result };
  } catch (err) {
    return toError(err);
  }
}

export async function publishDrawAction(
  period: string,
  logic: DrawLogic,
): Promise<ActionResult<DrawResult>> {
  try {
    await requireRole("admin");
    const result = await publishDraw(period, logic);
    revalidatePath("/admin/draws");
    revalidatePath("/dashboard/draws");
    return { ok: true, data: result };
  } catch (err) {
    return toError(err);
  }
}
