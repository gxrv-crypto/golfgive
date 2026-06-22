/**
 * Score service — enforces the PRD rules:
 *  - Stableford range 1..45 (via Zod + DB check)
 *  - One entry per date (no duplicates)
 *  - Rolling last 5: a new score beyond 5 evicts the oldest
 *  - Reverse-chronological retrieval
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import { scoreSchema } from "@/lib/validations";
import { SCORE } from "@/lib/config";
import type { Score } from "@/types";

export async function listScores(userId: string): Promise<Score[]> {
  return getRepos().scores.listByUser(userId);
}

export async function addScore(userId: string, input: unknown): Promise<Score> {
  const { value, playedOn } = scoreSchema.parse(input);
  const repos = getRepos();

  const duplicate = await repos.scores.getByUserAndDate(userId, playedOn);
  if (duplicate) {
    throw new Error(
      "A score already exists for that date. Edit or delete it instead.",
    );
  }

  const created = await repos.scores.create({ userId, value, playedOn });

  // Rolling-5 eviction: keep only the most recent SCORE.keepLast by play date.
  const all = await repos.scores.listByUser(userId); // desc by playedOn
  if (all.length > SCORE.keepLast) {
    for (const old of all.slice(SCORE.keepLast)) {
      await repos.scores.remove(old.id);
    }
  }
  return created;
}

export async function editScore(
  userId: string,
  scoreId: string,
  input: unknown,
): Promise<Score> {
  const { value, playedOn } = scoreSchema.parse(input);
  const repos = getRepos();

  const existing = await repos.scores.getById(scoreId);
  if (!existing || existing.userId !== userId) {
    throw new Error("Score not found");
  }

  // If the date changed, make sure it doesn't collide with another entry.
  if (playedOn !== existing.playedOn) {
    const clash = await repos.scores.getByUserAndDate(userId, playedOn);
    if (clash && clash.id !== scoreId) {
      throw new Error("Another score already exists for that date.");
    }
  }
  return repos.scores.update(scoreId, { value, playedOn });
}

export async function deleteScore(userId: string, scoreId: string): Promise<void> {
  const repos = getRepos();
  const existing = await repos.scores.getById(scoreId);
  if (!existing || existing.userId !== userId) {
    throw new Error("Score not found");
  }
  await repos.scores.remove(scoreId);
}
