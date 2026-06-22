import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { MIN_CHARITY_PCT, PRIZE_POOL_CONTRIBUTION_PCT } from "@/lib/config";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          One simple subscription
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every plan includes score tracking, monthly draw entry, and charitable
          giving. {Math.round(PRIZE_POOL_CONTRIBUTION_PCT * 100)}% of fees fund the
          prize pool; at least {MIN_CHARITY_PCT}% goes to your chosen charity.
        </p>
      </div>
      <div className="mt-12">
        <PricingCards />
      </div>
    </div>
  );
}
