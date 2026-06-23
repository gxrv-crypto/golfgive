import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { ChangePassword } from "@/components/dashboard/change-password";
import { CancelSubscription } from "@/components/dashboard/cancel-subscription";
import { requireUser } from "@/lib/auth/session";
import { getSubscription, isActive } from "@/lib/services/subscription-service";
import { getProfile } from "@/lib/services/profile-service";
import { PLANS } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function SettingsPage() {
  const user = await requireUser();
  const [sub, active, profile] = await Promise.all([
    getSubscription(user.id),
    isActive(user.id),
    getProfile(user.id),
  ]);

  return (
    <div className="w-full space-y-6">
      <ProfileCard
        name={user.name}
        email={user.email}
        role={user.role}
        avatarUrl={profile?.avatarUrl ?? null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm name={user.name} email={user.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change the password you use to log in.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePassword />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your plan and billing.</CardDescription>
        </CardHeader>
        <CardContent>
          {sub && active ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {PLANS[sub.plan].name} · {formatCurrency(PLANS[sub.plan].price)}/{PLANS[sub.plan].interval}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="success">Active</Badge>
              </div>
              {sub.currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Renews</span>
                  <span className="font-medium">{formatDate(sub.currentPeriodEnd)}</span>
                </div>
              )}
              {sub.razorpaySubscriptionId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Razorpay ID</span>
                  <code className="text-xs text-muted-foreground">{sub.razorpaySubscriptionId}</code>
                </div>
              )}
              <div className="border-t pt-3">
                <CancelSubscription />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <Badge variant="warning">Inactive</Badge>
              <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/subscribe">Subscribe now</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
