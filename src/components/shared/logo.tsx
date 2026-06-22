import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP } from "@/lib/config";
import { Heart } from "lucide-react";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-display", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Heart className="size-4 fill-current" />
      </span>
      <span className="text-lg font-bold tracking-tight">{APP.name}</span>
    </Link>
  );
}
