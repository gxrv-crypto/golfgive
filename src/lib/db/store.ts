/**
 * In-memory data store — the default persistence layer.
 *
 * It runs the entire app with zero external configuration (great for the demo
 * and tests) and is hidden behind the repository interfaces in `repositories.ts`,
 * so swapping to Supabase later is a drop-in change.
 *
 * A `globalThis` singleton keeps data stable across Next.js hot reloads.
 */
import type {
  Profile,
  Subscription,
  Score,
  Charity,
  Draw,
  Winner,
  Donation,
} from "@/types";

export interface DbShape {
  // email -> plaintext password (demo only; real auth uses Supabase Auth).
  credentials: Map<string, string>;
  profiles: Map<string, Profile>;
  subscriptions: Map<string, Subscription>;
  scores: Map<string, Score>;
  charities: Map<string, Charity>;
  draws: Map<string, Draw>;
  winners: Map<string, Winner>;
  donations: Map<string, Donation>;
}

function seed(): DbShape {
  const now = new Date().toISOString();

  const charities: Charity[] = [
    {
      id: "ch_hope",
      name: "Hope Foundation",
      category: "Children",
      description:
        "Providing education, nutrition and safe shelter to underprivileged children across India.",
      mission:
        "Every child deserves a fair start. We fund schools, meals and mentorship so potential is never wasted.",
      imageUrl:
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      isFeatured: true,
      raised: 1_842_000,
      events: [
        {
          id: "ev_hope_1",
          title: "Charity Golf Day — Pune",
          date: "2026-08-15",
          location: "Oxford Golf Resort, Pune",
        },
      ],
      createdAt: now,
    },
    {
      id: "ch_green",
      name: "GreenEarth Trust",
      category: "Environment",
      description:
        "Restoring native forests and protecting watersheds through community-led planting.",
      mission:
        "We plant resilient ecosystems, not just trees — bringing back biodiversity and clean water.",
      imageUrl:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
      isFeatured: true,
      raised: 967_500,
      events: [],
      createdAt: now,
    },
    {
      id: "ch_paws",
      name: "Paws & Care",
      category: "Animals",
      description:
        "Rescue, rehabilitation and rehoming for abandoned and injured animals.",
      mission:
        "A kinder city for every stray — through rescue, sterilisation and loving adoption.",
      imageUrl:
        "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
      isFeatured: false,
      raised: 512_300,
      events: [
        {
          id: "ev_paws_1",
          title: "Adoption Drive",
          date: "2026-07-05",
          location: "Bandra, Mumbai",
        },
      ],
      createdAt: now,
    },
    {
      id: "ch_elders",
      name: "Silver Years",
      category: "Elderly",
      description:
        "Companionship, healthcare and dignity for elderly citizens living alone.",
      mission:
        "No elder should feel forgotten. We bring care, community and joy to their later years.",
      imageUrl:
        "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80",
      isFeatured: false,
      raised: 388_900,
      events: [],
      createdAt: now,
    },
  ];

  const admin: Profile = {
    id: "u_admin",
    email: "admin@golfgive.app",
    name: "Aria Admin",
    role: "admin",
    charityId: null,
    charityPct: 10,
    luckyNumbers: [],
    createdAt: now,
  };

  const subscriber: Profile = {
    id: "u_demo",
    email: "player@golfgive.app",
    name: "Sam Subscriber",
    role: "subscriber",
    charityId: "ch_hope",
    charityPct: 15,
    luckyNumbers: [7, 12, 23, 34, 41],
    createdAt: now,
  };

  const credentials = new Map<string, string>([
    [admin.email, "admin1234"],
    [subscriber.email, "player1234"],
  ]);

  const subscription: Subscription = {
    id: "sub_demo",
    userId: subscriber.id,
    plan: "yearly",
    status: "active",
    razorpaySubscriptionId: null,
    razorpayCustomerId: null,
    currentPeriodEnd: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 300,
    ).toISOString(),
    createdAt: now,
  };

  // Five rolling demo scores, reverse-chronological friendly.
  const scoreValues: Array<[string, number]> = [
    ["2026-06-18", 38],
    ["2026-06-11", 31],
    ["2026-06-04", 42],
    ["2026-05-28", 27],
    ["2026-05-21", 34],
  ];
  const scores = scoreValues.map<Score>(([playedOn, value], i) => ({
    id: `sc_${i}`,
    userId: subscriber.id,
    value,
    playedOn,
    createdAt: now,
  }));

  const lastDraw: Draw = {
    id: "draw_2026_05",
    period: "2026-05",
    logic: "random",
    status: "published",
    winningNumbers: [7, 12, 19, 34, 45],
    poolTotal: 240_000,
    jackpotCarry: 96_000,
    publishedAt: now,
    createdAt: now,
  };

  const winner: Winner = {
    id: "win_demo",
    drawId: lastDraw.id,
    userId: subscriber.id,
    userName: subscriber.name,
    tier: "three",
    matchedCount: 3,
    amount: 20_000,
    proofUrl: null,
    status: "pending",
    verifiedBy: null,
    paidAt: null,
    createdAt: now,
  };

  return {
    credentials,
    profiles: new Map([admin, subscriber].map((p) => [p.id, p])),
    subscriptions: new Map([[subscription.id, subscription]]),
    scores: new Map(scores.map((s) => [s.id, s])),
    charities: new Map(charities.map((c) => [c.id, c])),
    draws: new Map([[lastDraw.id, lastDraw]]),
    winners: new Map([[winner.id, winner]]),
    donations: new Map(),
  };
}

const globalForDb = globalThis as unknown as { __golfgiveDb?: DbShape };

export const db: DbShape = globalForDb.__golfgiveDb ?? seed();
if (process.env.NODE_ENV !== "production") globalForDb.__golfgiveDb = db;

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
