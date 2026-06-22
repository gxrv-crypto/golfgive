"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
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
    <Card className="border border-border/40 bg-background/70 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1.5 p-6 md:p-8 pb-4">
        <CardTitle className="font-display text-2xl font-extrabold text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Log in to track scores and enter the draw.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 pt-0 space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" className="rounded-xl h-11 border-border/60 bg-background/50 focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Password</Label>
            </div>
            <Input id="password" name="password" type="password" required placeholder="••••••••" className="rounded-xl h-11 border-border/60 bg-background/50 focus:bg-background transition-all" />
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md transition-all hover:scale-101 hover:shadow-lg gap-1.5" 
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />} Log in
          </Button>
        </form>

        {/* Beautiful Demo credentials block */}
        <div className="rounded-2xl border border-warning/20 bg-warning/5 dark:bg-warning/10 p-4 text-xs text-warning-foreground space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="size-4 shrink-0 text-warning" />
            <span>Demo access credentials</span>
          </div>
          <div className="space-y-1 text-[11px] text-muted-foreground">
            <p>
              <strong className="text-foreground font-medium">Subscriber:</strong> player@golfgive.app / player1234
            </p>
            <p>
              <strong className="text-foreground font-medium">Administrator:</strong> admin@golfgive.app / admin1234
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
