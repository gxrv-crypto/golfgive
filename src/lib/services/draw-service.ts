/**
 * Draw & Reward engine (PRD §06–07).
 *
 *  - Two logics: `random` (lottery-style) and `algorithmic`
 *    (weighted toward the most frequently played user scores).
 *  - Prize pool sized from active-subscriber contributions + jackpot carry.
 *  - Tiers 5/4/3 split 40/35/25; each tier shared equally among its winners.
 *  - 5-match jackpot rolls over when unclaimed.
 *  - Simulation produces a full result with NO persistence; publish persists
 *    the draw + winners and carries the jackpot forward.
 */
import "server-only";
import { getRepos } from "@/lib/db/repositories";
import {
  DRAW,
  TIERS,
  PLANS,
  PRIZE_POOL_CONTRIBUTION_PCT,
  type DrawTier,
} from "@/lib/config";
import type { Draw, DrawResult, DrawLogic, DrawWeighting, PrizePool, Winner } from "@/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomNumbers(): number[] {
  const pool = Array.from({ length: DRAW.max - DRAW.min + 1 }, (_, i) => DRAW.min + i);
  return shuffle(pool).slice(0, DRAW.pick).sort((a, b) => a - b);
}

/**
 * Bias the draw toward the most- or least-frequently played score values
 * across all users (PRD §06 algorithmic option).
 */
async function algorithmicNumbers(weighting: DrawWeighting): Promise<number[]> {
  const repos = getRepos();
  const profiles = await repos.profiles.list();
  const freq = new Map<number, number>();
  for (const p of profiles) {
    const scores = await repos.scores.listByUser(p.id);
    for (const s of scores) {
      if (s.value >= DRAW.min && s.value <= DRAW.max) {
        freq.set(s.value, (freq.get(s.value) ?? 0) + 1);
      }
    }
  }
  const ranked = [...freq.entries()]
    .sort((a, b) => (weighting === "least" ? a[1] - b[1] : b[1] - a[1]))
    .map(([v]) => v);

  const picked = new Set<number>(ranked.slice(0, DRAW.pick));
  // Top up with random uniques if not enough played history exists yet.
  while (picked.size < DRAW.pick) {
    picked.add(Math.floor(Math.random() * (DRAW.max - DRAW.min + 1)) + DRAW.min);
  }
  return [...picked].slice(0, DRAW.pick).sort((a, b) => a - b);
}

async function computePoolTotal(): Promise<number> {
  const repos = getRepos();
  const subs = await repos.subscriptions.list();
  let total = 0;
  for (const s of subs) {
    if (s.status === "active") {
      total += PLANS[s.plan].perMonth * PRIZE_POOL_CONTRIBUTION_PCT;
    }
  }
  return Math.round(total);
}

function matchCount(picks: number[], winning: number[]): number {
  const set = new Set(winning);
  return picks.filter((n) => set.has(n)).length;
}

/**
 * Core computation shared by simulate + publish.
 * Returns the (unpersisted) draw, pools and winners.
 */
async function compute(
  period: string,
  logic: DrawLogic,
  weighting: DrawWeighting = "most",
): Promise<DrawResult> {
  const repos = getRepos();

  const winningNumbers =
    logic === "algorithmic" ? await algorithmicNumbers(weighting) : randomNumbers();

  const basePool = await computePoolTotal();

  // Previous published draw's unclaimed jackpot carries in.
  const prior = (await repos.draws.list()).find(
    (d) => d.status === "published" && d.period < period,
  );
  const carryIn = prior?.jackpotCarry ?? 0;
  const poolTotal = basePool + carryIn;

  // Find winners among active subscribers with a full set of lucky numbers.
  const profiles = await repos.profiles.list();
  const raw: Array<{ userId: string; userName: string; matched: number; tier: DrawTier }> = [];
  for (const p of profiles) {
    if (p.role === "admin") continue;
    if (p.luckyNumbers.length !== DRAW.pick) continue;
    const sub = await repos.subscriptions.getByUser(p.id);
    if (!sub || sub.status !== "active") continue;

    const matched = matchCount(p.luckyNumbers, winningNumbers);
    if (matched >= TIERS.three.match) {
      const tier: DrawTier = matched >= 5 ? "five" : matched === 4 ? "four" : "three";
      raw.push({ userId: p.id, userName: p.name, matched, tier });
    }
  }

  // Build pools per tier and split equally among that tier's winners.
  const tiers: DrawTier[] = ["five", "four", "three"];
  const pools: PrizePool[] = [];
  const winners: Omit<Winner, "id" | "createdAt">[] = [];
  let jackpotCarry = 0;

  for (const tier of tiers) {
    const cfg = TIERS[tier];
    const amount = Math.round((poolTotal * cfg.sharePct) / 100);
    const tierWinners = raw.filter((r) => r.tier === tier);
    const winnerCount = tierWinners.length;
    const perWinner = winnerCount > 0 ? Math.floor(amount / winnerCount) : 0;

    if (tier === "five" && winnerCount === 0) {
      jackpotCarry = amount; // rolls over
    }

    pools.push({
      tier,
      sharePct: cfg.sharePct,
      amount,
      rollover: cfg.rollover,
      winnerCount,
      perWinner,
    });

    for (const w of tierWinners) {
      winners.push({
        drawId: "", // filled on publish
        userId: w.userId,
        userName: w.userName,
        tier,
        matchedCount: w.matched,
        amount: perWinner,
        proofUrl: null,
        status: "pending",
        verifiedBy: null,
        paidAt: null,
      });
    }
  }

  const draw: Draw = {
    id: "simulated",
    period,
    logic,
    status: "simulated",
    winningNumbers,
    poolTotal,
    jackpotCarry,
    publishedAt: null,
    createdAt: new Date().toISOString(),
  };

  return { draw, pools, winners: winners as Winner[] };
}

/** Pre-analysis: compute everything, persist nothing. */
export async function simulateDraw(
  period: string,
  logic: DrawLogic,
  weighting: DrawWeighting = "most",
): Promise<DrawResult> {
  return compute(period, logic, weighting);
}

/** Official run: persist the draw + winners and carry the jackpot forward. */
export async function publishDraw(
  period: string,
  logic: DrawLogic,
  weighting: DrawWeighting = "most",
): Promise<DrawResult> {
  const repos = getRepos();
  const result = await compute(period, logic, weighting);

  const draw = await repos.draws.upsert({
    period,
    logic,
    status: "published",
    winningNumbers: result.draw.winningNumbers,
    poolTotal: result.draw.poolTotal,
    jackpotCarry: result.draw.jackpotCarry,
    publishedAt: new Date().toISOString(),
  });

  const persisted = await repos.winners.replaceForDraw(
    draw.id,
    result.winners.map((w) => ({ ...w, drawId: draw.id })),
  );

  return { draw, pools: result.pools, winners: persisted };
}

export async function listDraws(): Promise<Draw[]> {
  return getRepos().draws.list();
}

export async function getLatestPublishedDraw(): Promise<Draw | null> {
  const draws = await getRepos().draws.list();
  return draws.find((d) => d.status === "published") ?? null;
}
