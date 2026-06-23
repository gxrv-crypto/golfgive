import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart, Target, Trophy, HeartHandshake } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP } from "@/lib/config";
import { getSessionUser } from "@/lib/auth/session";

const HIGHLIGHTS = [
  {
    icon: Target,
    title: "Track every round",
    desc: "Log your Stableford scores and watch your golf story unfold.",
  },
  {
    icon: Trophy,
    title: "Win monthly draws",
    desc: "Your lucky numbers are entered into every prize draw, automatically.",
  },
  {
    icon: HeartHandshake,
    title: "Give as you play",
    desc: "A share of your membership funds a charity you care about.",
  },
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary p-12 text-primary-foreground lg:flex lg:flex-col">
        {/* Ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-accent/30 blur-3xl"
        />

        {/* Brand mark */}
        <Link href="/" className="relative z-10 flex w-fit items-center gap-2 font-display">
          <span className="grid size-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Heart className="size-5 fill-current" />
          </span>
          <span className="text-xl font-bold tracking-tight">{APP.name}</span>
        </Link>

        {/* Pitch */}
        <div className="relative z-10 my-auto max-w-md py-10">
          <h2 className="font-display text-4xl font-extrabold leading-[1.1]">
            Play golf with purpose.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            {APP.tagline}
          </p>

          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <h.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="text-sm text-primary-foreground/75">{h.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} {APP.name} — Play · Win · Give.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 p-4 sm:px-6 lg:px-8">
          <Logo className="lg:hidden" />
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
