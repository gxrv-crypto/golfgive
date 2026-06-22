"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { addScore, editScore, deleteScore } from "@/lib/services/score-service";
import { type ActionResult, toError } from "@/lib/actions/result";

export async function addScoreAction(input: {
  value: number;
  playedOn: string;
}): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await addScore(user.id, input);
    revalidatePath("/dashboard/scores");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function editScoreAction(
  scoreId: string,
  input: { value: number; playedOn: string },
): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await editScore(user.id, scoreId, input);
    revalidatePath("/dashboard/scores");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteScoreAction(scoreId: string): Promise<ActionResult> {
  try {
    const user = await requireRole("subscriber", "admin");
    await deleteScore(user.id, scoreId);
    revalidatePath("/dashboard/scores");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
