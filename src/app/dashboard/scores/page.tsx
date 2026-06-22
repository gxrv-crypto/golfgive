import { requireUser } from "@/lib/auth/session";
import { listScores } from "@/lib/services/score-service";
import { ScoreManager } from "@/components/dashboard/score-manager";

export default async function ScoresPage() {
  const user = await requireUser();
  const scores = await listScores(user.id);
  return (
    <div className="mx-auto max-w-3xl">
      <ScoreManager scores={scores} />
    </div>
  );
}
