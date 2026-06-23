/**
 * Create the Supabase Storage buckets the app uses (SystemDesign §09).
 * Idempotent — safe to re-run.
 *
 *   npm run setup:storage
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ Missing Supabase env. Run: node --env-file=.env.local scripts/setup-storage.mjs");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const BUCKETS = [
  { name: "winner-proofs", public: false, fileSizeLimit: "5MB" },
  { name: "charity-media", public: true, fileSizeLimit: "5MB" },
  { name: "avatars", public: true, fileSizeLimit: "2MB" },
];

for (const b of BUCKETS) {
  const { error } = await db.storage.createBucket(b.name, {
    public: b.public,
    fileSizeLimit: b.fileSizeLimit,
  });
  if (error) {
    if (/already exists/i.test(error.message)) {
      console.log(`• ${b.name} already exists`);
    } else {
      console.error(`✗ ${b.name}: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log(`✓ created ${b.name} (${b.public ? "public" : "private"})`);
  }
}
console.log("✓ storage ready");
