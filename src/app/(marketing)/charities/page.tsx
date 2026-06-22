import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CharityDirectory } from "@/components/marketing/charity-directory";
import { listCharities } from "@/lib/services/charity-service";

export const metadata: Metadata = { title: "Charities" };

export default async function CharitiesPage() {
  const charities = await listCharities();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 space-y-12">
      {/* Header section with background glow */}
      <div className="relative max-w-2xl space-y-3">
        <div className="absolute -top-12 -left-12 -z-10 size-60 rounded-full bg-primary/5 dark:bg-primary/10 blur-[90px]" />
        
        <Badge variant="secondary" className="px-3 py-1 gap-1">
          <HeartHandshake className="size-3 text-primary" /> Spotlight Causes
        </Badge>
        
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">
          Find a cause worth playing for
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Every GolfGive membership routes a percentage of the subscription fee directly to support vetted charities. Explore and select a cause to fund.
        </p>
      </div>

      <div className="border-t border-border/40 pt-10">
        <CharityDirectory charities={charities} />
      </div>
    </div>
  );
}
