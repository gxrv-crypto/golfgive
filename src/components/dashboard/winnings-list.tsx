import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIERS } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Winner } from "@/types";

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
        const paid = w.status === "paid";
        return (
          <Card key={w.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl font-bold">{formatCurrency(w.amount)}</p>
                  <Badge variant={paid ? "success" : "warning"}>{paid ? "Paid" : "Pending payout"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {TIERS[w.tier].label} · matched {w.matchedCount} numbers
                </p>
              </div>

              {paid ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                  <CheckCircle2 className="size-4" />
                  Paid{w.paidAt ? ` on ${formatDate(w.paidAt)}` : ""}
                </span>
              ) : hasPayoutDetails ? (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-4" /> Awaiting admin payout
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-warning">
                  <AlertCircle className="size-4" /> Add payout details to get paid
                </span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
