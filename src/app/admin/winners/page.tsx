import { WinnersManager } from "@/components/admin/winners-manager";
import { requireRole } from "@/lib/auth/session";
import { listWinners } from "@/lib/services/winner-service";
import { listUsers } from "@/lib/services/profile-service";
import { getProofSignedUrl } from "@/lib/supabase/storage";
import type { PayoutDetails } from "@/types";

export default async function AdminWinnersPage() {
  await requireRole("admin");
  const [winners, users] = await Promise.all([listWinners(), listUsers()]);

  const payouts: Record<string, PayoutDetails> = {};
  for (const u of users) {
    payouts[u.id] = {
      payoutUpi: u.payoutUpi ?? null,
      payoutAccountName: u.payoutAccountName ?? null,
      payoutAccountNumber: u.payoutAccountNumber ?? null,
      payoutIfsc: u.payoutIfsc ?? null,
    };
  }

  // Short-lived signed URLs so admins can view private proof files.
  const proofUrls: Record<string, string | null> = {};
  await Promise.all(
    winners.map(async (w) => {
      proofUrls[w.id] = await getProofSignedUrl(w.proofUrl);
    }),
  );

  return <WinnersManager winners={winners} payouts={payouts} proofUrls={proofUrls} />;
}
