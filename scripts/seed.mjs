/**
 * Seed the Supabase project with demo data matching the in-memory seed:
 * charities, a demo subscriber (with subscription, scores, lucky numbers),
 * and a published draw with one pending winner.
 *
 * Prereqs: run `supabase/schema.sql` first. Idempotent — safe to re-run.
 *
 * Usage:  npm run seed
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ Missing Supabase env. Run: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CHARITIES = [
  {
    name: "Hope Foundation",
    category: "Children",
    description: "Providing education, nutrition and safe shelter to underprivileged children across India.",
    mission: "Every child deserves a fair start. We fund schools, meals and mentorship so potential is never wasted.",
    image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    is_featured: true,
    raised: 1842000,
  },
  {
    name: "GreenEarth Trust",
    category: "Environment",
    description: "Restoring native forests and protecting watersheds through community-led planting.",
    mission: "We plant resilient ecosystems, not just trees — bringing back biodiversity and clean water.",
    image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    is_featured: true,
    raised: 967500,
  },
  {
    name: "Paws & Care",
    category: "Animals",
    description: "Rescue, rehabilitation and rehoming for abandoned and injured animals.",
    mission: "A kinder city for every stray — through rescue, sterilisation and loving adoption.",
    image_url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    is_featured: false,
    raised: 512300,
  },
  {
    name: "Silver Years",
    category: "Elderly",
    description: "Companionship, healthcare and dignity for elderly citizens living alone.",
    mission: "No elder should feel forgotten. We bring care, community and joy to their later years.",
    image_url: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80",
    is_featured: false,
    raised: 388900,
  },
];

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function seedCharities() {
  const { data: existing } = await db.from("charities").select("id, name");
  if (existing && existing.length > 0) {
    console.log(`• Charities already present (${existing.length}) — skipping insert.`);
    return existing;
  }
  const { data, error } = await db.from("charities").insert(CHARITIES).select("id, name");
  if (error) throw error;
  console.log(`• Inserted ${data.length} charities.`);
  return data;
}

async function ensureUser(email, password, name) {
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw error;
    user = data.user;
    console.log(`• Created auth user ${email}`);
  } else {
    await db.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    console.log(`• Reusing auth user ${email}`);
  }
  return user.id;
}

async function main() {
  const charities = await seedCharities();
  const firstCharity = charities[0]?.id ?? null;

  // Demo subscriber
  const userId = await ensureUser("player@golfgive.app", "player1234", "Sam Subscriber");
  await db.from("profiles").upsert(
    {
      id: userId,
      email: "player@golfgive.app",
      name: "Sam Subscriber",
      role: "subscriber",
      charity_id: firstCharity,
      charity_pct: 15,
      lucky_numbers: [7, 12, 23, 34, 41],
    },
    { onConflict: "id" },
  );

  // Subscription
  const { data: sub } = await db.from("subscriptions").select("id").eq("user_id", userId).maybeSingle();
  const periodEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 300).toISOString();
  if (sub) {
    await db.from("subscriptions").update({ plan: "yearly", status: "active", current_period_end: periodEnd }).eq("id", sub.id);
  } else {
    await db.from("subscriptions").insert({ user_id: userId, plan: "yearly", status: "active", current_period_end: periodEnd });
  }

  // Scores (reset to a known set of 5)
  await db.from("scores").delete().eq("user_id", userId);
  await db.from("scores").insert(
    [
      ["2026-06-18", 38],
      ["2026-06-11", 31],
      ["2026-06-04", 42],
      ["2026-05-28", 27],
      ["2026-05-21", 34],
    ].map(([played_on, value]) => ({ user_id: userId, value, played_on })),
  );

  // Published draw
  let { data: draw } = await db.from("draws").select("id").eq("period", "2026-05").maybeSingle();
  if (!draw) {
    const { data } = await db
      .from("draws")
      .insert({
        period: "2026-05",
        logic: "random",
        status: "published",
        winning_numbers: [7, 12, 19, 34, 45],
        pool_total: 240000,
        jackpot_carry: 96000,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    draw = data;
  }

  // Winner for the demo user
  const { data: existingWin } = await db
    .from("winners")
    .select("id")
    .eq("draw_id", draw.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!existingWin) {
    await db.from("winners").insert({
      draw_id: draw.id,
      user_id: userId,
      tier: "three",
      matched_count: 3,
      amount: 20000,
      status: "pending",
    });
  }

  console.log("✓ Seed complete");
  console.log("  Subscriber: player@golfgive.app / player1234");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
