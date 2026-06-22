"use client";
import * as React from "react";
import { Search, Filter, FilterIcon } from "lucide-react";
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
      {/* Search and Filter container — sticky top-16 on both mobile and desktop */}
      <div className="flex flex-row items-center gap-2 sticky top-16 z-20 bg-background/95 py-3 px-4 -mx-4 border-b border-border/45 backdrop-blur-md sm:top-16 sm:mx-0 sm:px-0 sm:gap-3 sm:py-4 transition-all duration-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search charities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-background/50 focus:bg-background"
          />
        </div>
        
        <Select value={category} onValueChange={setCategory}>
          {/* Custom SelectTrigger: shows Filter icon on mobile, Category selector on desktop */}
          <SelectTrigger className="w-10 px-0 shrink-0 justify-center bg-background/50 hover:bg-background [&_svg:last-child]:hidden sm:[&_svg:last-child]:block sm:w-56 sm:px-3 sm:justify-between [&>span]:hidden sm:[&>span]:inline-block transition-all">
            <SelectValue placeholder="Category" />
            <FilterIcon className="sm:hidden size-5 text-muted-foreground shrink-0" />
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
