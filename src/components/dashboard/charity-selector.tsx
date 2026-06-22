"use client";
import * as React from "react";
import { toast } from "sonner";
import { Check, Loader2, HandCoins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { MIN_CHARITY_PCT } from "@/lib/config";
import { selectCharityAction, donateAction } from "@/lib/actions/profile-actions";
import type { Charity } from "@/types";

export function CharitySelector({
  charities,
  currentCharityId,
  currentPct,
}: {
  charities: Charity[];
  currentCharityId: string | null;
  currentPct: number;
}) {
  const [selected, setSelected] = React.useState(currentCharityId);
  const [pct, setPct] = React.useState(Math.max(currentPct, MIN_CHARITY_PCT));
  const [pending, start] = React.useTransition();

  function save() {
    if (!selected) return toast.error("Choose a charity first");
    start(async () => {
      const res = await selectCharityAction({ charityId: selected, charityPct: pct });
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Charity preferences saved");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your contribution</CardTitle>
          <CardDescription>
            A minimum of {MIN_CHARITY_PCT}% of your subscription goes to your chosen charity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Charity contribution: {pct}%</Label>
          <Slider
            min={MIN_CHARITY_PCT}
            max={100}
            step={5}
            value={[pct]}
            onValueChange={(v) => setPct(v[0])}
          />
          <p className="text-xs text-muted-foreground">
            Slide to give more — every percent counts.
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display text-lg font-semibold">Choose your charity</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {charities.map((c) => {
            const active = selected === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                  active ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt={c.name} className="size-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{c.name}</p>
                    {active && <Check className="size-4 shrink-0 text-primary" />}
                  </div>
                  <Badge variant="outline" className="mt-1">{c.category}</Badge>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <DonateDialog charities={charities} />
          <Button onClick={save} disabled={pending} className="rounded-full">
            {pending && <Loader2 className="size-4 animate-spin" />} Save preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

function DonateDialog({ charities }: { charities: Charity[] }) {
  const [pending, start] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      charityId: String(fd.get("charityId")),
      amount: Number(fd.get("amount")),
    };
    start(async () => {
      const res = await donateAction(input);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Thank you for your donation!");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <HandCoins className="size-4" /> Make a donation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>One-off donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="charityId">Charity</Label>
            <select
              id="charityId"
              name="charityId"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {charities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" name="amount" type="number" min={1} required placeholder="500" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Donate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
