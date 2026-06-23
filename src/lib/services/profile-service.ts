/**
 * Profile service — lucky numbers and account details.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import { luckyNumbersSchema, payoutSchema } from "@/lib/validations";
import type { Profile } from "@/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  return getRepos().profiles.getById(userId);
}

export async function setLuckyNumbers(userId: string, input: unknown): Promise<Profile> {
  const { numbers } = luckyNumbersSchema.parse(input);
  return getRepos().profiles.update(userId, {
    luckyNumbers: [...numbers].sort((a, b) => a - b),
  });
}

export async function updateName(userId: string, name: string): Promise<Profile> {
  return getRepos().profiles.update(userId, { name: name.trim() });
}

export async function setAvatar(userId: string, avatarUrl: string | null): Promise<Profile> {
  return getRepos().profiles.update(userId, { avatarUrl });
}

export async function setPayoutDetails(userId: string, input: unknown): Promise<Profile> {
  const d = payoutSchema.parse(input);
  return getRepos().profiles.update(userId, {
    payoutUpi: d.payoutUpi || null,
    payoutAccountName: d.payoutAccountName || null,
    payoutAccountNumber: d.payoutAccountNumber || null,
    payoutIfsc: d.payoutIfsc || null,
  });
}

export async function listUsers(): Promise<Profile[]> {
  return getRepos().profiles.list();
}
