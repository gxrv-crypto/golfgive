/**
 * Create (or promote) an admin user in Supabase.
 *
 * Prerequisites:
 *   1. Run `supabase/schema.sql` in your Supabase project (creates `profiles`).
 *   2. Have SUPABASE creds in .env.local.
 *
 * Usage (Node 20.6+ auto-loads the env file):
 *   npm run create:admin
 *   npm run create:admin -- admin@you.com "Your Name" yourpassword
 *
 * Or directly:
 *   node --env-file=.env.local scripts/create-admin.mjs [email] [name] [password]
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Run with: node --env-file=.env.local scripts/create-admin.mjs",
  );
  process.exit(1);
}

const email = process.argv[2] ?? "admin@golfgive.app";
const name = process.argv[3] ?? "Aria Admin";
const password = process.argv[4] ?? "admin1234";

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  // Paginate through admin user list to find an existing account.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  console.log(`→ Ensuring admin: ${email}`);

  // 1. Create the auth user (or reuse the existing one).
  let userId;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createErr) {
    const exists =
      createErr.status === 422 || /already.*registered|exists/i.test(createErr.message);
    if (!exists) throw createErr;
    console.log("• Auth user already exists — reusing it.");
    const existing = await findUserByEmail(email);
    if (!existing) throw new Error("User reported as existing but not found via listUsers.");
    userId = existing.id;
    // Make sure the password matches what was requested.
    await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
  } else {
    userId = created.user.id;
    console.log("• Auth user created.");
  }

  // 2. Upsert the profile row with the admin role.
  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      name,
      role: "admin",
      charity_pct: 10,
      lucky_numbers: [],
    },
    { onConflict: "id" },
  );
  if (profileErr) throw profileErr;

  console.log("✓ Admin ready");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  user id:  ${userId}`);
}

main().catch((err) => {
  console.error("✗ Failed:", err.message ?? err);
  process.exit(1);
});
