/**
 * One-shot Supabase provisioning: applies the database schema AND creates the
 * storage buckets the app needs. Idempotent — safe to re-run.
 *
 *   npm run db:push
 *
 * SQL is applied via the Supabase Management API (DDL can't run through the JS
 * client). You need a personal access token:
 *   https://supabase.com/dashboard/account/tokens
 *
 * .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...      # required for storage buckets
 *   SUPABASE_ACCESS_TOKEN=sbp_...      # required to apply schema.sql
 *
 * Without SUPABASE_ACCESS_TOKEN the schema is printed for you to paste into the
 * Supabase SQL editor; bucket creation still runs if the service key is present.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "supabase", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const token = process.env.SUPABASE_ACCESS_TOKEN;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/* ----------------------------- 1. schema ------------------------------- */
async function applySchema() {
  if (!token || !ref) {
    console.log(
      "ℹ No SUPABASE_ACCESS_TOKEN (or URL) — paste supabase/schema.sql into the Supabase SQL editor:\n",
    );
    console.log(schema);
    return;
  }
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: schema }),
  });
  if (!res.ok) {
    console.error(`✗ schema: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  console.log("✓ schema applied");
}

/* ----------------------------- 2. buckets ------------------------------ */
const BUCKETS = [
  { name: "winner-proofs", public: false, fileSizeLimit: "5MB" },
  { name: "charity-media", public: true, fileSizeLimit: "5MB" },
  { name: "avatars", public: true, fileSizeLimit: "2MB" },
];

async function applyBuckets() {
  if (!url || !serviceKey) {
    console.log("ℹ No SUPABASE_SERVICE_ROLE_KEY — skipping storage buckets.");
    return;
  }
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  for (const b of BUCKETS) {
    const { error } = await db.storage.createBucket(b.name, {
      public: b.public,
      fileSizeLimit: b.fileSizeLimit,
    });
    if (error) {
      if (/already exists/i.test(error.message)) {
        console.log(`• bucket ${b.name} already exists`);
      } else {
        console.error(`✗ bucket ${b.name}: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.log(`✓ bucket ${b.name} (${b.public ? "public" : "private"})`);
    }
  }
}

await applySchema();
await applyBuckets();
console.log("✓ db:push complete");
