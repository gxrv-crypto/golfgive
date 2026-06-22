/**
 * Apply SQL files in supabase/migrations/ to your project.
 *
 * Supabase's JS client can't run DDL, so this uses the Management API.
 * Set a personal access token (https://supabase.com/dashboard/account/tokens):
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx  (add to .env.local)
 *   npm run migrate
 *
 * Without a token it just prints the SQL to paste into the Supabase SQL editor.
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "supabase", "migrations");

const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
if (files.length === 0) {
  console.log("No migrations found.");
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token || !ref) {
  console.log("ℹ No SUPABASE_ACCESS_TOKEN — paste these into the Supabase SQL editor:\n");
  for (const f of files) {
    console.log(`-- ${f}`);
    console.log(readFileSync(join(dir, f), "utf8"));
  }
  process.exit(0);
}

for (const f of files) {
  const query = readFileSync(join(dir, f), "utf8");
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    console.error(`✗ ${f}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  console.log(`✓ applied ${f}`);
}
console.log("✓ migrations complete");
