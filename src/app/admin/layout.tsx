import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dice5,
  HeartHandshake,
  Trophy,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

const items: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/draws", label: "Draws", icon: Dice5 },
  { href: "/admin/charities", label: "Charities", icon: HeartHandshake },
  { href: "/admin/winners", label: "Winners", icon: Trophy },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <DashboardShell user={user} items={items}>
      {children}
    </DashboardShell>
  );
}
