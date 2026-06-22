import { WinnersManager } from "@/components/admin/winners-manager";
import { requireRole } from "@/lib/auth/session";
import { listWinners } from "@/lib/services/winner-service";

export default async function AdminWinnersPage() {
  await requireRole("admin");
  const winners = await listWinners();
  return <WinnersManager winners={winners} />;
}
