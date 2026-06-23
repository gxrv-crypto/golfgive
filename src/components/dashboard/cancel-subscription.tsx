"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cancelSubscriptionAction } from "@/lib/actions/subscription-actions";

export function CancelSubscription() {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function cancel() {
    start(async () => {
      const res = await cancelSubscriptionAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Subscription cancelled");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancel subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel your subscription?</DialogTitle>
          <DialogDescription>
            You&apos;ll lose access to score tracking and won&apos;t be entered in future
            draws. You can resubscribe anytime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep subscription</Button>
          </DialogClose>
          <Button variant="destructive" onClick={cancel} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Cancel subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
