"use client";
import * as React from "react";
import { toast } from "sonner";
import { Loader2, BadgeIndianRupee, Smartphone, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TIERS } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import { markPaidAction } from "@/lib/actions/winner-actions";
import type { Winner, PayoutDetails } from "@/types";

export function WinnersManager({
  winners,
  payouts,
}: {
  winners: Winner[];
  payouts: Record<string, PayoutDetails>;
}) {
  const [pending, start] = React.useTransition();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  function pay(id: string) {
    setActiveId(id);
    start(async () => {
      const res = await markPaidAction(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Payout marked as paid");
    });
  }

  const pendingCount = winners.filter((w) => w.status !== "paid").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winners &amp; payouts</CardTitle>
        <CardDescription>
          Winners are determined automatically from each draw. Pay them out to the
          UPI / bank details they provided, then mark as paid. {pendingCount} pending.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {winners.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No winners yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Winner</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payout details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((w) => {
                const payout = payouts[w.userId];
                const hasDetails = Boolean(payout?.payoutUpi || payout?.payoutAccountNumber);
                const paid = w.status === "paid";
                return (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{TIERS[w.tier].label}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(w.amount)}</TableCell>
                    <TableCell>
                      {hasDetails ? (
                        <div className="space-y-0.5 text-sm">
                          {payout.payoutUpi && (
                            <p className="flex items-center gap-1.5">
                              <Smartphone className="size-3.5 text-muted-foreground" />
                              {payout.payoutUpi}
                            </p>
                          )}
                          {payout.payoutAccountNumber && (
                            <p className="flex items-center gap-1.5">
                              <Landmark className="size-3.5 text-muted-foreground" />
                              {payout.payoutAccountNumber}
                              {payout.payoutIfsc ? ` · ${payout.payoutIfsc}` : ""}
                            </p>
                          )}
                          {payout.payoutAccountName && (
                            <p className="text-xs text-muted-foreground">{payout.payoutAccountName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Awaiting details</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paid ? "success" : "warning"}>
                        {paid ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {paid ? (
                        <span className="text-xs text-muted-foreground">
                          {w.paidAt ? formatDate(w.paidAt) : "—"}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => pay(w.id)}
                          disabled={!hasDetails || pending}
                          title={hasDetails ? "Mark payout as paid" : "Winner hasn't added payout details"}
                        >
                          {pending && activeId === w.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <BadgeIndianRupee className="size-4" />
                          )}
                          Mark paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
