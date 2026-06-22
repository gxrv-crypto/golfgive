import type { Metadata } from "next";
import { CharityDirectory } from "@/components/marketing/charity-directory";
import { listCharities } from "@/lib/services/charity-service";

export const metadata: Metadata = { title: "Charities" };

export default async function CharitiesPage() {
  const charities = await listCharities();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Find a cause worth playing for
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every subscriber directs part of their fee to a charity. Explore the
          causes our community supports.
        </p>
      </div>
      <div className="mt-10">
        <CharityDirectory charities={charities} />
      </div>
    </div>
  );
}
