import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCharity, listCharities } from "@/lib/services/charity-service";
import { formatCurrency, formatDate } from "@/lib/format";

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
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/charities">
          <ArrowLeft className="size-4" /> All charities
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={charity.imageUrl}
          alt={charity.name}
          className="aspect-[21/9] w-full object-cover"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Badge variant="outline">{charity.category}</Badge>
        {charity.isFeatured && <Badge variant="secondary">Spotlight</Badge>}
        <span className="text-sm text-muted-foreground">
          {formatCurrency(charity.raised)} raised by the community
        </span>
      </div>

      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
        {charity.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {charity.description}
      </p>

      <Card className="mt-8 bg-muted/30">
        <CardContent className="flex gap-4 p-6">
          <Target className="size-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-display text-lg font-semibold">Our mission</h2>
            <p className="mt-1 text-muted-foreground">{charity.mission}</p>
          </div>
        </CardContent>
      </Card>

      {charity.events.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Upcoming events</h2>
          <div className="mt-4 space-y-3">
            {charity.events.map((e) => (
              <Card key={e.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" /> {e.location}
                    </p>
                  </div>
                  <Badge variant="outline">
                    <CalendarDays className="size-3" /> {formatDate(e.date)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card className="mt-10 border-2 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">
            Support {charity.name}
          </h2>
          <p className="max-w-md text-muted-foreground">
            Subscribe and choose this charity to send part of your fee here every
            month — or make a one-off donation from your dashboard.
          </p>
          <Button
            size="lg"
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link href={`/signup?charity=${charity.id}`}>Subscribe & support</Link>
          </Button>
        </CardContent>
      </Card>
    </article>
  );
}
