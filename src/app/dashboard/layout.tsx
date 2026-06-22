import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "subscriber" && user.role !== "admin") redirect("/");

  return (
    <DashboardShell user={user} variant="subscriber">
      {children}
    </DashboardShell>
  );
}
