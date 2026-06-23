import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/smart-image";
import { formatCurrency } from "@/lib/format";
import type { Charity } from "@/types";

export function CharityCard({ charity }: { charity: Charity }) {
  return (
    <Link href={`/charities/${charity.id}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden border border-border/40 bg-background/50 dark:bg-zinc-950/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <SmartImage
            src={charity.imageUrl}
            alt={charity.name}
            className="absolute inset-0"
            imageClassName="transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {charity.isFeatured && (
            <Badge variant="secondary" className="absolute left-3.5 top-3.5 z-20 bg-primary text-primary-foreground border-none shadow-sm rounded-full px-3 text-[10px] uppercase tracking-wider font-bold">
              Spotlight
            </Badge>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-1 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="px-2.5 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              {charity.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Landmark className="size-3.5 text-success" />
              <span>{formatCurrency(charity.raised)} raised</span>
            </div>
          </div>
          
          <div className="space-y-1.5 flex-1">
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200">
              {charity.name}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {charity.description}
            </p>
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center text-xs font-semibold text-primary group-hover:gap-1.5 transition-all duration-200 gap-1">
            <span>Learn about our mission</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
