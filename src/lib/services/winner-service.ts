/**
 * Winner service (PRD §09, simplified).
 *
 * Winners are determined automatically when a draw is published, so there is no
 * proof-upload / approval step. The winner just provides payout details (on
 * their profile) and an admin marks the payout as paid.
 *
 * Lifecycle: pending → paid.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import type { Winner } from "@/types";

export async function listWinners(): Promise<Winner[]> {
  return getRepos().winners.list();
}

export async function listUserWinnings(userId: string): Promise<Winner[]> {
  return getRepos().winners.listByUser(userId);
}

export async function markPaid(winnerId: string): Promise<Winner> {
  return getRepos().winners.update(winnerId, {
    status: "paid",
    paidAt: new Date().toISOString(),
  });
}
