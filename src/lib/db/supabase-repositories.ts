/**
 * Supabase-backed implementation of the Repositories contract.
 * Mirrors the in-memory repos exactly so services/UI are unchanged.
 * Uses the service-role client (trusted server) — see supabase/admin.ts.
 */
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Repositories } from "@/lib/db/repositories";
import type {
  Profile,
  Subscription,
  Score,
  Charity,
  CharityEvent,
  Draw,
  Winner,
  Donation,
} from "@/types";

/* ----------------------------- row mappers ----------------------------- */

/* eslint-disable @typescript-eslint/no-explicit-any */
const toProfile = (r: any): Profile => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  charityId: r.charity_id,
  charityPct: r.charity_pct,
  luckyNumbers: r.lucky_numbers ?? [],
  avatarUrl: r.avatar_url ?? null,
  payoutUpi: r.payout_upi ?? null,
  payoutAccountName: r.payout_account_name ?? null,
  payoutAccountNumber: r.payout_account_number ?? null,
  payoutIfsc: r.payout_ifsc ?? null,
  createdAt: r.created_at,
});

const toSub = (r: any): Subscription => ({
  id: r.id,
  userId: r.user_id,
  plan: r.plan,
  status: r.status,
  razorpaySubscriptionId: r.razorpay_subscription_id,
  razorpayCustomerId: r.razorpay_customer_id,
  currentPeriodEnd: r.current_period_end,
  createdAt: r.created_at,
});

const toScore = (r: any): Score => ({
  id: r.id,
  userId: r.user_id,
  value: r.value,
  playedOn: r.played_on,
  createdAt: r.created_at,
});

const toEvent = (r: any): CharityEvent => ({
  id: r.id,
  title: r.title,
  date: r.date,
  location: r.location,
});

const toCharity = (r: any, events: CharityEvent[] = []): Charity => ({
  id: r.id,
  name: r.name,
  category: r.category,
  description: r.description,
  mission: r.mission,
  imageUrl: r.image_url ?? "",
  isFeatured: r.is_featured,
  raised: Number(r.raised ?? 0),
  events,
  createdAt: r.created_at,
});

const toDraw = (r: any): Draw => ({
  id: r.id,
  period: r.period,
  logic: r.logic,
  status: r.status,
  winningNumbers: r.winning_numbers ?? [],
  poolTotal: Number(r.pool_total ?? 0),
  jackpotCarry: Number(r.jackpot_carry ?? 0),
  publishedAt: r.published_at,
  createdAt: r.created_at,
});

const toWinner = (r: any, name = ""): Winner => ({
  id: r.id,
  drawId: r.draw_id,
  userId: r.user_id,
  userName: name,
  tier: r.tier,
  matchedCount: r.matched_count,
  amount: Number(r.amount ?? 0),
  proofUrl: r.proof_url,
  status: r.status,
  verifiedBy: r.verified_by,
  paidAt: r.paid_at,
  createdAt: r.created_at,
});

const toDonation = (r: any): Donation => ({
  id: r.id,
  userId: r.user_id,
  charityId: r.charity_id,
  amount: Number(r.amount),
  createdAt: r.created_at,
});

function must<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

/** Resolve display names for a set of user ids. */
async function namesFor(userIds: string[]): Promise<Map<string, string>> {
  const db = supabaseAdmin();
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return new Map();
  const { data } = await db.from("profiles").select("id, name").in("id", unique);
  return new Map((data ?? []).map((p: any) => [p.id, p.name]));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ----------------------------- repositories ---------------------------- */

export const supabaseRepos: Repositories = {
  profiles: {
    async getById(id) {
      const { data } = await supabaseAdmin().from("profiles").select("*").eq("id", id).maybeSingle();
      return data ? toProfile(data) : null;
    },
    async getByEmail(email) {
      const { data } = await supabaseAdmin().from("profiles").select("*").eq("email", email).maybeSingle();
      return data ? toProfile(data) : null;
    },
    async list() {
      const { data, error } = await supabaseAdmin()
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return must(data, error).map(toProfile);
    },
    async create(p) {
      const { data, error } = await supabaseAdmin()
        .from("profiles")
        .insert({
          ...(p.id ? { id: p.id } : {}),
          email: p.email,
          name: p.name,
          role: p.role,
          charity_id: p.charityId,
          charity_pct: p.charityPct,
          lucky_numbers: p.luckyNumbers,
        })
        .select()
        .single();
      return toProfile(must(data, error));
    },
    async update(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.role !== undefined) row.role = patch.role;
      if (patch.charityId !== undefined) row.charity_id = patch.charityId;
      if (patch.charityPct !== undefined) row.charity_pct = patch.charityPct;
      if (patch.luckyNumbers !== undefined) row.lucky_numbers = patch.luckyNumbers;
      if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
      if (patch.payoutUpi !== undefined) row.payout_upi = patch.payoutUpi;
      if (patch.payoutAccountName !== undefined) row.payout_account_name = patch.payoutAccountName;
      if (patch.payoutAccountNumber !== undefined) row.payout_account_number = patch.payoutAccountNumber;
      if (patch.payoutIfsc !== undefined) row.payout_ifsc = patch.payoutIfsc;
      const { data, error } = await supabaseAdmin()
        .from("profiles")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      return toProfile(must(data, error));
    },
  },

  // Auth is handled by Supabase Auth; these are never called in Supabase mode.
  credentials: {
    async verify() {
      return false;
    },
    async set() {
      /* handled by Supabase Auth */
    },
  },

  subscriptions: {
    async getByUser(userId) {
      const { data } = await supabaseAdmin()
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return data ? toSub(data) : null;
    },
    async list() {
      const { data, error } = await supabaseAdmin().from("subscriptions").select("*");
      return must(data, error).map(toSub);
    },
    async upsert(sub) {
      const db = supabaseAdmin();
      const existing = await this.getByUser(sub.userId);
      const row: Record<string, unknown> = {};
      if (sub.plan !== undefined) row.plan = sub.plan;
      if (sub.status !== undefined) row.status = sub.status;
      if (sub.razorpaySubscriptionId !== undefined) row.razorpay_subscription_id = sub.razorpaySubscriptionId;
      if (sub.razorpayCustomerId !== undefined) row.razorpay_customer_id = sub.razorpayCustomerId;
      if (sub.currentPeriodEnd !== undefined) row.current_period_end = sub.currentPeriodEnd;

      if (existing) {
        const { data, error } = await db
          .from("subscriptions")
          .update(row)
          .eq("id", existing.id)
          .select()
          .single();
        return toSub(must(data, error));
      }
      const { data, error } = await db
        .from("subscriptions")
        .insert({ user_id: sub.userId, plan: sub.plan ?? "monthly", status: sub.status ?? "pending", ...row })
        .select()
        .single();
      return toSub(must(data, error));
    },
  },

  scores: {
    async listByUser(userId) {
      const { data, error } = await supabaseAdmin()
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .order("played_on", { ascending: false });
      return must(data, error).map(toScore);
    },
    async create(s) {
      const { data, error } = await supabaseAdmin()
        .from("scores")
        .insert({ user_id: s.userId, value: s.value, played_on: s.playedOn })
        .select()
        .single();
      return toScore(must(data, error));
    },
    async update(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.value !== undefined) row.value = patch.value;
      if (patch.playedOn !== undefined) row.played_on = patch.playedOn;
      const { data, error } = await supabaseAdmin().from("scores").update(row).eq("id", id).select().single();
      return toScore(must(data, error));
    },
    async remove(id) {
      await supabaseAdmin().from("scores").delete().eq("id", id);
    },
    async getByUserAndDate(userId, playedOn) {
      const { data } = await supabaseAdmin()
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .eq("played_on", playedOn)
        .maybeSingle();
      return data ? toScore(data) : null;
    },
    async getById(id) {
      const { data } = await supabaseAdmin().from("scores").select("*").eq("id", id).maybeSingle();
      return data ? toScore(data) : null;
    },
  },

  charities: {
    async list() {
      const db = supabaseAdmin();
      const [{ data: rows, error }, { data: events }] = await Promise.all([
        db.from("charities").select("*").order("is_featured", { ascending: false }),
        db.from("charity_events").select("*"),
      ]);
      const grouped = new Map<string, CharityEvent[]>();
      for (const e of events ?? []) {
        const list = grouped.get(e.charity_id) ?? [];
        list.push(toEvent(e));
        grouped.set(e.charity_id, list);
      }
      return must(rows, error).map((r) => toCharity(r, grouped.get(r.id) ?? []));
    },
    async getById(id) {
      const db = supabaseAdmin();
      const { data } = await db.from("charities").select("*").eq("id", id).maybeSingle();
      if (!data) return null;
      const { data: events } = await db.from("charity_events").select("*").eq("charity_id", id);
      return toCharity(data, (events ?? []).map(toEvent));
    },
    async create(c) {
      const { data, error } = await supabaseAdmin()
        .from("charities")
        .insert({
          name: c.name,
          category: c.category,
          description: c.description,
          mission: c.mission,
          image_url: c.imageUrl,
          is_featured: c.isFeatured,
        })
        .select()
        .single();
      return toCharity(must(data, error));
    },
    async update(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.category !== undefined) row.category = patch.category;
      if (patch.description !== undefined) row.description = patch.description;
      if (patch.mission !== undefined) row.mission = patch.mission;
      if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl;
      if (patch.isFeatured !== undefined) row.is_featured = patch.isFeatured;
      if (patch.raised !== undefined) row.raised = patch.raised;
      const { data, error } = await supabaseAdmin().from("charities").update(row).eq("id", id).select().single();
      return toCharity(must(data, error));
    },
    async remove(id) {
      await supabaseAdmin().from("charities").delete().eq("id", id);
    },
  },

  draws: {
    async list() {
      const { data, error } = await supabaseAdmin()
        .from("draws")
        .select("*")
        .order("period", { ascending: false });
      return must(data, error).map(toDraw);
    },
    async getById(id) {
      const { data } = await supabaseAdmin().from("draws").select("*").eq("id", id).maybeSingle();
      return data ? toDraw(data) : null;
    },
    async getByPeriod(period) {
      const { data } = await supabaseAdmin().from("draws").select("*").eq("period", period).maybeSingle();
      return data ? toDraw(data) : null;
    },
    async upsert(d) {
      const db = supabaseAdmin();
      const existing = await this.getByPeriod(d.period);
      const row: Record<string, unknown> = {};
      if (d.logic !== undefined) row.logic = d.logic;
      if (d.status !== undefined) row.status = d.status;
      if (d.winningNumbers !== undefined) row.winning_numbers = d.winningNumbers;
      if (d.poolTotal !== undefined) row.pool_total = d.poolTotal;
      if (d.jackpotCarry !== undefined) row.jackpot_carry = d.jackpotCarry;
      if (d.publishedAt !== undefined) row.published_at = d.publishedAt;

      if (existing) {
        const { data, error } = await db.from("draws").update(row).eq("id", existing.id).select().single();
        return toDraw(must(data, error));
      }
      const { data, error } = await db
        .from("draws")
        .insert({ period: d.period, logic: d.logic ?? "random", status: d.status ?? "draft", ...row })
        .select()
        .single();
      return toDraw(must(data, error));
    },
  },

  winners: {
    async list() {
      const { data, error } = await supabaseAdmin()
        .from("winners")
        .select("*")
        .order("created_at", { ascending: false });
      const rows = must(data, error);
      const names = await namesFor(rows.map((r) => r.user_id));
      return rows.map((r) => toWinner(r, names.get(r.user_id) ?? ""));
    },
    async listByDraw(drawId) {
      const { data, error } = await supabaseAdmin().from("winners").select("*").eq("draw_id", drawId);
      const rows = must(data, error);
      const names = await namesFor(rows.map((r) => r.user_id));
      return rows.map((r) => toWinner(r, names.get(r.user_id) ?? ""));
    },
    async listByUser(userId) {
      const { data, error } = await supabaseAdmin().from("winners").select("*").eq("user_id", userId);
      const rows = must(data, error);
      const names = await namesFor([userId]);
      return rows.map((r) => toWinner(r, names.get(userId) ?? ""));
    },
    async getById(id) {
      const { data } = await supabaseAdmin().from("winners").select("*").eq("id", id).maybeSingle();
      if (!data) return null;
      const names = await namesFor([data.user_id]);
      return toWinner(data, names.get(data.user_id) ?? "");
    },
    async create(w) {
      const { data, error } = await supabaseAdmin()
        .from("winners")
        .insert({
          draw_id: w.drawId,
          user_id: w.userId,
          tier: w.tier,
          matched_count: w.matchedCount,
          amount: w.amount,
          proof_url: w.proofUrl,
          status: w.status,
          verified_by: w.verifiedBy,
          paid_at: w.paidAt,
        })
        .select()
        .single();
      return toWinner(must(data, error), w.userName);
    },
    async update(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.proofUrl !== undefined) row.proof_url = patch.proofUrl;
      if (patch.verifiedBy !== undefined) row.verified_by = patch.verifiedBy;
      if (patch.paidAt !== undefined) row.paid_at = patch.paidAt;
      const { data, error } = await supabaseAdmin().from("winners").update(row).eq("id", id).select().single();
      const names = await namesFor([(data as { user_id: string }).user_id]);
      const out = must(data, error);
      return toWinner(out, names.get((out as { user_id: string }).user_id) ?? "");
    },
    async replaceForDraw(drawId, winners) {
      const db = supabaseAdmin();
      await db.from("winners").delete().eq("draw_id", drawId);
      if (winners.length === 0) return [];
      const { data, error } = await db
        .from("winners")
        .insert(
          winners.map((w) => ({
            draw_id: w.drawId,
            user_id: w.userId,
            tier: w.tier,
            matched_count: w.matchedCount,
            amount: w.amount,
            proof_url: w.proofUrl,
            status: w.status,
            verified_by: w.verifiedBy,
            paid_at: w.paidAt,
          })),
        )
        .select();
      const rows = must(data, error);
      const names = await namesFor(rows.map((r) => r.user_id));
      return rows.map((r) => toWinner(r, names.get(r.user_id) ?? ""));
    },
  },

  donations: {
    async listByUser(userId) {
      const { data, error } = await supabaseAdmin().from("donations").select("*").eq("user_id", userId);
      return must(data, error).map(toDonation);
    },
    async list() {
      const { data, error } = await supabaseAdmin().from("donations").select("*");
      return must(data, error).map(toDonation);
    },
    async create(d) {
      const { data, error } = await supabaseAdmin()
        .from("donations")
        .insert({ user_id: d.userId, charity_id: d.charityId, amount: d.amount })
        .select()
        .single();
      return toDonation(must(data, error));
    },
  },
};
