import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Target, Landmark, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCharity, listCharities } from "@/lib/services/charity-service";
import { formatCurrency, formatDate } from "@/lib/format";
import { MIN_CHARITY_PCT } from "@/lib/config";

export async function generateStaticParams() {
  const charities = await listCharities();
  return charities.map((c) => ({ id: c.id }));
}

export default async function CharityProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const charity = await getCharity(id);
  if (!charity) notFound();

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link href="/charities" className="gap-2">
            <ArrowLeft className="size-4" /> Back to causes
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* LEFT COLUMN: Main details (7 cols) */}
        <div className="md:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="px-3 py-0.5 rounded-full border-primary/20 text-primary">
                {charity.category}
              </Badge>
              {charity.isFeatured && (
                <Badge variant="secondary" className="px-3 py-0.5 rounded-full">
                  Spotlight Cause
                </Badge>
              )}
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl text-foreground">
              {charity.name}
            </h1>
            
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              {charity.description}
            </p>
          </div>

          {/* Mission Card */}
          <Card className="border border-border/40 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl shadow-sm">
            <CardContent className="flex gap-4 p-6">
              <Target className="size-6 shrink-0 text-primary" />
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-foreground">Our mission</h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {charity.mission}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          {charity.events.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Upcoming events</h2>
              <div className="grid gap-4">
                {charity.events.map((e) => (
                  <Card key={e.id} className="border border-border/40 transition-all hover:bg-muted/30 rounded-xl">
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{e.title}</p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" /> {e.location}
                        </p>
                      </div>
                      <Badge variant="outline" className="px-3 py-1 rounded-full flex items-center gap-1.5 text-xs">
                        <CalendarDays className="size-3.5" /> {formatDate(e.date)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar (5 cols) */}
        <aside className="md:col-span-5 space-y-6 md:sticky md:top-20">
          {/* Card housing Image */}
          <div className="overflow-hidden rounded-3xl border border-border/40 shadow-md">
            <img
              src={charity.imageUrl}
              alt={charity.name}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>

          {/* Raised statistics card */}
          <Card className="border border-border/40 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
                <Landmark className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total contributions</p>
                <p className="font-display text-2xl font-black text-foreground">{formatCurrency(charity.raised)}</p>
              </div>
            </div>
            
            {/* Soft background visual progress track */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full w-[65%]" />
              </div>
              <p className="text-[11px] text-muted-foreground text-right">Raised by the GolfGive community</p>
            </div>
          </Card>

          {/* Support Campaign Card */}
          <Card className="relative overflow-hidden border border-border/50 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 p-6 rounded-2xl shadow-md space-y-6">
            <div className="absolute -right-8 -top-8 size-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <h2 className="font-display text-xl font-bold text-foreground">
                Support this cause
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                By subscribing to GolfGive, a minimum of {MIN_CHARITY_PCT}% of your fees are routed directly to this cause every month. You can also direct separate donations via your subscriber portal.
              </p>
            </div>
            
            <Button
              size="lg"
              className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:scale-102 transition-transform gap-1.5"
              asChild
            >
              <Link href={`/signup?charity=${charity.id}`}>
                Subscribe & Support <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </Card>
        </aside>
      </div>
    </article>
  );
}
