import { ZodError } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Normalise any thrown error into a friendly ActionResult. */
export function toError(err: unknown): { ok: false; error: string } {
  if (err instanceof ZodError) {
    return { ok: false, error: err.issues[0]?.message ?? "Invalid input" };
  }
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return { ok: false, error: "Please log in" };
    if (err.message === "FORBIDDEN") return { ok: false, error: "Not allowed" };
    return { ok: false, error: err.message };
  }
  // Non-Error throws (e.g. Razorpay/Supabase reject with plain objects).
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const rzp = e.error as { description?: string } | undefined;
    const msg =
      rzp?.description ??
      (typeof e.message === "string" ? e.message : undefined) ??
      (typeof e.msg === "string" ? e.msg : undefined);
    if (msg) {
      console.error("[action error]", err);
      return { ok: false, error: msg };
    }
  }
  console.error("[action error]", err);
  return { ok: false, error: "Something went wrong" };
}
