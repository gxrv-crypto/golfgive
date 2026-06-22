"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  const plan = params.get("plan");
  const charity = params.get("charity");
  const next = new URLSearchParams();
  if (plan) next.set("plan", plan);
  if (charity) next.set("charity", charity);
  const subscribeHref = `/subscribe${next.toString() ? `?${next}` : ""}`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    };
    start(async () => {
      const res = await signupAction(input);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Account created — let's set up your subscription!");
      router.push(subscribeHref);
      router.refresh();
    });
  }

  return (
    <Card className="border border-border/40 bg-background/70 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1.5 p-6 md:p-8 pb-4">
        <CardTitle className="font-display text-2xl font-extrabold text-foreground">Create your account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Play golf with purpose. Subscribe in the next step.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 pt-0 space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Full Name</Label>
            <Input id="name" name="name" required placeholder="Jordan Player" className="rounded-xl h-11 border-border/60 bg-background/50 focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" className="rounded-xl h-11 border-border/60 bg-background/50 focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="At least 8 characters" className="rounded-xl h-11 border-border/60 bg-background/50 focus:bg-background transition-all" />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md transition-all hover:scale-101 hover:shadow-lg gap-1.5"
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />} Continue
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
