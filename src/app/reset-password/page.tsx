import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  // After /auth/callback exchanges the recovery code, a session exists.
  const user = await getSessionUser();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <Link href="/" className="mb-8">
        <Logo />
      </Link>

      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-extrabold">Set a new password</h1>
        {user ? (
          <>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Choose a new password for <span className="font-medium text-foreground">{user.email}</span>.
            </p>
            <div className="mt-6">
              <ResetPasswordForm />
            </div>
          </>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This reset link is invalid or has expired. Request a new one.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
