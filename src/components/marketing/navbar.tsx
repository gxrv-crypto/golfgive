"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { SessionUser } from "@/types";

const links = [
  { href: "/charities", label: "Charities" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Button key={l.href} variant="ghost" size="sm" asChild>
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm">
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <Link href="/signup">Subscribe</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <Logo />
              <nav className="mt-4 flex flex-col gap-1">
                {links.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href={l.href}>{l.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                {user ? (
                  <Button asChild>
                    <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button
                      className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                      asChild
                    >
                      <Link href="/signup">Subscribe</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
