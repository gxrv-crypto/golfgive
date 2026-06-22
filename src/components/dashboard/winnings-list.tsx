"use client";
import * as React from "react";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { TIERS } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import { submitProofAction } from "@/lib/actions/winner-actions";
import type { Winner, WinnerStatus } from "@/types";

const statusVariant: Record<WinnerStatus, "warning" | "success" | "destructive" | "accent"> = {
  pending: "warning",
  approved: "accent",
  rejected: "destructive",
  paid: "success",
};

export function WinningsList({ winners }: { winners: Winner[] }) {
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
      {winners.map((w) => (
        <WinnerRow key={w.id} winner={w} />
      ))}
    </div>
  );
}

function WinnerRow({ winner }: { winner: Winner }) {
  const [pending, start] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const proofUrl = String(fd.get("proofUrl") || "https://proof.golfgive.app/screenshot.png");
    start(async () => {
      const res = await submitProofAction(winner.id, proofUrl);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Proof submitted for review");
      setOpen(false);
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-xl font-bold">{formatCurrency(winner.amount)}</p>
            <Badge variant={statusVariant[winner.status]}>{winner.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {TIERS[winner.tier].label} · matched {winner.matchedCount} numbers
          </p>
        </div>

        {winner.status === "paid" ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" /> Paid out
          </span>
        ) : winner.proofUrl ? (
          <span className="text-sm text-muted-foreground">Proof submitted · under review</span>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full">
                <Upload className="size-4" /> Upload proof
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload winner proof</DialogTitle>
                <DialogDescription>
                  Add a link to your score screenshot from the golf platform. An admin will verify it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proofUrl">Screenshot URL</Label>
                  <Input id="proofUrl" name="proofUrl" type="url" placeholder="https://…" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={pending}>
                    {pending && <Loader2 className="size-4 animate-spin" />} Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
