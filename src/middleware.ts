/**
 * Edge middleware — first line of access control.
 *
 * It performs a cheap cookie-presence check to bounce anonymous users away from
 * protected areas. Full role decryption + verification happens server-side in
 * the route layouts (see `requireRole`), backed by RLS at the database — the
 * defence-in-depth model from SystemDesign §04.
 */
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/admin", "/subscribe"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const hasSession = req.cookies.has("gg_session");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/subscribe/:path*"],
};
