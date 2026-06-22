import { Trophy, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinningsList } from "@/components/dashboard/winnings-list";
import { PayoutDetailsForm } from "@/components/dashboard/payout-details-form";
import { requireUser } from "@/lib/auth/session";
import { listUserWinnings } from "@/lib/services/winner-service";
import { getProfile } from "@/lib/services/profile-service";
import { formatCurrency } from "@/lib/format";

export default async function WinningsPage() {
  const user = await requireUser();
  const [winners, profile] = await Promise.all([
    listUserWinnings(user.id),
    getProfile(user.id),
  ]);
  const total = winners.reduce((s, w) => s + w.amount, 0);
  const pending = winners.filter((w) => w.status !== "paid").length;
  const hasPayoutDetails = Boolean(profile?.payoutUpi || profile?.payoutAccountNumber);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total won" value={formatCurrency(total)} icon={Trophy} accent="secondary" />
        <StatCard
          label="Pending payouts"
          value={pending}
          icon={Clock}
          accent="warning"
          hint="Awaiting admin payout"
        />
      </div>

      <PayoutDetailsForm
        details={{
          payoutUpi: profile?.payoutUpi ?? null,
          payoutAccountName: profile?.payoutAccountName ?? null,
          payoutAccountNumber: profile?.payoutAccountNumber ?? null,
          payoutIfsc: profile?.payoutIfsc ?? null,
        }}
      />

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">Your winnings</h3>
        <WinningsList winners={winners} hasPayoutDetails={hasPayoutDetails} />
      </div>
    </div>
  );
}
