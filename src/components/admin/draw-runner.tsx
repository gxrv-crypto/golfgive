"use client";
import * as React from "react";
import { toast } from "sonner";
import { Loader2, Play, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TIERS } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import { simulateDrawAction, publishDrawAction } from "@/lib/actions/draw-actions";
import type { DrawResult, DrawLogic, DrawWeighting } from "@/types";

type DrawMode = "random" | "algorithmic-most" | "algorithmic-least";

export function DrawRunner({ defaultPeriod }: { defaultPeriod: string }) {
  const [period, setPeriod] = React.useState(defaultPeriod);
  const [mode, setMode] = React.useState<DrawMode>("random");
  const [result, setResult] = React.useState<DrawResult | null>(null);
  const [simulated, setSimulated] = React.useState(false);
  const [pending, start] = React.useTransition();

  function run(publish: boolean) {
    const logic: DrawLogic = mode === "random" ? "random" : "algorithmic";
    const weighting: DrawWeighting = mode === "algorithmic-least" ? "least" : "most";
    start(async () => {
      const action = publish ? publishDrawAction : simulateDrawAction;
      const res = await action(period, logic, weighting);
      if (!res.ok) { toast.error(res.error); return; }
      setResult(res.data ?? null);
      setSimulated(!publish);
      toast.success(publish ? "Draw published!" : "Simulation complete (not saved)");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run a draw</CardTitle>
          <CardDescription>
            Simulate to preview results without saving, or publish to make them official.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">Period (YYYY-MM)</Label>
              <Input id="period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-06" />
            </div>
            <div className="space-y-2">
              <Label>Draw logic</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as DrawMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random (lottery)</SelectItem>
                  <SelectItem value="algorithmic-most">Algorithmic — most frequent scores</SelectItem>
                  <SelectItem value="algorithmic-least">Algorithmic — least frequent scores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => run(false)} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              Simulate
            </Button>
            <Button onClick={() => run(true)} disabled={pending} className="rounded-full">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
              Publish results
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className={cn(simulated && "border-dashed")}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-secondary" />
              {simulated ? "Simulation preview" : "Published draw"}
            </CardTitle>
            <Badge variant={simulated ? "warning" : "success"}>
              {simulated ? "Not saved" : "Live"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Winning numbers</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.draw.winningNumbers.map((n) => (
                  <span key={n} className="grid size-11 place-items-center rounded-full bg-primary font-semibold tabular-nums text-primary-foreground">
                    {n}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Pool: <span className="font-semibold text-foreground">{formatCurrency(result.draw.poolTotal)}</span>
                {result.draw.jackpotCarry > 0 && (
                  <> · Jackpot rollover: <span className="font-semibold text-foreground">{formatCurrency(result.draw.jackpotCarry)}</span></>
                )}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Prize tiers</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">Pool</TableHead>
                    <TableHead className="text-right">Winners</TableHead>
                    <TableHead className="text-right">Per winner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.pools.map((p) => (
                    <TableRow key={p.tier}>
                      <TableCell>{TIERS[p.tier].label}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.sharePct}%</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.winnerCount}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.winnerCount > 0 ? formatCurrency(p.perWinner) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Winners ({result.winners.length})</p>
              {result.winners.length === 0 ? (
                <p className="text-sm text-muted-foreground">No winners this draw — jackpot rolls over.</p>
              ) : (
                <ul className="divide-y">
                  {result.winners.map((w, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span>{w.userName}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline">{TIERS[w.tier].label}</Badge>
                        <span className="font-medium tabular-nums">{formatCurrency(w.amount)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
