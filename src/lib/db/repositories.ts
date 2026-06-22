/**
 * Repository layer — the data contract every service depends on.
 *
 * The default export is the in-memory implementation. A Supabase-backed
 * implementation with the same shape can be swapped in via `getRepos()` once
 * env vars are present, without touching any service or UI code.
 */
import { db, uid } from "@/lib/db/store";
import type {
  Profile,
  Subscription,
  Score,
  Charity,
  Draw,
  Winner,
  Donation,
} from "@/types";

export interface Repositories {
  profiles: {
    getById(id: string): Promise<Profile | null>;
    getByEmail(email: string): Promise<Profile | null>;
    list(): Promise<Profile[]>;
    create(p: Omit<Profile, "id" | "createdAt"> & { id?: string }): Promise<Profile>;
    update(id: string, patch: Partial<Profile>): Promise<Profile>;
  };
  credentials: {
    verify(email: string, password: string): Promise<boolean>;
    set(email: string, password: string): Promise<void>;
  };
  subscriptions: {
    getByUser(userId: string): Promise<Subscription | null>;
    list(): Promise<Subscription[]>;
    upsert(sub: Partial<Subscription> & { userId: string }): Promise<Subscription>;
  };
  scores: {
    listByUser(userId: string): Promise<Score[]>; // reverse chronological
    create(s: Omit<Score, "id" | "createdAt">): Promise<Score>;
    update(id: string, patch: Partial<Score>): Promise<Score>;
    remove(id: string): Promise<void>;
    getByUserAndDate(userId: string, playedOn: string): Promise<Score | null>;
    getById(id: string): Promise<Score | null>;
  };
  charities: {
    list(): Promise<Charity[]>;
    getById(id: string): Promise<Charity | null>;
    create(c: Omit<Charity, "id" | "createdAt" | "raised" | "events">): Promise<Charity>;
    update(id: string, patch: Partial<Charity>): Promise<Charity>;
    remove(id: string): Promise<void>;
  };
  draws: {
    list(): Promise<Draw[]>;
    getById(id: string): Promise<Draw | null>;
    getByPeriod(period: string): Promise<Draw | null>;
    upsert(d: Partial<Draw> & { period: string }): Promise<Draw>;
  };
  winners: {
    list(): Promise<Winner[]>;
    listByDraw(drawId: string): Promise<Winner[]>;
    listByUser(userId: string): Promise<Winner[]>;
    getById(id: string): Promise<Winner | null>;
    create(w: Omit<Winner, "id" | "createdAt">): Promise<Winner>;
    update(id: string, patch: Partial<Winner>): Promise<Winner>;
    replaceForDraw(drawId: string, winners: Omit<Winner, "id" | "createdAt">[]): Promise<Winner[]>;
  };
  donations: {
    listByUser(userId: string): Promise<Donation[]>;
    list(): Promise<Donation[]>;
    create(d: Omit<Donation, "id" | "createdAt">): Promise<Donation>;
  };
}

const memoryRepos: Repositories = {
  profiles: {
    async getById(id) {
      return db.profiles.get(id) ?? null;
    },
    async getByEmail(email) {
      return [...db.profiles.values()].find((p) => p.email === email) ?? null;
    },
    async list() {
      return [...db.profiles.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    },
    async create(p) {
      const profile: Profile = {
        id: p.id ?? uid("u"),
        createdAt: new Date().toISOString(),
        ...p,
      } as Profile;
      db.profiles.set(profile.id, profile);
      return profile;
    },
    async update(id, patch) {
      const existing = db.profiles.get(id);
      if (!existing) throw new Error("Profile not found");
      const next = { ...existing, ...patch };
      db.profiles.set(id, next);
      return next;
    },
  },

  credentials: {
    async verify(email, password) {
      return db.credentials.get(email) === password;
    },
    async set(email, password) {
      db.credentials.set(email, password);
    },
  },

  subscriptions: {
    async getByUser(userId) {
      return (
        [...db.subscriptions.values()].find((s) => s.userId === userId) ?? null
      );
    },
    async list() {
      return [...db.subscriptions.values()];
    },
    async upsert(sub) {
      const existing = [...db.subscriptions.values()].find(
        (s) => s.userId === sub.userId,
      );
      if (existing) {
        const next = { ...existing, ...sub };
        db.subscriptions.set(existing.id, next);
        return next;
      }
      const created: Subscription = {
        id: uid("sub"),
        userId: sub.userId,
        plan: sub.plan ?? "monthly",
        status: sub.status ?? "pending",
        razorpaySubscriptionId: sub.razorpaySubscriptionId ?? null,
        razorpayCustomerId: sub.razorpayCustomerId ?? null,
        currentPeriodEnd: sub.currentPeriodEnd ?? null,
        createdAt: new Date().toISOString(),
      };
      db.subscriptions.set(created.id, created);
      return created;
    },
  },

  scores: {
    async listByUser(userId) {
      return [...db.scores.values()]
        .filter((s) => s.userId === userId)
        .sort((a, b) => b.playedOn.localeCompare(a.playedOn));
    },
    async create(s) {
      const score: Score = {
        id: uid("sc"),
        createdAt: new Date().toISOString(),
        ...s,
      };
      db.scores.set(score.id, score);
      return score;
    },
    async update(id, patch) {
      const existing = db.scores.get(id);
      if (!existing) throw new Error("Score not found");
      const next = { ...existing, ...patch };
      db.scores.set(id, next);
      return next;
    },
    async remove(id) {
      db.scores.delete(id);
    },
    async getByUserAndDate(userId, playedOn) {
      return (
        [...db.scores.values()].find(
          (s) => s.userId === userId && s.playedOn === playedOn,
        ) ?? null
      );
    },
    async getById(id) {
      return db.scores.get(id) ?? null;
    },
  },

  charities: {
    async list() {
      return [...db.charities.values()].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
      );
    },
    async getById(id) {
      return db.charities.get(id) ?? null;
    },
    async create(c) {
      const charity: Charity = {
        id: uid("ch"),
        raised: 0,
        events: [],
        createdAt: new Date().toISOString(),
        ...c,
      };
      db.charities.set(charity.id, charity);
      return charity;
    },
    async update(id, patch) {
      const existing = db.charities.get(id);
      if (!existing) throw new Error("Charity not found");
      const next = { ...existing, ...patch };
      db.charities.set(id, next);
      return next;
    },
    async remove(id) {
      db.charities.delete(id);
    },
  },

  draws: {
    async list() {
      return [...db.draws.values()].sort((a, b) =>
        b.period.localeCompare(a.period),
      );
    },
    async getById(id) {
      return db.draws.get(id) ?? null;
    },
    async getByPeriod(period) {
      return [...db.draws.values()].find((d) => d.period === period) ?? null;
    },
    async upsert(d) {
      const existing = [...db.draws.values()].find(
        (x) => x.period === d.period,
      );
      if (existing) {
        const next = { ...existing, ...d };
        db.draws.set(existing.id, next);
        return next;
      }
      const created: Draw = {
        id: uid("draw"),
        period: d.period,
        logic: d.logic ?? "random",
        status: d.status ?? "draft",
        winningNumbers: d.winningNumbers ?? [],
        poolTotal: d.poolTotal ?? 0,
        jackpotCarry: d.jackpotCarry ?? 0,
        publishedAt: d.publishedAt ?? null,
        createdAt: new Date().toISOString(),
      };
      db.draws.set(created.id, created);
      return created;
    },
  },

  winners: {
    async list() {
      return [...db.winners.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    },
    async listByDraw(drawId) {
      return [...db.winners.values()].filter((w) => w.drawId === drawId);
    },
    async listByUser(userId) {
      return [...db.winners.values()].filter((w) => w.userId === userId);
    },
    async getById(id) {
      return db.winners.get(id) ?? null;
    },
    async create(w) {
      const winner: Winner = {
        id: uid("win"),
        createdAt: new Date().toISOString(),
        ...w,
      };
      db.winners.set(winner.id, winner);
      return winner;
    },
    async update(id, patch) {
      const existing = db.winners.get(id);
      if (!existing) throw new Error("Winner not found");
      const next = { ...existing, ...patch };
      db.winners.set(id, next);
      return next;
    },
    async replaceForDraw(drawId, winners) {
      for (const [id, w] of db.winners) {
        if (w.drawId === drawId) db.winners.delete(id);
      }
      const created: Winner[] = [];
      for (const w of winners) {
        created.push(await memoryRepos.winners.create(w));
      }
      return created;
    },
  },

  donations: {
    async listByUser(userId) {
      return [...db.donations.values()].filter((d) => d.userId === userId);
    },
    async list() {
      return [...db.donations.values()];
    },
    async create(d) {
      const donation: Donation = {
        id: uid("don"),
        createdAt: new Date().toISOString(),
        ...d,
      };
      db.donations.set(donation.id, donation);
      return donation;
    },
  },
};

/**
 * Resolve the active repository implementation. Returns the in-memory repos
 * today; when a Supabase adapter is added it can be selected here based on
 * `isSupabaseConfigured()` — services never change.
 */
export function getRepos(): Repositories {
  return memoryRepos;
}
