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

  return {
    totalUsers: profiles.filter((p) => p.role !== "admin").length,
    activeSubscribers: subs.filter((s) => s.status === "active").length,
    totalPrizePool: draws
      .filter((d) => d.status === "published")
      .reduce((sum, d) => sum + d.poolTotal, 0),
    charityContributions: charities.reduce((sum, c) => sum + c.raised, 0),
    totalDraws: draws.filter((d) => d.status === "published").length,
    pendingWinners: winners.filter((w) => w.status === "pending").length,
  };
}
