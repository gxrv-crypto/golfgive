import { NextResponse } from "next/server";
import { isSupabaseConfigured, isRazorpayConfigured } from "@/lib/config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    integrations: {
      supabase: isSupabaseConfigured(),
      razorpay: isRazorpayConfigured(),
      email: Boolean(process.env.RESEND_API_KEY),
    },
  });
}
