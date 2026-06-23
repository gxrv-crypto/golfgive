import { NextResponse } from "next/server";
import { listCharities } from "@/lib/services/charity-service";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "charities:get");
  if (limited) return limited;
  const charities = await listCharities();
  return NextResponse.json({ charities });
}
