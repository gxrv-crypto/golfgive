"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      email: String(form.get("email")),
      password: String(form.get("password")),
    };
    start(async () => {
      const res = await loginAction(input);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Welcome back!");
      router.push(res.data?.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in to track scores and enter the draw.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Log in
          </Button>
        </form>

        <div className="mt-6 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo credentials</p>
          <p className="mt-1">Subscriber — player@golfgive.app / player1234</p>
          <p>Admin — admin@golfgive.app / admin1234</p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
