/**
 * Supabase service-role client (trusted server only).
 *
 * The data repository uses this so server-side service logic always works
 * regardless of RLS. Access control is still enforced in the app layer
 * (action/route guards + per-user filters in services); RLS remains as
 * defence-in-depth for any direct/client access. NEVER import this in client code.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return cached;
}
