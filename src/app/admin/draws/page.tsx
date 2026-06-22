import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DrawRunner } from "@/components/admin/draw-runner";
import { requireRole } from "@/lib/auth/session";
import { listDraws } from "@/lib/services/draw-service";
import { formatCurrency, formatPeriod, currentPeriod } from "@/lib/format";

export default async function AdminDrawsPage() {
  await requireRole("admin");
  const draws = await listDraws();

  return (
    <div className="space-y-6">
      <DrawRunner defaultPeriod={currentPeriod()} />

      <Card>
        <CardHeader>
          <CardTitle>Draw history</CardTitle>
        </CardHeader>
        <CardContent>
          {draws.length === 0 ? (
            <p className="text-sm text-muted-foreground">No draws published yet.</p>
          ) : (
            <ul className="divide-y">
              {draws.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{formatPeriod(d.period)}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.winningNumbers.join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{d.logic}</Badge>
                    <span className="text-sm tabular-nums">{formatCurrency(d.poolTotal)}</span>
                    <Badge variant={d.status === "published" ? "success" : "outline"}>{d.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
