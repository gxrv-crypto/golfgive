"use client";
import * as React from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { SCORE } from "@/lib/config";
import { formatDate } from "@/lib/format";
import {
  addScoreAction,
  editScoreAction,
  deleteScoreAction,
} from "@/lib/actions/score-actions";
import type { Score } from "@/types";

export function ScoreManager({ scores }: { scores: Score[] }) {
  const [pending, start] = React.useTransition();
  const [editing, setEditing] = React.useState<Score | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const today = new Date().toISOString().slice(0, 10);

  function submitNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      value: Number(fd.get("value")),
      playedOn: String(fd.get("playedOn")),
    };
    start(async () => {
      const res = await addScoreAction(input);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Score added");
      setAddOpen(false);
    });
  }

  function submitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    const input = {
      value: Number(fd.get("value")),
      playedOn: String(fd.get("playedOn")),
    };
    start(async () => {
      const res = await editScoreAction(editing.id, input);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Score updated");
      setEditing(null);
    });
  }

  function remove(id: string) {
    start(async () => {
      const res = await deleteScoreAction(id);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Score removed");
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Your last 5 scores</CardTitle>
          <CardDescription>
            Stableford {SCORE.min}–{SCORE.max}. One per date · oldest auto-drops past 5.
          </CardDescription>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="size-4" /> Add score
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a score</DialogTitle>
              <DialogDescription>Enter your Stableford points for a round.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submitNew} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playedOn">Date played</Label>
                <Input id="playedOn" name="playedOn" type="date" max={today} defaultValue={today} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Score ({SCORE.min}–{SCORE.max})</Label>
                <Input id="value" name="value" type="number" min={SCORE.min} max={SCORE.max} required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {scores.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scores yet. Add your first round above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{formatDate(s.playedOn)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{s.value}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(s)} aria-label="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => remove(s.id)}
                        aria-label="Delete"
                        disabled={pending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit score</DialogTitle>
            <DialogDescription>Update the date or points for this round.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date played</Label>
                <Input id="edit-date" name="playedOn" type="date" max={today} defaultValue={editing.playedOn} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Score ({SCORE.min}–{SCORE.max})</Label>
                <Input id="edit-value" name="value" type="number" min={SCORE.min} max={SCORE.max} defaultValue={editing.value} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />} Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
