/**
 * Charity service — directory, profiles, selection and contribution logic,
 * plus admin CRUD and independent donations.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import {
  charitySelectionSchema,
  charityUpsertSchema,
  donationSchema,
} from "@/lib/validations";
import type { Charity, Donation } from "@/types";

export async function listCharities(): Promise<Charity[]> {
  return getRepos().charities.list();
}

export async function getCharity(id: string): Promise<Charity | null> {
  return getRepos().charities.getById(id);
}

export async function featuredCharities(): Promise<Charity[]> {
  return (await getRepos().charities.list()).filter((c) => c.isFeatured);
}

export async function selectCharity(userId: string, input: unknown): Promise<void> {
  const { charityId, charityPct } = charitySelectionSchema.parse(input);
  const repos = getRepos();
  const charity = await repos.charities.getById(charityId);
  if (!charity) throw new Error("Charity not found");
  await repos.profiles.update(userId, { charityId, charityPct });
}

export async function createCharity(input: unknown): Promise<Charity> {
  const data = charityUpsertSchema.parse(input);
  return getRepos().charities.create(data);
}

export async function updateCharity(id: string, input: unknown): Promise<Charity> {
  const data = charityUpsertSchema.partial().parse(input);
  return getRepos().charities.update(id, data);
}

export async function deleteCharity(id: string): Promise<void> {
  await getRepos().charities.remove(id);
}

export async function donate(userId: string, input: unknown): Promise<Donation> {
  const { charityId, amount } = donationSchema.parse(input);
  const repos = getRepos();
  const charity = await repos.charities.getById(charityId);
  if (!charity) throw new Error("Charity not found");
  await repos.charities.update(charityId, { raised: charity.raised + amount });
  return repos.donations.create({ userId, charityId, amount });
}

export async function totalCharityContributions(): Promise<number> {
  const charities = await getRepos().charities.list();
  return charities.reduce((sum, c) => sum + c.raised, 0);
}
