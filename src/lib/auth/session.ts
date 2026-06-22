/**
 * Session management. In this demo build the session is an httpOnly cookie
 * carrying the user id plus an AES-256-GCM encrypted role claim — mirroring the
 * "encrypted role" pattern that Supabase Auth custom claims would provide in
 * production. Swapping to Supabase Auth means re-implementing only this file.
 */
import "server-only";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/auth/crypto";
import { getRepos } from "@/lib/db/repositories";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role, SessionUser } from "@/types";

const COOKIE = "gg_session";

interface TokenPayload {
  uid: string;
  encRole: string;
}

export async function setSession(userId: string, role: Role) {
  const payload: TokenPayload = { uid: userId, encRole: encrypt(role) };
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Resolve the current user. Uses Supabase Auth when configured. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const profile = await getRepos().profiles.getById(user.id);
    if (!profile) return null;
    return { id: profile.id, email: profile.email, name: profile.name, role: profile.role };
  }

  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  const role = decrypt(payload.encRole) as Role | null;
  if (!role) return null;

  const profile = await getRepos().profiles.getById(payload.uid);
  if (!profile) return null;

  // The cookie role is advisory; the DB is the source of truth (defence in depth).
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
