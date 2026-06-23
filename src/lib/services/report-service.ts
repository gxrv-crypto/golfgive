/**
 * Reports & analytics for the admin dashboard.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";

export interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  charityContributions: number;
  totalDraws: number;
  pendingWinners: number;
  // Draw statistics
  totalWinners: number;
  totalPaidOut: number;
  pendingPayout: number;
  currentJackpot: number;
  avgPoolPerDraw: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const repos = getRepos();
  const [profiles, subs, charities, draws, winners] = await Promise.all([
    repos.profiles.list(),
    repos.subscriptions.list(),
    repos.charities.list(),
    repos.draws.list(),
    repos.winners.list(),
  ]);

  const published = draws.filter((d) => d.status === "published");
  const totalPrizePool = published.reduce((sum, d) => sum + d.poolTotal, 0);
  // The most recent published draw carries the live jackpot rollover.
  const latest = [...published].sort((a, b) => b.period.localeCompare(a.period))[0];

  return {
    totalUsers: profiles.filter((p) => p.role !== "admin").length,
    activeSubscribers: subs.filter((s) => s.status === "active").length,
    totalPrizePool,
    charityContributions: charities.reduce((sum, c) => sum + c.raised, 0),
    totalDraws: published.length,
    pendingWinners: winners.filter((w) => w.status === "pending").length,
    totalWinners: winners.length,
    totalPaidOut: winners
      .filter((w) => w.status === "paid")
      .reduce((sum, w) => sum + w.amount, 0),
    pendingPayout: winners
      .filter((w) => w.status !== "paid")
      .reduce((sum, w) => sum + w.amount, 0),
    currentJackpot: latest?.jackpotCarry ?? 0,
    avgPoolPerDraw: published.length ? Math.round(totalPrizePool / published.length) : 0,
  };
}
