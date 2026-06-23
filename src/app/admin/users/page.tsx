import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/services/profile-service";
import { getRepos } from "@/lib/db/repositories";
import { getCharity } from "@/lib/services/charity-service";
import { PLANS } from "@/lib/config";
import { UsersDirectory, type AdminUserRow } from "@/components/admin/users-directory";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const repos = getRepos();
  const users = await listUsers();

  const rows: AdminUserRow[] = await Promise.all(
    users.map(async (u) => {
      const [sub, scores, charity] = await Promise.all([
        repos.subscriptions.getByUser(u.id),
        repos.scores.listByUser(u.id),
        u.charityId ? getCharity(u.charityId) : Promise.resolve(null),
      ]);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        subPlan: sub ? PLANS[sub.plan].name : null,
        subStatus: sub?.status ?? null,
        renewsAt: sub?.currentPeriodEnd ?? null,
        charityName: charity?.name ?? null,
        charityPct: u.charityPct,
        scoreCount: scores.length,
        luckyNumbers: u.luckyNumbers,
        payoutUpi: u.payoutUpi ?? null,
        payoutAccountNumber: u.payoutAccountNumber ?? null,
        payoutIfsc: u.payoutIfsc ?? null,
        payoutAccountName: u.payoutAccountName ?? null,
      };
    }),
  );

  return <UsersDirectory users={rows} />;
}
