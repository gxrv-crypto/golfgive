"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/auth/password-strength";
import { isStrongPassword } from "@/lib/password";
import { signupAction } from "@/lib/actions/auth-actions";

export default function SignupPage() {
  return (
    <React.Suspense fallback={null}>
      <SignupForm />
    </React.Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = React.useTransition();
  const [accepted, setAccepted] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [awaitingConfirm, setAwaitingConfirm] = React.useState(false);
  const strong = isStrongPassword(password);

  const plan = params.get("plan");
  const charity = params.get("charity");
  const next = new URLSearchParams();
  if (plan) next.set("plan", plan);
  if (charity) next.set("charity", charity);
  const subscribeHref = `/subscribe${next.toString() ? `?${next}` : ""}`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isStrongPassword(password)) {
      toast.error("Please choose a stronger password");
      return;
    }
    if (!accepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    const form = new FormData(e.currentTarget);
    const input = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password,
      acceptTerms: accepted,
    };
    start(async () => {
      const res = await signupAction(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (!res.data?.confirmed) {
        // Email confirmation required — don't proceed until verified.
        setAwaitingConfirm(true);
        return;
      }
      toast.success("Account created — let's set up your subscription!");
      router.push(subscribeHref);
      router.refresh();
    });
  }

  if (awaitingConfirm) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/15 text-success">
          <MailCheck className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Confirm your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to your inbox. Click it to verify your
          account, then log in to continue.
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
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Play golf with purpose. Subscribe in the next step.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Jordan Player" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="At least 8 characters"
            className="h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength value={password} />
        </div>

        {/* Terms & Conditions acceptance */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span className="text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-medium text-primary hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <Button
          type="submit"
          disabled={pending || !accepted || !strong}
          className="h-11 w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {pending && <Loader2 className="size-4 animate-spin" />} Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
