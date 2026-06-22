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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 -z-10 size-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <Reveal>
            <Badge variant="accent" className="mb-5">
              <Sparkles className="size-3" /> Play golf. Change lives.
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Every score you log{" "}
              <span className="text-primary">gives back.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Track your Stableford scores, enter monthly prize draws, and send at
              least {MIN_CHARITY_PCT}% of your subscription to a charity you love.
              Golf has never meant this much.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 rounded-full bg-accent px-7 text-base text-accent-foreground shadow-md transition-all hover:bg-accent/90 hover:shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Subscribe & Make Impact <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full px-6" asChild>
                <Link href="/how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatCurrency(raised)}
              </span>{" "}
              raised for charity by our community so far.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <Card className="overflow-hidden border-2 bg-gradient-to-br from-secondary/10 to-primary/10 p-8">
              <p className="text-sm font-medium text-muted-foreground">
                This month&apos;s jackpot
              </p>
              <p className="mt-1 font-display text-5xl font-bold tracking-tight">
                {formatCurrency(jackpot)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                5-Match jackpot · rolls over if unclaimed
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {Object.values(TIERS).map((t) => (
                  <div key={t.tier} className="rounded-lg border bg-background/60 p-3 text-center">
                    <p className="font-display text-xl font-bold">{t.sharePct}%</p>
                    <p className="text-xs text-muted-foreground">{t.match}-match</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-success" /> Razorpay secured ·
                Cancel anytime
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* WHAT YOU DO / HOW YOU WIN */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Three simple steps to play
          </h2>
          <p className="mt-3 text-muted-foreground">
            No clubhouse politics. No plaid. Just golf with a heart.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
              <Card className="h-full p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CHARITY IMPACT */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge variant="secondary" className="mb-3">
                <Trophy className="size-3" /> Spotlight charities
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Where your impact goes
              </h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Choose from vetted charities making real change. Switch anytime.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/charities">
                Browse all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary to-secondary p-10 text-center text-primary-foreground md:p-16">
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Ready to play with purpose?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base opacity-90 md:text-lg">
              Join a community of golfers turning every round into real-world good.
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 rounded-full bg-accent px-8 text-base text-accent-foreground shadow-lg hover:bg-accent/90"
              asChild
            >
              <Link href="/signup">
                Start your subscription <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
