import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <p className="font-display text-6xl font-bold text-primary">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          That page took a swing and missed. Let&apos;s get you back on the fairway.
        </p>
      </div>
      <Button asChild className="rounded-full">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
