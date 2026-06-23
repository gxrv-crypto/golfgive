"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  function autofill(kind: "subscriber" | "admin") {
    if (kind === "subscriber") {
      setEmail("player@golfgive.app");
      setPassword("player1234");
    } else {
      setEmail("admin@golfgive.app");
      setPassword("admin1234");
    }
    toast.message(`Filled ${kind} credentials`, { description: "Hit Log in to continue." });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    start(async () => {
      const res = await loginAction({ email, password });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Welcome back!");
      router.push(res.data?.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Log in to track scores and enter the draw.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
        </div>
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-full">
          {pending && <Loader2 className="size-4 animate-spin" />} Log in
        </Button>
      </form>

      {/* Demo credential autofill */}
      <div className="mt-6 rounded-2xl border border-dashed border-border p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Wand2 className="size-3.5" /> Demo access — autofill credentials
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => autofill("subscriber")}
          >
            Subscriber
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => autofill("admin")}
          >
            Admin
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
