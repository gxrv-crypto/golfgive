"use client";
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharityCard } from "@/components/marketing/charity-card";
import type { Charity } from "@/types";

export function CharityDirectory({ charities }: { charities: Charity[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const categories = React.useMemo(
    () => ["all", ...new Set(charities.map((c) => c.category))],
    [charities],
  );

  const filtered = charities.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === "all" || c.category === category;
    return matchesQuery && matchesCat;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search charities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No charities match your search.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CharityCard key={c.id} charity={c} />
          ))}
        </div>
      )}
    </div>
  );
}
