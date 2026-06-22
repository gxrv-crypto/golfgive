import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Dice5,
  HeartHandshake,
  Trophy,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/reveal";
import { CharityCard } from "@/components/marketing/charity-card";
import { featuredCharities, totalCharityContributions } from "@/lib/services/charity-service";
import { getLatestPublishedDraw } from "@/lib/services/draw-service";
import { formatCurrency } from "@/lib/format";
import { MIN_CHARITY_PCT, TIERS } from "@/lib/config";

import { HeroSlider } from "@/components/marketing/hero-slider";

export default async function HomePage() {
  const [charities, raised, draw] = await Promise.all([
    featuredCharities(),
    totalCharityContributions(),
    getLatestPublishedDraw(),
  ]);
  const jackpot = draw ? draw.poolTotal * (TIERS.five.sharePct / 100) + draw.jackpotCarry : 240_000;

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-12 md:py-0">
        <HeroSlider images={["/hero/1.png", "/hero/2.png", "/hero/3.png"]} />

        <div className="mx-auto grid max-w-6xl w-full items-center gap-12 px-4 md:grid-cols-12 relative z-10">
          <div className="md:col-span-7">
            <Reveal>
              <div className="space-y-6">
                <Badge variant="accent" className="bg-accent/10 dark:bg-accent/25 text-accent border border-accent/20 dark:border-accent/30 backdrop-blur-md px-3 py-1 text-xs">
                  <Sparkles className="size-3.5 mr-1" /> Play golf. Change lives.
                </Badge>
                
                <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground dark:text-white md:text-5xl lg:text-6xl drop-shadow-sm">
                  Every score you log <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">gives back.</span>
                </h1>
                
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground dark:text-zinc-300 md:text-lg">
                  Track your Stableford scores, enter monthly prize draws, and send at
                  least {MIN_CHARITY_PCT}% of your subscription to a charity you love.
                  Golf has never meant this much.
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-accent px-8 text-base text-accent-foreground shadow-md transition-all hover:bg-accent/90 hover:scale-102 hover:shadow-lg"
                    asChild
                  >
                    <Link href="/signup">
                      Subscribe & Make Impact <ArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 rounded-full px-6 border-border dark:border-white/20 text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10 hover:border-border dark:hover:border-white/40 bg-background/50 dark:bg-white/5 backdrop-blur-sm transition-all" 
                    asChild
                  >
                    <Link href="/how-it-works">See how it works</Link>
                  </Button>
                </div>
                
                <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground dark:text-zinc-400">
                  <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
                  <span>
                    <strong className="text-foreground dark:text-white font-semibold">
                      {formatCurrency(raised)}
                    </strong>{" "}
                    raised for charity by our community so far.
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal delay={0.15}>
              <div className="relative group">
                {/* Glowing decorative ambient light behind the card */}
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-15 dark:opacity-30 blur-xl group-hover:opacity-25 dark:group-hover:opacity-40 transition duration-1000" />
                
                <Card className="relative overflow-hidden border border-border/40 dark:border-white/10 bg-background/70 dark:bg-zinc-950/70 p-6 md:p-8 backdrop-blur-xl shadow-2xl rounded-3xl text-foreground dark:text-white">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-zinc-400">
                        This month&apos;s jackpot
                      </p>
                      <p className="mt-2 font-display text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent md:text-5xl">
                        {formatCurrency(jackpot)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground dark:text-zinc-400">
                        5-Match jackpot · rolls over if unclaimed
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {Object.values(TIERS).map((t) => (
                        <div key={t.tier} className="rounded-2xl border border-border/45 dark:border-white/5 bg-background/45 dark:bg-white/[0.03] p-3 text-center transition-all hover:bg-background/80 dark:hover:bg-white/[0.06] hover:border-border/80 dark:hover:border-white/10">
                          <p className="font-display text-lg font-bold text-foreground dark:text-white">{t.sharePct}%</p>
                          <p className="text-[10px] text-muted-foreground dark:text-zinc-400 font-medium">{t.match}-match</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/40 dark:border-white/5 text-xs text-muted-foreground dark:text-zinc-400">
                      <ShieldCheck className="size-4 text-success" />
                      <span>Razorpay secured · Cancel anytime</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHAT YOU DO / HOW YOU WIN */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24 space-y-12">
        <Reveal className="mx-auto max-w-2xl text-center space-y-2">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
            Three simple steps to play
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            No clubhouse politics. No plaid. Just golf with a heart.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Log your scores",
              body: "Enter your last 5 rounds in Stableford format. We keep them rolling, automatically.",
            },
            {
              icon: Dice5,
              title: "Enter the draw",
              body: "Your lucky numbers go into every monthly draw. Match 3, 4 or 5 to win the pool.",
            },
            {
              icon: HeartHandshake,
              title: "Fund a cause",
              body: `A minimum of ${MIN_CHARITY_PCT}% of your subscription goes to a charity you choose.`,
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <Card className="h-full border border-border/40 bg-background/50 dark:bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CHARITY IMPACT */}
      <section className="bg-muted/30 dark:bg-zinc-950/20 py-16 md:py-24 border-y border-border/40">
        <div className="mx-auto max-w-6xl px-4 space-y-10">
          <Reveal className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <Badge variant="secondary" className="px-3 py-1 rounded-full gap-1">
                <Trophy className="size-3 text-primary animate-pulse" /> Spotlight charities
              </Badge>
              <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                Where your impact goes
              </h2>
              <p className="max-w-lg text-sm md:text-base text-muted-foreground leading-relaxed">
                Choose from vetted charities making real change. Switch anytime.
              </p>
            </div>
            <Button variant="outline" className="rounded-full bg-background/50 border-border/40 hover:bg-muted" asChild>
              <Link href="/charities">
                Browse all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {charities.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08}>
                <CharityCard charity={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="relative group">
            {/* Glowing background blur effect */}
            <div className="absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-r from-primary to-secondary opacity-30 blur-2xl group-hover:opacity-40 transition duration-700 pointer-events-none" />
            
            <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary to-secondary p-10 text-center text-primary-foreground md:p-16 rounded-[2.5rem] shadow-2xl">
              <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-4 max-w-xl mx-auto">
                <h2 className="font-display text-3xl font-black tracking-tight md:text-5xl">
                  Ready to play with purpose?
                </h2>
                <p className="text-sm md:text-base opacity-90 leading-relaxed">
                  Join a community of golfers turning every round into real-world good.
                </p>
                <div className="pt-4">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-accent px-8 text-base text-accent-foreground shadow-lg hover:bg-accent/90 transition-all hover:scale-103"
                    asChild
                  >
                    <Link href="/signup">
                      Start your subscription <ArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Reveal>
      </section>
    </>
  );
}
