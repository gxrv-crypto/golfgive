/**
 * Winner verification service (PRD §09).
 * Lifecycle: pending → approved/rejected → paid. Proof upload by the winner,
 * review + payout marking by an admin.
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

export async function submitProof(
  userId: string,
  winnerId: string,
  proofUrl: string,
): Promise<Winner> {
  const repos = getRepos();
  const winner = await repos.winners.getById(winnerId);
  if (!winner || winner.userId !== userId) throw new Error("Winner not found");
  return repos.winners.update(winnerId, { proofUrl, status: "pending" });
}

export async function reviewWinner(
  adminId: string,
  winnerId: string,
  decision: "approved" | "rejected",
): Promise<Winner> {
  return getRepos().winners.update(winnerId, {
    status: decision,
    verifiedBy: adminId,
  });
}

export async function markPaid(winnerId: string): Promise<Winner> {
  return getRepos().winners.update(winnerId, {
    status: "paid",
    paidAt: new Date().toISOString(),
  });
}
