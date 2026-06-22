import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Charity } from "@/types";

export function CharityCard({ charity }: { charity: Charity }) {
  return (
    <Link href={`/charities/${charity.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={charity.imageUrl}
            alt={charity.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {charity.isFeatured && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              Spotlight
            </Badge>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline">{charity.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(charity.raised)} raised
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{charity.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {charity.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
