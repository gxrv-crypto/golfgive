"use client";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/config";
import { formatCurrency } from "@/lib/format";

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-4 items-stretch">
      {(["monthly", "yearly"] as PlanId[]).map((id) => {
        const plan = PLANS[id];
        const isYearly = id === "yearly";

        return (
          <div key={id} className="relative flex flex-col group h-full">
            {/* Ambient backing glow only for Yearly recommended plan */}
            {isYearly && (
              <div className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />
            )}

            <Card
              className={`relative flex flex-col h-full overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                isYearly
                  ? "border-primary/50 dark:border-primary/60 bg-background shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                  : "border-border/60 bg-background/50 backdrop-blur-sm shadow-md hover:border-border hover:shadow-lg hover:scale-[1.01]"
              }`}
            >
              {/* Highlight badge for Yearly */}
              {isYearly && (
                <div className="absolute top-0 right-0 bg-primary px-4 py-1.5 rounded-bl-2xl text-[10px] uppercase tracking-wider font-extrabold text-primary-foreground flex items-center gap-1 shadow-sm">
                  <Sparkles className="size-3" /> Recommended
                </div>
              )}

              <CardContent className="flex flex-col flex-1 p-8 md:p-10 space-y-6">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {plan.name} Plan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isYearly
                      ? "Best value for long-term impact & drawing entries"
                      : "Flexible entry with standard drawing access"}
                  </p>
                </div>

                {/* Pricing info */}
                <div className="space-y-1 py-2">
                  <div className="flex items-end gap-1.5">
                    <span className="font-display text-5xl font-black tracking-tight text-foreground">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground pb-2">
                      /{plan.interval}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Billed annually (effectively{" "}
                        <strong className="text-foreground">
                          {formatCurrency(plan.perMonth)}
                        </strong>
                        /month)
                      </p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15 border border-primary/25 text-[10px] px-2 py-0.5 rounded-full">
                        Save 20%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="h-px bg-border/40" />

                {/* Features List */}
                <ul className="space-y-3.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className="size-4 shrink-0 text-success mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <Button
                  size="lg"
                  className={`w-full rounded-full h-12 text-base font-semibold shadow-md transition-all ${
                    isYearly
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
                      : "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg"
                  }`}
                  asChild
                >
                  <Link href={`/signup?plan=${id}`}>
                    Get Started with {plan.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
