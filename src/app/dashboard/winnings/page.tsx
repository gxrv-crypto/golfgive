import { Trophy, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinningsList } from "@/components/dashboard/winnings-list";
import { requireUser } from "@/lib/auth/session";
import { listUserWinnings } from "@/lib/services/winner-service";
import { formatCurrency } from "@/lib/format";

export default async function WinningsPage() {
  const user = await requireUser();
  const winners = await listUserWinnings(user.id);
  const total = winners.reduce((s, w) => s + w.amount, 0);
  const pending = winners.filter((w) => w.status !== "paid").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total won" value={formatCurrency(total)} icon={Trophy} accent="secondary" />
        <StatCard
          label="Pending payouts"
          value={pending}
          icon={Clock}
          accent="warning"
          hint="Awaiting verification or payment"
        />
      </div>
      <WinningsList winners={winners} />
    </div>
  );
}
