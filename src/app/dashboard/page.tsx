import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  Dice5,
  Trophy,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/services/profile-service";
import { getSubscription, isActive } from "@/lib/services/subscription-service";
import { listScores } from "@/lib/services/score-service";
import { listUserWinnings } from "@/lib/services/winner-service";
import { getCharity } from "@/lib/services/charity-service";
import { getLatestPublishedDraw } from "@/lib/services/draw-service";
import { formatCurrency, formatDate } from "@/lib/format";
import { PLANS } from "@/lib/config";

export default async function DashboardOverview() {
  const user = await requireUser();
  const [profile, sub, active, scores, winnings, draw] = await Promise.all([
    getProfile(user.id),
    getSubscription(user.id),
    isActive(user.id),
    listScores(user.id),
    listUserWinnings(user.id),
    getLatestPublishedDraw(),
  ]);
  const charity = profile?.charityId ? await getCharity(profile.charityId) : null;
  const totalWon = winnings.reduce((s, w) => s + w.amount, 0);
  const pendingPayouts = winnings.filter((w) => w.status !== "paid").length;

  return (
    <div className={cn("space-y-6", draw && "max-md:pb-36")}>
      <div>
        <h2 className="font-display text-2xl font-bold">Hi {user.name.split(" ")[0]} 👋</h2>
        <p className="text-muted-foreground">Here&apos;s your impact at a glance.</p>
      </div>

      {!active && (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-warning" />
              <div>
                <p className="font-semibold">Your subscription is inactive</p>
                <p className="text-sm text-muted-foreground">
                  Subscribe to enter draws and support your charity.
                </p>
              </div>
            </div>
            <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/subscribe">Subscribe now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Subscription"
          value={active ? "Active" : "Inactive"}
          icon={CalendarCheck}
          accent={active ? "success" : "warning"}
          hint={
            sub?.currentPeriodEnd
              ? `${PLANS[sub.plan].name} · renews ${formatDate(sub.currentPeriodEnd)}`
              : "No active plan"
          }
        />
        <StatCard
          label="Scores logged"
          value={`${scores.length}/5`}
          icon={ClipboardList}
          hint={scores[0] ? `Latest: ${scores[0].value} pts` : "No scores yet"}
        />
        <StatCard
          label="Lucky numbers"
          value={profile?.luckyNumbers.length ? profile.luckyNumbers.join(" ") : "—"}
          icon={Dice5}
          accent="accent"
          hint={profile?.luckyNumbers.length ? "Entered in every draw" : "Pick your numbers"}
        />
        <StatCard
          label="Total won"
          value={formatCurrency(totalWon)}
          icon={Trophy}
          accent="secondary"
          hint={pendingPayouts ? `${pendingPayouts} pending payout(s)` : "All settled"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent scores</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/scores">
                Manage <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scores yet. Add your first round to get started.
              </p>
            ) : (
              <ul className="divide-y">
                {scores.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted-foreground">{formatDate(s.playedOn)}</span>
                    <span className="font-semibold tabular-nums">{s.value} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="size-4 text-primary" /> Your charity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {charity ? (
              <div>
                <p className="font-semibold">{charity.name}</p>
                <Badge variant="outline" className="mt-1">{charity.category}</Badge>
                <p className="mt-3 text-sm text-muted-foreground">
                  You contribute{" "}
                  <span className="font-semibold text-foreground">
                    {profile?.charityPct}%
                  </span>{" "}
                  of your subscription.
                </p>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href="/dashboard/charity">Change charity</Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">No charity selected yet.</p>
                <Button size="sm" className="mt-3 w-full" asChild>
                  <Link href="/dashboard/charity">Choose a charity</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {draw && (
        <div
          className={cn(
            // Mobile: pinned to the bottom with breathing room. Desktop: inline.
            "fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
            "md:static md:inset-x-auto md:bottom-auto md:z-auto md:p-0",
          )}
        >
          <div className="relative mx-auto max-w-6xl">
         
            <Card className="relative overflow-hidden border-primary/40 bg-card ">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/15 to-primary/15"
              />
              <CardContent className="relative flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Latest draw result</p>
                  <div className="mt-2 flex gap-2">
                    {draw.winningNumbers.map((n) => (
                      <span
                        key={n}
                        className="grid size-9 place-items-center rounded-full bg-primary font-semibold tabular-nums text-primary-foreground shadow-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <Button  className=" bg-primary rounded-full" asChild>
                  <Link href="/dashboard/draws">View draws</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
