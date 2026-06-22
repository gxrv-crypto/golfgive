/**
 * AES-256-GCM helpers for the encrypted role claim (SystemDesign §04).
 * The role is never stored in plaintext in the session cookie.
 */
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const raw = process.env.ROLE_ENCRYPTION_KEY ?? "dev-only-insecure-key-change-me!";
  // Derive a stable 32-byte key regardless of provided length.
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(token: string): string | null {
  try {
    const [ivB, tagB, dataB] = token.split(".");
    const iv = Buffer.from(ivB, "base64url");
    const tag = Buffer.from(tagB, "base64url");
    const data = Buffer.from(dataB, "base64url");
    const decipher = crypto.createDecipheriv(ALGO, key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
