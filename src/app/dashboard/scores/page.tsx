import { requireUser } from "@/lib/auth/session";
import { listScores } from "@/lib/services/score-service";
import { isActive } from "@/lib/services/subscription-service";
import { ScoreManager } from "@/components/dashboard/score-manager";
import { SubscribeGate } from "@/components/dashboard/subscribe-gate";

export default async function ScoresPage() {
  const user = await requireUser();
  const [scores, active] = await Promise.all([
    listScores(user.id),
    isActive(user.id),
  ]);
  const allowed = active || user.role === "admin";

  return (
    <div className="mx-auto max-w-3xl">
      {allowed ? (
        <ScoreManager scores={scores} />
      ) : (
        <SubscribeGate feature="Score tracking" />
      )}
    </div>
  );
}
