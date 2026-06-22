import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Dice5,
  HeartHandshake,
  Trophy,
  Settings,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/scores", label: "My Scores", icon: ClipboardList },
  { href: "/dashboard/draws", label: "Draws", icon: Dice5 },
  { href: "/dashboard/charity", label: "Charity", icon: HeartHandshake },
  { href: "/dashboard/winnings", label: "Winnings", icon: Trophy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "subscriber" && user.role !== "admin") redirect("/");

  return (
    <DashboardShell user={user} items={items}>
      {children}
    </DashboardShell>
  );
}
