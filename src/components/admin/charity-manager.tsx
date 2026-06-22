"use client";
import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createCharityAction,
  updateCharityAction,
  deleteCharityAction,
} from "@/lib/actions/charity-actions";
import { formatCurrency } from "@/lib/format";
import type { Charity } from "@/types";

type Editing = Charity | "new" | null;

export function CharityManager({ charities }: { charities: Charity[] }) {
  const [editing, setEditing] = React.useState<Editing>(null);
  const [pending, start] = React.useTransition();

  function remove(id: string) {
    start(async () => {
      const res = await deleteCharityAction(id);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Charity deleted");
    });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name")),
      category: String(fd.get("category")),
      description: String(fd.get("description")),
      mission: String(fd.get("mission")),
      imageUrl: String(fd.get("imageUrl")),
      isFeatured: fd.get("isFeatured") === "on",
    };
    start(async () => {
      const res =
        editing === "new"
          ? await createCharityAction(input)
          : await updateCharityAction((editing as Charity).id, input);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(editing === "new" ? "Charity created" : "Charity updated");
      setEditing(null);
    });
  }

  const current = editing && editing !== "new" ? editing : null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Charities</CardTitle>
        <Button size="sm" className="rounded-full" onClick={() => setEditing("new")}>
          <Plus className="size-4" /> Add charity
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Raised</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charities.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.isFeatured && (
                      <Badge variant="secondary"><Star className="size-3" /> Spotlight</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(c.raised)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditing(c)} aria-label="Edit">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => remove(c.id)} disabled={pending} aria-label="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add charity" : "Edit charity"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={current?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={current?.category} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" type="url" defaultValue={current?.imageUrl} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={current?.description} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mission">Mission</Label>
                <Textarea id="mission" name="mission" defaultValue={current?.mission} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" defaultChecked={current?.isFeatured} className="size-4" />
                Feature on homepage (spotlight)
              </label>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
