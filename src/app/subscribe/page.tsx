import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SubscribeFlow } from "@/components/dashboard/subscribe-flow";
import { getSessionUser } from "@/lib/auth/session";
import { listCharities } from "@/lib/services/charity-service";

export default async function SubscribePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const charities = await listCharities();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Complete your subscription</h1>
        <p className="mt-2 text-muted-foreground">Play, win, and give — all from one plan.</p>
        <div className="mt-8">
          <SubscribeFlow charities={charities} />
        </div>
      </main>
    </div>
  );
}
