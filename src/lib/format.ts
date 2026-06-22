import { APP } from "@/lib/config";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP.locale, {
    style: "currency",
    currency: APP.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(APP.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString(APP.locale, {
    month: "long",
    year: "numeric",
  });
}

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
