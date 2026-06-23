"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/auth/password-strength";
import { isStrongPassword } from "@/lib/password";
import { changePasswordAction } from "@/lib/actions/auth-actions";

export function ResetPasswordForm() {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [password, setPassword] = React.useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const confirm = String(new FormData(e.currentTarget).get("confirm"));
    if (!isStrongPassword(password)) {
      toast.error("Please choose a stronger password");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    start(async () => {
      const res = await changePasswordAction({ password });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Password updated — you're signed in");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrength value={password} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required placeholder="Re-enter new password" />
      </div>
      <Button type="submit" disabled={pending || !isStrongPassword(password)} className="w-full rounded-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Update password
      </Button>
    </form>
  );
}
