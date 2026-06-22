import { NextResponse } from "next/server";
import { listCharities } from "@/lib/services/charity-service";

export const runtime = "nodejs";

export async function GET() {
  const charities = await listCharities();
  return NextResponse.json({ charities });
}
