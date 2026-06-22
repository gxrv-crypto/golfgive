"use client";
import * as React from "react";
import { toast } from "sonner";
import { Loader2, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setPayoutDetailsAction } from "@/lib/actions/profile-actions";
import type { PayoutDetails } from "@/types";

export function PayoutDetailsForm({ details }: { details: PayoutDetails }) {
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      payoutUpi: String(fd.get("payoutUpi") ?? ""),
      payoutAccountName: String(fd.get("payoutAccountName") ?? ""),
      payoutAccountNumber: String(fd.get("payoutAccountNumber") ?? ""),
      payoutIfsc: String(fd.get("payoutIfsc") ?? ""),
    };
    start(async () => {
      const res = await setPayoutDetailsAction(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Payout details saved");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="size-4 text-primary" /> Payout details
        </CardTitle>
        <CardDescription>
          Where we send your winnings. Add a UPI ID, a bank account, or both — the
          admin pays out to these.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutUpi">UPI ID</Label>
            <Input
              id="payoutUpi"
              name="payoutUpi"
              placeholder="yourname@upi"
              defaultValue={details.payoutUpi ?? ""}
            />
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Bank account (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="payoutAccountName">Account holder name</Label>
                <Input
                  id="payoutAccountName"
                  name="payoutAccountName"
                  placeholder="As per bank records"
                  defaultValue={details.payoutAccountName ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payoutAccountNumber">Account number</Label>
                <Input
                  id="payoutAccountNumber"
                  name="payoutAccountNumber"
                  inputMode="numeric"
                  placeholder="000123456789"
                  defaultValue={details.payoutAccountNumber ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payoutIfsc">IFSC code</Label>
                <Input
                  id="payoutIfsc"
                  name="payoutIfsc"
                  placeholder="HDFC0001234"
                  className="uppercase"
                  defaultValue={details.payoutIfsc ?? ""}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={pending} className="rounded-full">
            {pending && <Loader2 className="size-4 animate-spin" />} Save payout details
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
