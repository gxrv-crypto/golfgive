import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function MarketingLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
      <Logo />
      <Loader2 className="size-8 animate-spin text-primary" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
