/**
 * Auth callback — handles Supabase email links (signup confirmation and
 * password recovery). Exchanges the `code` for a session (writing cookies),
 * then redirects to `next`.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
