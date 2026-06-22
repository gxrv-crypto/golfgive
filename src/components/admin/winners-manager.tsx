"use client";
import * as React from "react";
import { toast } from "sonner";
import { Check, X, Loader2, BadgeDollarSign, ExternalLink } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import {
  reviewWinnerAction,
  markPaidAction,
} from "@/lib/actions/winner-actions";
import type { Winner, WinnerStatus } from "@/types";

const statusVariant: Record<WinnerStatus, "warning" | "success" | "destructive" | "accent"> = {
  pending: "warning",
  approved: "accent",
  rejected: "destructive",
  paid: "success",
};

export function WinnersManager({ winners }: { winners: Winner[] }) {
  const [pending, start] = React.useTransition();

  function review(id: string, decision: "approved" | "rejected") {
    start(async () => {
      const res = await reviewWinnerAction(id, decision);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(`Winner ${decision}`);
    });
  }

  function pay(id: string) {
    start(async () => {
      const res = await markPaidAction(id);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Marked as paid");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winners verification</CardTitle>
        <CardDescription>
          Review proof submissions, then mark approved payouts as paid.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {winners.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No winners to review.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Winner</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{TIERS[w.tier].label}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(w.amount)}</TableCell>
                  <TableCell>
                    {w.proofUrl ? (
                      <a
                        href={w.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Awaiting upload</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[w.status]}>{w.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {w.status === "pending" && w.proofUrl && (
                        <>
                          <Button variant="ghost" size="icon-sm" className="text-success" onClick={() => review(w.id, "approved")} disabled={pending} aria-label="Approve">
                            <Check className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => review(w.id, "rejected")} disabled={pending} aria-label="Reject">
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      {w.status === "approved" && (
                        <Button size="sm" onClick={() => pay(w.id)} disabled={pending}>
                          {pending ? <Loader2 className="size-4 animate-spin" /> : <BadgeDollarSign className="size-4" />}
                          Mark paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
