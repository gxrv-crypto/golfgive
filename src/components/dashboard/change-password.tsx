"use client";
import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/auth/password-strength";
import { isStrongPassword } from "@/lib/password";
import { changePasswordAction } from "@/lib/actions/auth-actions";

export function ChangePassword() {
  const [pending, start] = React.useTransition();
  const [password, setPassword] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

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
      toast.success("Password updated");
      setPassword("");
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrength value={password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter new password"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={pending || !isStrongPassword(password)}
        className="rounded-full"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Update password
      </Button>
    </form>
  );
}
