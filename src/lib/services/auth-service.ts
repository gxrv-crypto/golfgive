/**
 * Auth service — signup, login, logout. Wraps the credentials + profiles repos
 * and establishes the encrypted-role session.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import { setSession, clearSession } from "@/lib/auth/session";
import { signupSchema, loginSchema } from "@/lib/validations";
import { MIN_CHARITY_PCT } from "@/lib/config";
import type { Profile } from "@/types";

export async function signup(input: unknown): Promise<Profile> {
  const { name, email, password } = signupSchema.parse(input);
  const repos = getRepos();

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

  const ok = await repos.credentials.verify(email, password);
  const profile = await repos.profiles.getByEmail(email);
  if (!ok || !profile) throw new Error("Invalid email or password");

  await setSession(profile.id, profile.role);
  return profile;
}

export async function logout(): Promise<void> {
  await clearSession();
}
