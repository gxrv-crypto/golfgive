/**
 * Edge middleware — first line of access control on protected routes.
 *
 * With Supabase configured it refreshes the auth session and verifies the user;
 * otherwise it does a cheap cookie-presence check on the in-memory session.
 * Full role checks + RLS still apply server-side (defence-in-depth, SystemDesign §04).
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/dashboard", "/admin", "/subscribe"];

function loginRedirect(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supaUrl && supaKey) {
    const res = NextResponse.next({ request: req });
    const supabase = createServerClient(supaUrl, supaKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return loginRedirect(req, pathname);
    return res;
  }

  // In-memory fallback.
  if (!req.cookies.has("gg_session")) return loginRedirect(req, pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/subscribe/:path*"],
};
