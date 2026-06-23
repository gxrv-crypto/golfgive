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

/**
 * Admin verification of a winner's proof (PRD §09).
 * Approve/Reject the uploaded screenshot before any payout is allowed.
 */
export async function reviewWinner(
  adminId: string,
  winnerId: string,
  decision: "approved" | "rejected",
): Promise<Winner> {
  const repos = getRepos();
  const winner = await repos.winners.getById(winnerId);
  if (!winner) throw new Error("Winning not found");
  if (!winner.proofUrl) throw new Error("No proof has been uploaded to review");
  return repos.winners.update(winnerId, { status: decision, verifiedBy: adminId });
}

export async function markPaid(winnerId: string): Promise<Winner> {
  const repos = getRepos();
  const winner = await repos.winners.getById(winnerId);
  if (!winner) throw new Error("Winning not found");
  // Payout is only allowed after the proof has been verified.
  if (winner.status !== "approved") {
    throw new Error("Approve the winner's proof before marking it paid");
  }
  return repos.winners.update(winnerId, {
    status: "paid",
    paidAt: new Date().toISOString(),
  });
}

/**
 * Attach an (optional) proof screenshot to a win. The winner already won
 * automatically — this is supporting evidence the admin can view before paying.
 */
export async function attachProof(
  userId: string,
  winnerId: string,
  proofPath: string,
): Promise<Winner> {
  const repos = getRepos();
  const winner = await repos.winners.getById(winnerId);
  if (!winner || winner.userId !== userId) throw new Error("Winning not found");
  return repos.winners.update(winnerId, { proofUrl: proofPath });
}
