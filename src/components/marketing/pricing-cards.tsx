"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/config";
import { formatCurrency } from "@/lib/format";

export function PricingCards() {
  return (
    <Tabs defaultValue="yearly" className="flex flex-col items-center">
      <TabsList>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">
          Yearly <Badge variant="secondary" className="ml-1">Save 20%</Badge>
        </TabsTrigger>
      </TabsList>

      {(["monthly", "yearly"] as PlanId[]).map((id) => {
        const plan = PLANS[id];
        return (
          <TabsContent key={id} value={id} className="w-full max-w-md">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  {plan.highlight && (
                    <Badge variant="secondary">{plan.highlight}</Badge>
                  )}
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-5xl font-bold tracking-tight">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="mb-1.5 text-muted-foreground">
                    /{plan.interval}
                  </span>
                </div>
                {plan.interval === "year" && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Just {formatCurrency(plan.perMonth)}/month, billed yearly
                  </p>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className="mt-8 w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                  asChild
                >
                  <Link href={`/signup?plan=${id}`}>Choose {plan.name}</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
