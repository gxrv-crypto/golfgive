/**
 * Scores API — example of the API-first surface reused by a future mobile app.
 * Auth via session; validation + business rules enforced in the service layer.
 */
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listScores, addScore } from "@/lib/services/score-service";
import { toError } from "@/lib/actions/result";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "scores:get");
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const scores = await listScores(user.id);
  return NextResponse.json({ scores });
}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "scores:post");
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const score = await addScore(user.id, body);
    return NextResponse.json({ score }, { status: 201 });
  } catch (err) {
    const e = toError(err);
    return NextResponse.json({ error: e.error }, { status: 400 });
  }
}
