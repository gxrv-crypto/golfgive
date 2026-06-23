/**
 * Shared password-strength rules used by validation (server) and the
 * strength meter (client). A strong password needs 8+ chars with lowercase,
 * uppercase and a number; a symbol is encouraged but not required.
 */
export interface PasswordChecks {
  length: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  symbol: boolean;
}

export function passwordChecks(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
}

/** Required rules (symbol is a bonus, not required). */
export function isStrongPassword(pw: string): boolean {
  const c = passwordChecks(pw);
  return c.length && c.lower && c.upper && c.number;
}

/** 0–4 strength score for the meter. */
export function passwordScore(pw: string): number {
  const c = passwordChecks(pw);
  return [c.length, c.lower, c.upper, c.number, c.symbol].filter(Boolean).length - 1;
}
