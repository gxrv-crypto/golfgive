"use client";
import * as React from "react";
import { Eye, Mail, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  subPlan: string | null;
  subStatus: string | null;
  renewsAt: string | null;
  charityName: string | null;
  charityPct: number;
  scoreCount: number;
  luckyNumbers: number[];
  payoutUpi: string | null;
  payoutAccountNumber: string | null;
  payoutIfsc: string | null;
  payoutAccountName: string | null;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function UsersDirectory({ users }: { users: AdminUserRow[] }) {
  const [selected, setSelected] = React.useState<AdminUserRow | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground">{users.length} accounts on the platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                {u.subStatus ? (
                  <Badge variant={u.subStatus === "active" ? "success" : "warning"}>
                    {u.subPlan} · {u.subStatus}
                  </Badge>
                ) : (
                  <Badge variant="outline">No subscription</Badge>
                )}
                <span className="text-xs text-muted-foreground">{u.scoreCount} scores</span>
              </div>

              <p className="text-sm text-muted-foreground">
                {u.charityName ? (
                  <>Supports <span className="font-medium text-foreground">{u.charityName}</span> ({u.charityPct}%)</>
                ) : (
                  "No charity selected"
                )}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-auto w-full"
                onClick={() => setSelected(u)}
              >
                <Eye className="size-4" /> View details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selected.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5">
                      <Mail className="size-3.5" /> {selected.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <Row label="Role">
                  <Badge variant={selected.role === "admin" ? "default" : "outline"}>{selected.role}</Badge>
                </Row>
                <Row label="Joined">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {formatDate(selected.createdAt)}
                  </span>
                </Row>
                <Separator />
                <Row label="Subscription">
                  {selected.subStatus ? (
                    <Badge variant={selected.subStatus === "active" ? "success" : "warning"}>
                      {selected.subPlan} · {selected.subStatus}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </Row>
                {selected.renewsAt && (
                  <Row label="Renews">{formatDate(selected.renewsAt)}</Row>
                )}
                <Row label="Charity">
                  {selected.charityName ? `${selected.charityName} (${selected.charityPct}%)` : "—"}
                </Row>
                <Separator />
                <Row label="Scores logged">{selected.scoreCount}</Row>
                <Row label="Lucky numbers">
                  {selected.luckyNumbers.length ? (
                    <span className="tabular-nums">{selected.luckyNumbers.join(" · ")}</span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </Row>
                <Separator />
                <div>
                  <p className="mb-1 font-medium">Payout details</p>
                  {selected.payoutUpi || selected.payoutAccountNumber ? (
                    <div className="space-y-0.5 text-muted-foreground">
                      {selected.payoutUpi && <p>UPI: {selected.payoutUpi}</p>}
                      {selected.payoutAccountNumber && (
                        <p>
                          A/C: {selected.payoutAccountNumber}
                          {selected.payoutIfsc ? ` · ${selected.payoutIfsc}` : ""}
                        </p>
                      )}
                      {selected.payoutAccountName && <p>Name: {selected.payoutAccountName}</p>}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
