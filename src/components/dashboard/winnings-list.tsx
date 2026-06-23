import { CheckCircle2, Clock, AlertCircle, ShieldCheck, XCircle, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProofUpload } from "@/components/dashboard/proof-upload";
import { TIERS } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Winner, WinnerStatus } from "@/types";

const BADGE: Record<WinnerStatus, { label: string; variant: "warning" | "accent" | "destructive" | "success" }> = {
  pending: { label: "Pending review", variant: "warning" },
  approved: { label: "Approved", variant: "accent" },
  rejected: { label: "Rejected", variant: "destructive" },
  paid: { label: "Paid", variant: "success" },
};

export function WinningsList({
  winners,
  hasPayoutDetails,
}: {
  winners: Winner[];
  hasPayoutDetails: boolean;
}) {
  if (winners.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No winnings yet. Keep playing — your numbers are in every draw!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {winners.map((w) => {
        const hasProof = Boolean(w.proofUrl);
        // Proof can be (re)uploaded while pending or after a rejection.
        const canUpload = w.status === "pending" || w.status === "rejected";
        return (
          <Card key={w.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl font-bold">{formatCurrency(w.amount)}</p>
                  <Badge variant={BADGE[w.status].variant}>{BADGE[w.status].label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {TIERS[w.tier].label} · matched {w.matchedCount} numbers
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <StatusMessage status={w.status} paidAt={w.paidAt} hasProof={hasProof} hasPayoutDetails={hasPayoutDetails} />
                {canUpload && <ProofUpload winnerId={w.id} hasProof={hasProof} />}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatusMessage({
  status,
  paidAt,
  hasProof,
  hasPayoutDetails,
}: {
  status: WinnerStatus;
  paidAt: string | null;
  hasProof: boolean;
  hasPayoutDetails: boolean;
}) {
  const cls = "flex items-center gap-1.5 text-sm font-medium";
  if (status === "paid") {
    return (
      <span className={`${cls} text-success`}>
        <CheckCircle2 className="size-4" /> Paid{paidAt ? ` on ${formatDate(paidAt)}` : ""}
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className={`${cls} text-destructive`}>
        <XCircle className="size-4" /> Proof rejected — please re-upload
      </span>
    );
  }
  if (status === "approved") {
    return hasPayoutDetails ? (
      <span className={`${cls} text-accent`}>
        <ShieldCheck className="size-4" /> Verified — awaiting payout
      </span>
    ) : (
      <span className={`${cls} text-warning`}>
        <AlertCircle className="size-4" /> Verified — add payout details to get paid
      </span>
    );
  }
  // pending
  return hasProof ? (
    <span className={`${cls} text-muted-foreground`}>
      <Clock className="size-4" /> Proof under review
    </span>
  ) : (
    <span className={`${cls} text-warning`}>
      <Upload className="size-4" /> Upload proof to verify your win
    </span>
  );
}
