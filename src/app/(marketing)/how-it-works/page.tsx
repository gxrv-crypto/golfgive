import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Dice5,
  HeartHandshake,
  Trophy,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { TIERS, MIN_CHARITY_PCT, SCORE, DRAW } from "@/lib/config";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: ClipboardList,
      title: "Track your scores",
      body: `Log your last ${SCORE.keepLast} Stableford rounds (between ${SCORE.min} and ${SCORE.max} points). We maintain a rolling index—new scores automatically update and replace your oldest round so your data stays current, one entry per date.`,
      image: "/how-it-works/1.png",
    },
    {
      num: "02",
      icon: Dice5,
      title: "Pick your lucky numbers",
      body: `Select ${DRAW.pick} personal lucky numbers between ${DRAW.min} and ${DRAW.max}. These choices represent your entry token and are automatically submitted to the drawings every month your account remains active.`,
      image: "/how-it-works/2.png",
    },
    {
      num: "03",
      icon: Trophy,
      title: "Win the monthly draw",
      body: `A random drawing of ${DRAW.pick} numbers takes place each month. Match 3, 4, or 5 numbers to secure a payout from that month's subscription pool. Payouts are distributed equally to all matching winners.`,
      image: "/how-it-works/3.png",
    },
    {
      num: "04",
      icon: HeartHandshake,
      title: "Support charity causes",
      body: `A minimum of ${MIN_CHARITY_PCT}% of your recurring membership is forwarded directly to a vetted charity of your choice. You have full controls to voluntary increase your percentage or toggle charities.`,
      image: "/how-it-works/4.png",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 space-y-24">
      {/* HEADER SECTION */}
      <Reveal className="text-center relative max-w-2xl mx-auto space-y-4">
        {/* Glow backdrop behind header */}
        <div className="absolute top-1/2 left-1/2 -z-10 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 dark:bg-primary/10 blur-[80px]" />
        
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-foreground">
          How <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">GolfGive</span> Works
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          A seamless monthly subscription model linking your golf score entry with exciting cash drawings and impactful charitable donations.
        </p>
      </Reveal>

      {/* STEP ALTERNATING GRID */}
      <div className="space-y-16 md:space-y-28">
        {steps.map((s, i) => {
          const isEven = i % 2 === 0;
          return (
            <Reveal key={s.num} delay={i * 0.08}>
              <div className={`grid md:grid-cols-12 gap-8 md:gap-16 items-center`}>
                {/* Image half */}
                <div className={`md:col-span-6 ${isEven ? "md:order-1" : "md:order-2"}`}>
                  <div className="relative group overflow-hidden rounded-3xl border border-border/40 bg-muted/40 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl dark:border-white/5">
                    <img 
                      src={s.image} 
                      alt={s.title} 
                      className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Text half */}
                <div className={`md:col-span-6 space-y-4 ${isEven ? "md:order-2" : "md:order-1"}`}>
                  <div className="relative">
                    <span className="font-display text-7xl md:text-8xl font-black text-primary/10 dark:text-primary/20 select-none tracking-tighter absolute -top-8 -left-4 -z-10">
                      {s.num}
                    </span>
                    <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                      <s.icon className="size-5" />
                    </div>
                  </div>
                  
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {s.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* PRIZE POOL BREAKDOWN */}
      <Reveal className="space-y-8 pt-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Prize pool breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            Pool allocations are automatically calculated based on the active membership pool.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {Object.values(TIERS).map((t) => (
            <Card key={t.tier} className="relative overflow-hidden border border-border/40 bg-background/50 dark:bg-zinc-950/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-lg rounded-2xl">
              <CardContent className="p-6 md:p-8 text-center space-y-3">
                <p className="font-display text-5xl font-extrabold text-primary">
                  {t.sharePct}%
                </p>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">{t.label}</p>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    {t.rollover ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin-slow text-accent" /> Jackpot · rolls over
                      </>
                    ) : (
                      "Paid out monthly"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      {/* FOOTER CTA */}
      <Reveal className="pt-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 dark:border-white/5 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-8 md:p-12 text-center space-y-6">
          {/* Subtle glowing blurs inside CTA card */}
          <div className="absolute -top-12 -left-12 size-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 size-40 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <ShieldCheck className="size-8" />
          </div>
          
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Secure & Transparent
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              All subscription and draw payouts are routed through Razorpay with robust server-side signature verification. You have complete freedom to cancel at any time.
            </p>
          </div>

          <Button
            size="lg"
            className="rounded-full bg-accent px-8 text-base text-accent-foreground shadow-md hover:bg-accent/90 transition-all hover:scale-102"
            asChild
          >
            <Link href="/signup">
              Get Started Now <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
