/**
 * Supabase Storage helpers (SystemDesign §09).
 *
 * Winner proof screenshots go to the private `winner-proofs` bucket and are
 * served to admins via short-lived signed URLs. Uses the service-role client
 * (trusted server). Falls back to a marker string when Supabase isn't
 * configured so the in-memory demo doesn't crash.
 */
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";

export const PROOF_BUCKET = "winner-proofs";
export const AVATAR_BUCKET = "avatars";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/**
 * Upload a user avatar to the public `avatars` bucket.
 * Returns a public URL (with a cache-busting query) or null in demo mode.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  if (!file || file.size === 0) throw new Error("Please choose an image");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5 MB or smaller");
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Upload a PNG, JPG or WEBP");

  if (!isSupabaseConfigured()) return null; // demo mode — no real storage

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin()
    .storage.from(AVATAR_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin().storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // Cache-bust so the new image shows immediately after re-upload.
  return `${data.publicUrl}?v=${Date.now()}`;
}

/** Upload a winner proof file. Returns the storage path stored on the winner. */
export async function uploadProof(
  userId: string,
  winnerId: string,
  file: File,
): Promise<string> {
  if (!file || file.size === 0) throw new Error("Please choose a file");
  if (file.size > MAX_BYTES) throw new Error("File must be 5 MB or smaller");
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Upload a PNG, JPG, WEBP or PDF");
  }

  if (!isSupabaseConfigured()) {
    return `local:${file.name}`; // demo mode — no real storage
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${winnerId}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin()
    .storage.from(PROOF_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

/** Generate a short-lived signed URL for an admin to view a proof. */
export async function getProofSignedUrl(
  path: string | null,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path || path.startsWith("local:")) return null;
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabaseAdmin()
    .storage.from(PROOF_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}
