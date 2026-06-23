/**
 * Auth service — signup, login, logout.
 *
 * When Supabase is configured it uses Supabase Auth (service-role to provision
 * the user + profile, then a cookie-bound sign-in for the session). Otherwise it
 * falls back to the in-memory credentials store + encrypted-role cookie, so the
 * app still runs with zero config.
 */
import "server-only";
import { headers } from "next/headers";
import { getRepos } from "@/lib/db/repositories";
import { setSession, clearSession } from "@/lib/auth/session";
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from "@/lib/validations";
import { MIN_CHARITY_PCT, isSupabaseConfigured } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, SessionUser } from "@/types";

/** Origin of the current request — used for auth email redirect links. */
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export interface SignupResult {
  profile: Profile;
  /** True when a session was created (email confirmation not required). */
  confirmed: boolean;
}

export async function signup(input: unknown): Promise<SignupResult> {
  const { name, email, password } = signupSchema.parse(input);
  const repos = getRepos();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const baseUrl = await getBaseUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        // Where Supabase sends the user after they click the confirmation link.
        emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      if (/registered|already|exists/i.test(error.message)) {
        throw new Error("An account with this email already exists");
      }
      throw new Error(error.message);
    }
    const userId = data.user?.id;
    if (!userId) throw new Error("Could not create your account");

    // Ensure the profile row exists (service role bypasses RLS).
    await supabaseAdmin()
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          name,
          role: "subscriber",
          charity_pct: MIN_CHARITY_PCT,
          lucky_numbers: [],
        },
        { onConflict: "id" },
      );

    const profile = (await repos.profiles.getById(userId))!;
    // A session means the project doesn't require email confirmation.
    return { profile, confirmed: Boolean(data.session) };
  }

  // In-memory fallback (no email confirmation in demo mode).
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
  return { profile, confirmed: true };
}

/** Send a password-reset email (Supabase recovery flow). */
export async function resetPassword(input: unknown): Promise<void> {
  const { email } = forgotPasswordSchema.parse(input);
  if (!isSupabaseConfigured()) return; // demo mode has no email provider
  const supabase = await createSupabaseServerClient();
  const baseUrl = await getBaseUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
  });
  if (error) throw new Error(error.message);
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

/** Change the current user's password. Uses Supabase Auth when configured. */
export async function changePassword(user: SessionUser, input: unknown): Promise<void> {
  const { password } = changePasswordSchema.parse(input);

  if (isSupabaseConfigured()) {
    // Re-keys the password for the cookie-authenticated user.
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return;
  }

  await getRepos().credentials.set(user.email, password);
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return;
  }
  await clearSession();
}
