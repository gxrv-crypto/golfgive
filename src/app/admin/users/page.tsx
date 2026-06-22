import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/services/profile-service";
import { getRepos } from "@/lib/db/repositories";
import { getCharity } from "@/lib/services/charity-service";
import { PLANS } from "@/lib/config";
import { formatDate } from "@/lib/format";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const repos = getRepos();
  const users = await listUsers();

  const rows = await Promise.all(
    users.map(async (u) => {
      const [sub, scores, charity] = await Promise.all([
        repos.subscriptions.getByUser(u.id),
        repos.scores.listByUser(u.id),
        u.charityId ? getCharity(u.charityId) : Promise.resolve(null),
      ]);
      return { user: u, sub, scoreCount: scores.length, charity };
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>{users.length} accounts on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Charity</TableHead>
              <TableHead className="text-right">Scores</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ user, sub, scoreCount, charity }) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  {sub ? (
                    <Badge variant={sub.status === "active" ? "success" : "warning"}>
                      {PLANS[sub.plan].name} · {sub.status}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {charity ? (
                    <span>
                      {charity.name}{" "}
                      <span className="text-muted-foreground">({user.charityPct}%)</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{scoreCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
