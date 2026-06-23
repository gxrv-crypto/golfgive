"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/lib/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [pending, start] = React.useTransition();
  const [sent, setSent] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    start(async () => {
      const res = await forgotPasswordAction({ email });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/15 text-success">
          <MailCheck className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a link to reset your password.
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link href="/login">
            <ArrowLeft className="size-4" /> Back to log in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <Button type="submit" disabled={pending} className="w-full rounded-full">
          {pending && <Loader2 className="size-4 animate-spin" />} Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
