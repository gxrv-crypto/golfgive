import Link from "next/link";
import { Users, TrendingUp, HeartHandshake, Dice5, Trophy, Clock, BadgeIndianRupee, Coins, Gift } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireRole } from "@/lib/auth/session";
import { getAdminStats } from "@/lib/services/report-service";
import { listWinners } from "@/lib/services/winner-service";
import { listDraws } from "@/lib/services/draw-service";
import { formatCurrency, formatPeriod } from "@/lib/format";

export default async function AdminOverview() {
  await requireRole("admin");
  const [stats, winners, draws] = await Promise.all([
    getAdminStats(),
    listWinners(),
    listDraws(),
  ]);
  const recentWinners = winners.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Admin overview</h2>
        <p className="text-muted-foreground">Platform health and key metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Active subscribers" value={stats.activeSubscribers} icon={TrendingUp} accent="success" />
        <StatCard label="Total prize pool" value={formatCurrency(stats.totalPrizePool)} icon={Dice5} accent="secondary" />
        <StatCard label="Charity raised" value={formatCurrency(stats.charityContributions)} icon={HeartHandshake} accent="accent" />
        <StatCard label="Draws published" value={stats.totalDraws} icon={Trophy} />
        <StatCard label="Pending winners" value={stats.pendingWinners} icon={Clock} accent="warning" />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <h3 className="font-display text-lg font-semibold">Draw statistics</h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total winners" value={stats.totalWinners} icon={Gift} accent="secondary" />
          <StatCard label="Total paid out" value={formatCurrency(stats.totalPaidOut)} icon={BadgeIndianRupee} accent="success" />
          <StatCard label="Pending payout" value={formatCurrency(stats.pendingPayout)} icon={Clock} accent="warning" />
          <StatCard label="Current jackpot" value={formatCurrency(stats.currentJackpot)} icon={Coins} accent="primary" hint={`Avg pool ${formatCurrency(stats.avgPoolPerDraw)}/draw`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent winners</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/winners">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentWinners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No winners yet.</p>
            ) : (
              <ul className="divide-y">
                {recentWinners.map((w) => (
                  <li key={w.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm">{w.userName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium tabular-nums">{formatCurrency(w.amount)}</span>
                      <Badge variant={w.status === "paid" ? "success" : w.status === "pending" ? "warning" : "accent"}>
                        {w.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Draws</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/draws">Run a draw</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {draws.length === 0 ? (
              <p className="text-sm text-muted-foreground">No draws yet.</p>
            ) : (
              <ul className="divide-y">
                {draws.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm">{formatPeriod(d.period)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(d.poolTotal)}
                      </span>
                      <Badge variant={d.status === "published" ? "success" : "outline"}>{d.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
