import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Dice5,
  HeartHandshake,
  Trophy,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { TIERS, MIN_CHARITY_PCT, SCORE, DRAW } from "@/lib/config";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Reveal className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          How GolfGive works
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          A subscription that turns your golf game into monthly prizes and
          real charitable impact.
        </p>
      </Reveal>

      <div className="mt-14 space-y-6">
        {[
          {
            icon: ClipboardList,
            title: "1 · Track your scores",
            body: `Log your last ${SCORE.keepLast} rounds in Stableford format (${SCORE.min}–${SCORE.max} points). We keep a rolling window — a new entry replaces the oldest, one per date.`,
          },
          {
            icon: Dice5,
            title: "2 · Pick your lucky numbers",
            body: `Choose ${DRAW.pick} numbers between ${DRAW.min} and ${DRAW.max}. They're automatically entered into every monthly draw while your subscription is active.`,
          },
          {
            icon: Trophy,
            title: "3 · Win the monthly draw",
            body: `Each month we draw ${DRAW.pick} winning numbers. Match 3, 4 or 5 to share the prize pool. Pools split equally among winners in each tier.`,
          },
          {
            icon: HeartHandshake,
            title: "4 · Give back",
            body: `At least ${MIN_CHARITY_PCT}% of your subscription goes to a charity you choose — and you can give more, or donate independently, anytime.`,
          },
        ].map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <Card>
              <CardContent className="flex gap-5 p-6">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{s.title}</h2>
                  <p className="mt-2 text-muted-foreground">{s.body}</p>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <h2 className="font-display text-2xl font-semibold">Prize pool breakdown</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {Object.values(TIERS).map((t) => (
            <Card key={t.tier} className="text-center">
              <CardContent className="p-6">
                <p className="font-display text-4xl font-bold text-primary">
                  {t.sharePct}%
                </p>
                <p className="mt-2 font-semibold">{t.label}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  {t.rollover ? (
                    <>
                      <RefreshCw className="size-3" /> Jackpot · rolls over
                    </>
                  ) : (
                    "Paid out monthly"
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-14 flex flex-col items-center gap-4 rounded-2xl border-2 bg-muted/30 p-10 text-center">
        <ShieldCheck className="size-8 text-success" />
        <h2 className="font-display text-2xl font-semibold">Secure & transparent</h2>
        <p className="max-w-md text-muted-foreground">
          Payments are handled by Razorpay with server-side signature
          verification. Cancel your subscription anytime.
        </p>
        <Button
          size="lg"
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          asChild
        >
          <Link href="/signup">Get started</Link>
        </Button>
      </Reveal>
    </div>
  );
}
