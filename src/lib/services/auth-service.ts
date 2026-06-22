/**
 * Auth service — signup, login, logout.
 *
 * When Supabase is configured it uses Supabase Auth (service-role to provision
 * the user + profile, then a cookie-bound sign-in for the session). Otherwise it
 * falls back to the in-memory credentials store + encrypted-role cookie, so the
 * app still runs with zero config.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import { setSession, clearSession } from "@/lib/auth/session";
import { signupSchema, loginSchema } from "@/lib/validations";
import { MIN_CHARITY_PCT, isSupabaseConfigured } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function signup(input: unknown): Promise<Profile> {
  const { name, email, password } = signupSchema.parse(input);
  const repos = getRepos();

  if (isSupabaseConfigured()) {
    const admin = supabaseAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) {
      if (/registered|already|exists/i.test(error.message)) {
        throw new Error("An account with this email already exists");
      }
      throw new Error(error.message);
    }
    const userId = data.user.id;
    const profile = await repos.profiles.create({
      id: userId,
      email,
      name,
      role: "subscriber",
      charityId: null,
      charityPct: MIN_CHARITY_PCT,
      luckyNumbers: [],
    });
    // Establish the session (sets Supabase auth cookies).
    const supabase = await createSupabaseServerClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) throw new Error(signErr.message);
    return profile;
  }

  // In-memory fallback
  const existing = await repos.profiles.getByEmail(email);
  if (existing) throw new Error("An account with this email already exists");
  const profile = await repos.profiles.create({
    email,
    name,
    role: "subscriber",
    charityId: null,
    charityPct: MIN_CHARITY_PCT,
    luckyNumbers: [],
  });
  await repos.credentials.set(email, password);
  await setSession(profile.id, profile.role);
  return profile;
}

export async function login(input: unknown): Promise<Profile> {
  const { email, password } = loginSchema.parse(input);
  const repos = getRepos();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error("Invalid email or password");
    const profile = await repos.profiles.getById(data.user.id);
    if (!profile) throw new Error("Profile not found for this account");
    return profile;
  }

  // In-memory fallback
  const ok = await repos.credentials.verify(email, password);
  const profile = await repos.profiles.getByEmail(email);
  if (!ok || !profile) throw new Error("Invalid email or password");
  await setSession(profile.id, profile.role);
  return profile;
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return;
  }
  await clearSession();
}
