import { CharityManager } from "@/components/admin/charity-manager";
import { requireRole } from "@/lib/auth/session";
import { listCharities } from "@/lib/services/charity-service";

export default async function AdminCharitiesPage() {
  await requireRole("admin");
  const charities = await listCharities();
  return <CharityManager charities={charities} />;
}
