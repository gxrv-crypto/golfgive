"use client";
import * as React from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DRAW } from "@/lib/config";
import { setLuckyNumbersAction } from "@/lib/actions/profile-actions";

export function LuckyNumbers({ initial }: { initial: number[] }) {
  const [selected, setSelected] = React.useState<number[]>(initial);
  const [pending, start] = React.useTransition();
  const numbers = Array.from({ length: DRAW.max - DRAW.min + 1 }, (_, i) => DRAW.min + i);

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : prev.length >= DRAW.pick
          ? prev
          : [...prev, n],
    );
  }

  function quickPick() {
    const pool = [...numbers];
    const picked: number[] = [];
    while (picked.length < DRAW.pick) {
      const i = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(i, 1)[0]);
    }
    setSelected(picked.sort((a, b) => a - b));
  }

  function save() {
    if (selected.length !== DRAW.pick) {
      return toast.error(`Pick exactly ${DRAW.pick} numbers`);
    }
    start(async () => {
      const res = await setLuckyNumbersAction(selected);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Lucky numbers saved — you're in the next draw!");
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Your lucky numbers</CardTitle>
          <CardDescription>
            Pick {DRAW.pick} numbers ({DRAW.min}–{DRAW.max}). They enter every monthly draw.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={quickPick}>
          <Sparkles className="size-4" /> Quick pick
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 sm:grid-cols-9">
          {numbers.map((n) => {
            const active = selected.includes(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                className={cn(
                  "grid aspect-square place-items-center rounded-lg border text-sm font-medium tabular-nums transition-all",
                  active
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : "hover:border-accent/50 hover:bg-accent/10",
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.length}/{DRAW.pick} selected
          </p>
          <Button onClick={save} disabled={pending} className="rounded-full">
            {pending && <Loader2 className="size-4 animate-spin" />} Save numbers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
