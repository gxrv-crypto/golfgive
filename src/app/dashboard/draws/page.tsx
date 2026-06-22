import { Trophy, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LuckyNumbers } from "@/components/dashboard/lucky-numbers";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/services/profile-service";
import { listDraws } from "@/lib/services/draw-service";
import { formatPeriod, formatCurrency, currentPeriod } from "@/lib/format";
import { TIERS } from "@/lib/config";

export default async function DrawsPage() {
  const user = await requireUser();
  const [profile, draws] = await Promise.all([getProfile(user.id), listDraws()]);
  const published = draws.filter((d) => d.status === "published");
  const myNumbers = profile?.luckyNumbers ?? [];

  return (
    <div className="space-y-6">
      <LuckyNumbers initial={myNumbers} />

      <Card className="bg-gradient-to-br from-secondary/10 to-primary/10">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <CalendarClock className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Next draw · {formatPeriod(currentPeriod())}</p>
              <p className="text-sm text-muted-foreground">
                {myNumbers.length === 5
                  ? "You're entered with your lucky numbers."
                  : "Pick your numbers above to enter."}
              </p>
            </div>
          </div>
          <Badge variant={myNumbers.length === 5 ? "success" : "warning"}>
            {myNumbers.length === 5 ? "Entered" : "Not entered"}
          </Badge>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display text-lg font-semibold">Past results</h3>
        {published.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No draws published yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {published.map((draw) => {
              const matches = myNumbers.filter((n) => draw.winningNumbers.includes(n));
              const won = matches.length >= TIERS.three.match;
              return (
                <Card key={draw.id}>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base">{formatPeriod(draw.period)}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{draw.logic}</Badge>
                      <Badge variant="secondary">{formatCurrency(draw.poolTotal)} pool</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {draw.winningNumbers.map((n) => {
                        const hit = myNumbers.includes(n);
                        return (
                          <span
                            key={n}
                            className={cn(
                              "grid size-10 place-items-center rounded-full font-semibold tabular-nums",
                              hit
                                ? "bg-accent text-accent-foreground ring-2 ring-accent/40"
                                : "bg-muted text-foreground",
                            )}
                          >
                            {n}
                          </span>
                        );
                      })}
                    </div>
                    {myNumbers.length === 5 && (
                      <p
                        className={cn(
                          "mt-4 flex items-center gap-2 text-sm",
                          won ? "font-medium text-success" : "text-muted-foreground",
                        )}
                      >
                        {won && <Trophy className="size-4" />}
                        You matched {matches.length} number{matches.length === 1 ? "" : "s"}
                        {won ? ` — ${TIERS[matches.length >= 5 ? "five" : matches.length === 4 ? "four" : "three"].label} winner!` : "."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
