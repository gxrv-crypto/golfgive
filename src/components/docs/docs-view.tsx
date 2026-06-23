"use client";
import * as React from "react";
import Link from "next/link";
import {
  Rocket,
  Terminal,
  Database,
  Plug,
  ShieldCheck,
  Gauge,
  Upload,
  Code2,
  Layers,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* --------------------------- small content blocks -------------------------- */

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border bg-muted/60 p-4 text-sm leading-relaxed">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 text-sm leading-7 text-muted-foreground">{children}</div>;
}

function VarTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Variable</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Purpose</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(([name, def, purpose]) => (
            <tr key={name}>
              <td className="px-4 py-2 align-top font-mono text-xs text-foreground">{name}</td>
              <td className="px-4 py-2 align-top font-mono text-xs">{def}</td>
              <td className="px-4 py-2 align-top text-muted-foreground">{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------- section data ------------------------------ */

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "overview",
    label: "Overview",
    icon: BookOpen,
    body: (
      <Prose>
        <p>
          <strong className="text-foreground">GolfGive</strong> combines golf score
          tracking, monthly draw-based prizes, and charitable giving in one
          subscription platform. It runs <strong className="text-foreground">fully
          without any external services</strong> thanks to a seeded in-memory data
          layer and mock payment/email adapters — then upgrades to Supabase,
          Razorpay, Resend and Upstash purely through environment variables.
        </p>
        <p>
          This page mirrors the repo docs:{" "}
          <Link href="/docs#setup" className="text-primary underline-offset-4 hover:underline">Setup</Link>,{" "}
          <Link href="/docs#api" className="text-primary underline-offset-4 hover:underline">API</Link> and{" "}
          <Link href="/docs#architecture" className="text-primary underline-offset-4 hover:underline">Architecture</Link>.
          For the full markdown, see <Code>README.md</Code>, <Code>API.md</Code> and{" "}
          <Code>ARCHITECTURE.md</Code> in the repository.
        </p>
      </Prose>
    ),
  },
  {
    id: "quickstart",
    label: "Quick start",
    icon: Rocket,
    body: (
      <Prose>
        <p>Zero config — the app boots with demo data and mock integrations:</p>
        <CodeBlock>{`npm install
npm run dev
# open http://localhost:3000`}</CodeBlock>
        <p>Demo credentials:</p>
        <VarTable
          rows={[
            ["player@golfgive.app", "player1234", "Subscriber"],
            ["admin@golfgive.app", "admin1234", "Admin"],
          ]}
        />
      </Prose>
    ),
  },
  {
    id: "setup",
    label: "Setup guide",
    icon: Terminal,
    body: (
      <Prose>
        <p>
          To run against real Supabase Auth + Postgres + Storage, create a Supabase
          project and copy its keys into <Code>.env.local</Code> (see{" "}
          <Code>.env.example</Code>):
        </p>
        <CodeBlock>{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ACCESS_TOKEN=sbp_...   # personal access token (for db:push)`}</CodeBlock>
        <p>Then provision the database and storage buckets, and seed demo data:</p>
        <CodeBlock>{`npm run db:push       # applies supabase/schema.sql + creates buckets
npm run create:admin  # admin@golfgive.app / admin1234
npm run seed          # charities + demo subscriber + a published draw`}</CodeBlock>
        <p>
          <Code>supabase/schema.sql</Code> is the single source of truth — schema
          and all past migrations are consolidated into one idempotent file. Without
          a <Code>SUPABASE_ACCESS_TOKEN</Code>, <Code>db:push</Code> prints the SQL
          for you to paste into the Supabase SQL editor.
        </p>
      </Prose>
    ),
  },
  {
    id: "configuration",
    label: "Configuration",
    icon: Plug,
    body: (
      <Prose>
        <p>Every integration is optional and independent. Add keys to enable each:</p>
        <VarTable
          rows={[
            ["NEXT_PUBLIC_SUPABASE_URL / *_ANON_KEY", "—", "Switch on Supabase Auth + DB"],
            ["SUPABASE_SERVICE_ROLE_KEY", "—", "Trusted server data + storage access"],
            ["RAZORPAY_KEY_ID / _SECRET", "—", "Real subscription checkout + webhook"],
            ["RESEND_API_KEY", "—", "Send real transactional emails"],
            ["UPSTASH_REDIS_REST_URL / _TOKEN", "—", "Shared rate-limit counters"],
            ["ROLE_ENCRYPTION_KEY", "—", "32-byte AES-256-GCM role key (prod)"],
          ]}
        />
        <p>
          Check live status any time at <Code>GET /api/health</Code>.
        </p>
      </Prose>
    ),
  },
  {
    id: "database",
    label: "Database",
    icon: Database,
    body: (
      <Prose>
        <p>
          The data model lives in <Code>supabase/schema.sql</Code>: profiles,
          charities + events, subscriptions, scores, draws + prize pools, winners,
          donations and api_keys. Key invariants are enforced at the DB level:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Stableford range check (1–45) on scores.</li>
          <li>One score per <Code>(user, date)</Code>.</li>
          <li>Rolling last-5 scores via the <Code>trim_scores</Code> trigger.</li>
          <li>Row Level Security on every user-owned table.</li>
        </ul>
        <p>Apply it (and create buckets) with a single command:</p>
        <CodeBlock>{`npm run db:push`}</CodeBlock>
      </Prose>
    ),
  },
  {
    id: "api",
    label: "API reference",
    icon: Code2,
    body: (
      <Prose>
        <p>
          GolfGive is API-first: the same services that back the UI are exposed as
          REST handlers under <Code>src/app/api</Code>. Auth is cookie-based; writes
          are Zod-validated and return <Code>{`{ error }`}</Code> with{" "}
          <Code>400</Code> on failure.
        </p>
        <VarTable
          rows={[
            ["GET /api/health", "public", "Service + integration status"],
            ["GET /api/charities", "public", "Charity directory"],
            ["GET /api/scores", "auth", "Current user's scores (last 5)"],
            ["POST /api/scores", "auth", "Add a score { value, playedOn }"],
            ["POST /api/webhooks/razorpay", "signed", "Subscription lifecycle webhook"],
          ]}
        />
        <p>Example — add a score:</p>
        <CodeBlock>{`curl -X POST http://localhost:3000/api/scores \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{ "value": 41, "playedOn": "2026-06-20" }'`}</CodeBlock>
        <p>
          Full details (status codes, payloads, Server Actions) are in{" "}
          <Code>API.md</Code>.
        </p>
      </Prose>
    ),
  },
  {
    id: "rate-limiting",
    label: "Rate limiting",
    icon: Gauge,
    body: (
      <Prose>
        <p>
          Every <Code>/api/*</Code> route is wrapped by a fixed-window limiter keyed
          on <Code>endpoint + client IP</Code> (<Code>src/lib/rate-limit.ts</Code>).
          It uses Upstash Redis when configured, otherwise an in-memory store, and
          always fails open. Over-limit callers get <Code>429</Code> with{" "}
          <Code>Retry-After</Code> and <Code>X-RateLimit-*</Code> headers.
        </p>
        <VarTable
          rows={[
            ["RATE_LIMIT_ENABLED", "true", "Master on/off switch"],
            ["RATE_LIMIT_MAX", "60", "Requests per window (per IP + endpoint)"],
            ["RATE_LIMIT_WINDOW", "60", "Window length in seconds"],
          ]}
        />
      </Prose>
    ),
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: Upload,
    body: (
      <Prose>
        <p>
          Avatars and charity images upload to Supabase Storage (public{" "}
          <Code>avatars</Code> / <Code>charity-media</Code> buckets); winner proofs
          go to the private <Code>winner-proofs</Code> bucket served via signed URLs.
          Since Server Actions cap bodies at 1 MB by default, the limit is raised:
        </p>
        <VarTable
          rows={[
            ["SERVER_ACTIONS_BODY_SIZE_LIMIT", "6mb", "Max Server Action body size"],
            ["CHARITY_IMAGE_MAX_MB", "5", "Max charity image upload size"],
          ]}
        />
      </Prose>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    body: (
      <Prose>
        <p>Access control is layered (defence in depth):</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Cookie gate in middleware on protected routes.</li>
          <li>AES-256-GCM encrypted role cookie (demo mode).</li>
          <li>Server-side RBAC via <Code>requireRole(...)</Code> in every action/route.</li>
          <li>Postgres Row Level Security as the backstop.</li>
        </ol>
        <p>
          Set a 32-byte <Code>ROLE_ENCRYPTION_KEY</Code> in production and keep the
          service-role key server-only.
        </p>
      </Prose>
    ),
  },
  {
    id: "architecture",
    label: "Architecture",
    icon: Layers,
    body: (
      <Prose>
        <p>Layered design — each layer has one job:</p>
        <CodeBlock>{`Browser ─▶ Next.js (App Router, RSC + Server Actions)
   middleware │ cookie gate on /dashboard /admin /subscribe
   Actions / Route handlers │ Zod · RBAC · rate limit
   Domain services │ business rules (rolling-5, prize tiers…)
   Repositories (interface)
      ├── In-memory store  ← default (demo)
      └── Supabase adapter ← env-activated`}</CodeBlock>
        <p>
          Services never know which repository backs them, so the in-memory store
          swaps for Supabase with no UI or logic changes. Full diagrams and the
          request lifecycle are in <Code>ARCHITECTURE.md</Code>.
        </p>
      </Prose>
    ),
  },
];

/* --------------------------------- view ----------------------------------- */

export function DocsView() {
  const [active, setActive] = React.useState(SECTIONS[0].id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Trigger as a heading nears the top of the viewport.
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 lg:py-14">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documentation
          </p>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {s.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <header className="mb-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Setup, API reference and architecture for the GolfGive platform.
          </p>
        </header>

        {/* Mobile section pills */}
        <div className="mb-8 flex flex-wrap gap-2 lg:hidden">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="space-y-14">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
                <s.icon className="size-5 text-primary" />
                {s.label}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
