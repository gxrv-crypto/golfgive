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
  return { ok: false, error: "Something went wrong" };
}
