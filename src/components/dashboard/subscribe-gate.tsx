import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Restricted-access placeholder shown to non-active subscribers (PRD §04).
 */
export function SubscribeGate({ feature }: { feature: string }) {
  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-warning/15 text-warning">
          <Lock className="size-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Subscription required</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {feature} is available to active subscribers only. Subscribe to unlock
            it and join this month&apos;s draw.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/subscribe">Subscribe now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
