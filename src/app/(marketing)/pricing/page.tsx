import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { MIN_CHARITY_PCT, PRIZE_POOL_CONTRIBUTION_PCT } from "@/lib/config";

export const metadata: Metadata = { title: "Pricing Plans" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:py-24 space-y-12">
      {/* Centered header with backing glow */}
      <div className="relative mx-auto max-w-2xl text-center space-y-4">
        <div className="absolute top-1/2 left-1/2 -z-10 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 dark:bg-accent/10 blur-[90px]" />
        
        <Badge variant="secondary" className="px-3 py-1 gap-1 inline-flex">
          <Sparkles className="size-3 text-primary animate-pulse" /> Membership Options
        </Badge>

        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-foreground">
          One simple subscription
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Every membership includes score tracking, prize drawing entries, and direct charity donations. {Math.round(PRIZE_POOL_CONTRIBUTION_PCT * 100)}% of fees fund the drawing pools, with a minimum of {MIN_CHARITY_PCT}% routed to your chosen cause.
        </p>
      </div>

      <div className="pt-4 flex justify-center">
        <PricingCards />
      </div>
    </div>
  );
}
