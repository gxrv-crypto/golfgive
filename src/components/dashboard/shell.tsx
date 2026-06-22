"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Dice5,
  HeartHandshake,
  Trophy,
  Settings,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/actions/auth-actions";
import type { SessionUser } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export type NavVariant = "subscriber" | "admin";

/**
 * Nav definitions live in this client module so the icon *components* never
 * cross the server→client boundary (React can't serialize functions/objects).
 * Layouts pass a string `variant` instead.
 */
const NAV: Record<NavVariant, NavItem[]> = {
  subscriber: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/scores", label: "My Scores", icon: ClipboardList },
    { href: "/dashboard/draws", label: "Draws", icon: Dice5 },
    { href: "/dashboard/charity", label: "Charity", icon: HeartHandshake },
    { href: "/dashboard/winnings", label: "Winnings", icon: Trophy },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/draws", label: "Draws", icon: Dice5 },
    { href: "/admin/charities", label: "Charities", icon: HeartHandshake },
    { href: "/admin/winners", label: "Winners", icon: Trophy },
  ],
};

/* ─── Sidebar nav links with premium active indicator ─── */
function SidebarNavLinks({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5",
              collapsed && "justify-center px-2",
            )}
          >
            {/* Active indicator bar */}
            {active && (
              <span className="absolute -left-[1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all" />
            )}
            <item.icon
              className={cn(
                "shrink-0 transition-transform duration-200",
                active ? "size-[18px]" : "size-4 group-hover:scale-110",
              )}
            />
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
            {!collapsed && active && (
              <ChevronRight className="ml-auto size-3.5 text-primary/60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Mobile nav links (simplified) ─── */
function MobileNavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  user,
  variant,
  children,
}: {
  user: SessionUser;
  variant: NavVariant;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const items = NAV[variant];
  const activeItem = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  const title = activeItem?.label ?? "Dashboard";
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function onLogout() {
    logoutAction().then(() => {
      toast.success("Logged out");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ───────── Desktop sidebar — sticky, self-start flex alignment so it stays fixed ───────── */}
      <aside
        className={cn(
          "hidden md:flex w-64 shrink-0 sticky top-0 h-screen self-start",
          "flex-col border-r border-sidebar-border bg-sidebar",
          "overflow-y-auto overscroll-contain",
        )}
      >
        {/* Subtle gradient overlay at top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.03] to-transparent" />

        {/* Logo section */}
        <div className="relative flex items-center gap-3 px-5 py-5">
          <Logo />
        </div>

        {/* Section label */}
        <div className="px-5 pb-2 pt-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            <Sparkles className="size-3" />
            Navigation
          </p>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-3">
          <SidebarNavLinks items={items} />
        </div>

        {/* Bottom user section */}
        <div className="relative border-t border-sidebar-border px-3 py-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-sidebar-accent">
            <Avatar className="size-8 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.role === "admin" ? "Administrator" : "Subscriber"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────── Main content area ───────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ───── Sticky topbar / navbar ───── */}
        <header
          className={cn(
            "sticky top-0 z-30",
            "flex h-16 items-center justify-between gap-4",
            "border-b border-border/60 bg-background/70 px-4 md:px-6",
            "backdrop-blur-xl backdrop-saturate-150",
          )}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-full flex-col">
                  <div className="px-5 py-5">
                    <Logo />
                  </div>
                  <div className="flex-1 px-3 py-2">
                    <MobileNavLinks items={items} />
                  </div>
                  <div className="border-t px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                      Signed in as {user.name}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Breadcrumb-style title */}
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground md:inline">
                {variant === "admin" ? "Admin" : "Dashboard"}
              </span>
              {title !== "Overview" && (
                <>
                  <ChevronRight className="hidden size-3.5 text-muted-foreground/50 md:inline" />
                  <span className="hidden text-sm font-medium md:inline">
                    {title}
                  </span>
                </>
              )}
              <h1 className="font-display text-lg font-semibold md:hidden">
                {title}
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <div className="mx-1 h-6 w-px bg-border/60" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-xl px-2 hover:bg-muted/80"
                >
                  <Avatar className="size-7 ring-1 ring-border">
                    <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm sm:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="size-3.5 opacity-40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p>{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Back to site</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ───── Page content ───── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
