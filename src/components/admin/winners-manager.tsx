"use client";
import * as React from "react";
import { toast } from "sonner";
import {
  Loader2,
  BadgeIndianRupee,
  Smartphone,
  Landmark,
  FileImage,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TIERS } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import { markPaidAction, reviewWinnerAction } from "@/lib/actions/winner-actions";
import type { Winner, PayoutDetails, WinnerStatus } from "@/types";

const STATUS: Record<WinnerStatus, { label: string; variant: "warning" | "accent" | "destructive" | "success" }> = {
  pending: { label: "Pending review", variant: "warning" },
  approved: { label: "Approved", variant: "accent" },
  rejected: { label: "Rejected", variant: "destructive" },
  paid: { label: "Paid", variant: "success" },
};

export function WinnersManager({
  winners,
  payouts,
  proofUrls = {},
}: {
  winners: Winner[];
  payouts: Record<string, PayoutDetails>;
  proofUrls?: Record<string, string | null>;
}) {
  const [pending, start] = React.useTransition();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = winners.find((w) => w.id === selectedId) ?? null;
  const pendingCount = winners.filter((w) => w.status !== "paid").length;

  function pay(id: string) {
    start(async () => {
      const res = await markPaidAction(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Payout marked as paid");
      setSelectedId(null);
    });
  }

  function review(id: string, decision: "approved" | "rejected") {
    start(async () => {
      const res = await reviewWinnerAction(id, decision);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(decision === "approved" ? "Proof approved" : "Proof rejected");
      setSelectedId(null);
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Winners &amp; payouts</CardTitle>
          <CardDescription>
            Winners are determined automatically from each draw. Review the uploaded
            proof, then pay out to their UPI / bank details. {pendingCount} pending.
          </CardDescription>
        </CardHeader>
      </Card>

      {winners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No winners yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((w) => (
            <Card key={w.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{w.userName}</p>
                    <Badge variant="outline" className="mt-1">{TIERS[w.tier].label}</Badge>
                  </div>
                  <Badge variant={STATUS[w.status].variant}>{STATUS[w.status].label}</Badge>
                </div>
                <p className="font-display text-2xl font-bold tabular-nums">
                  {formatCurrency(w.amount)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-full"
                  onClick={() => setSelectedId(w.id)}
                >
                  <Eye className="size-4" /> View &amp; manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent>
          {selected && (
            <WinnerDetails
              winner={selected}
              payout={payouts[selected.userId]}
              proofUrl={proofUrls[selected.id] ?? null}
              pending={pending}
              onApprove={() => review(selected.id, "approved")}
              onReject={() => review(selected.id, "rejected")}
              onPay={() => pay(selected.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WinnerDetails({
  winner,
  payout,
  proofUrl,
  pending,
  onApprove,
  onReject,
  onPay,
}: {
  winner: Winner;
  payout?: PayoutDetails;
  proofUrl: string | null;
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPay: () => void;
}) {
  const hasDetails = Boolean(payout?.payoutUpi || payout?.payoutAccountNumber);
  const paid = winner.status === "paid";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{winner.userName}</DialogTitle>
        <DialogDescription>
          {TIERS[winner.tier].label} · matched {winner.matchedCount} numbers
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Prize</span>
          <span className="font-display text-xl font-bold tabular-nums">{formatCurrency(winner.amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={STATUS[winner.status].variant}>{STATUS[winner.status].label}</Badge>
        </div>

        <Separator />

        <div>
          <p className="mb-1 font-medium">Payout details</p>
          {hasDetails ? (
            <div className="space-y-0.5 text-muted-foreground">
              {payout?.payoutUpi && (
                <p className="flex items-center gap-1.5"><Smartphone className="size-3.5" /> {payout.payoutUpi}</p>
              )}
              {payout?.payoutAccountNumber && (
                <p className="flex items-center gap-1.5">
                  <Landmark className="size-3.5" /> {payout.payoutAccountNumber}
                  {payout.payoutIfsc ? ` · ${payout.payoutIfsc}` : ""}
                </p>
              )}
              {payout?.payoutAccountName && <p className="text-xs">{payout.payoutAccountName}</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">Winner hasn&apos;t added payout details yet.</p>
          )}
        </div>

        <div>
          <p className="mb-1 font-medium">Verification proof</p>
          {proofUrl ? (
            <a
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <FileImage className="size-4" /> View uploaded screenshot
            </a>
          ) : winner.proofUrl ? (
            <p className="text-muted-foreground">Uploaded (generating link…)</p>
          ) : (
            <p className="text-muted-foreground">No proof uploaded yet.</p>
          )}
        </div>

        {paid && winner.paidAt && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid on</span>
              <span className="font-medium">{formatDate(winner.paidAt)}</span>
            </div>
          </>
        )}
      </div>

      {!paid && (
        <DialogFooter>
          {!winner.proofUrl ? (
            <span className="text-sm text-muted-foreground">Awaiting proof upload from the winner.</span>
          ) : winner.status !== "approved" ? (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 text-destructive"
                onClick={onReject}
                disabled={pending}
              >
                <X className="size-4" /> Reject
              </Button>
              <Button className="flex-1" onClick={onApprove} disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Approve
              </Button>
            </div>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={onPay}
              disabled={!hasDetails || pending}
              title={hasDetails ? "Mark payout as paid" : "Winner hasn't added payout details"}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <BadgeIndianRupee className="size-4" />}
              Mark paid
            </Button>
          )}
        </DialogFooter>
      )}
    </>
  );
}
