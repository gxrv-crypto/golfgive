"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PLANS, MIN_CHARITY_PCT, type PlanId } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import { subscribeAction } from "@/lib/actions/subscription-actions";
import type { Charity } from "@/types";

export function SubscribeFlow({ charities }: { charities: Charity[] }) {
  return (
    <React.Suspense fallback={null}>
      <SubscribeInner charities={charities} />
    </React.Suspense>
  );
}

function SubscribeInner({ charities }: { charities: Charity[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = React.useTransition();

  const [plan, setPlan] = React.useState<PlanId>(
    (params.get("plan") as PlanId) === "monthly" ? "monthly" : "yearly",
  );
  const [charityId, setCharityId] = React.useState(
    params.get("charity") ?? charities[0]?.id ?? "",
  );
  const [pct, setPct] = React.useState(MIN_CHARITY_PCT);

  function pay() {
    if (!charityId) return toast.error("Choose a charity");
    start(async () => {
      const res = await subscribeAction({ plan, charityId, charityPct: pct });
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(
        res.data?.mock
          ? "Subscription activated (demo mode — no live payment)"
          : "Payment successful — you're subscribed!",
      );
      router.push("/dashboard");
      router.refresh();
    });
  }

  const charityGiven = Math.round((PLANS[plan].price * pct) / 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Plan */}
        <section>
          <h2 className="font-display text-lg font-semibold">1 · Choose your plan</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["monthly", "yearly"] as PlanId[]).map((id) => {
              const p = PLANS[id];
              const active = plan === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlan(id)}
                  className={cn(
                    "rounded-xl border p-5 text-left transition-all",
                    active ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.name}</span>
                    {p.highlight && <Badge variant="secondary">{p.highlight}</Badge>}
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">
                    {formatCurrency(p.price)}
                    <span className="text-sm font-normal text-muted-foreground">/{p.interval}</span>
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Charity */}
        <section>
          <h2 className="font-display text-lg font-semibold">2 · Pick your charity</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {charities.map((c) => {
              const active = charityId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCharityId(c.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    active ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.imageUrl} alt={c.name} className="size-11 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                  {active && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Contribution */}
        <section>
          <h2 className="font-display text-lg font-semibold">3 · Set your impact</h2>
          <Card className="mt-3">
            <CardContent className="space-y-3 p-5">
              <Label>Charity contribution: {pct}%</Label>
              <Slider min={MIN_CHARITY_PCT} max={100} step={5} value={[pct]} onValueChange={(v) => setPct(v[0])} />
              <p className="text-xs text-muted-foreground">
                That&apos;s {formatCurrency(charityGiven)} to charity per {PLANS[plan].interval}.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Summary */}
      <aside>
        <Card className="sticky top-6 border-2">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-display text-lg font-semibold">Order summary</h3>
            <div className="space-y-2 text-sm">
              <Row label={`${PLANS[plan].name} plan`} value={`${formatCurrency(PLANS[plan].price)}/${PLANS[plan].interval}`} />
              <Row label="To charity" value={`${pct}% · ${formatCurrency(charityGiven)}`} />
            </div>
            <div className="border-t pt-3">
              <Row label="Total today" value={formatCurrency(PLANS[plan].price)} bold />
            </div>
            <Button
              onClick={pay}
              disabled={pending}
              size="lg"
              className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Pay with Razorpay
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" /> Secured · cancel anytime
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(bold ? "font-semibold" : "text-muted-foreground")}>{label}</span>
      <span className={cn("tabular-nums", bold && "font-display text-lg font-bold")}>{value}</span>
    </div>
  );
}
