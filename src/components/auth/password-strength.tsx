"use client";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { passwordChecks, passwordScore } from "@/lib/password";

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-secondary",
  "bg-success",
];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const checks = passwordChecks(value);
  const score = passwordScore(value); // 0..4
  const requirements: { ok: boolean; label: string }[] = [
    { ok: checks.length, label: "8+ characters" },
    { ok: checks.lower, label: "lowercase" },
    { ok: checks.upper, label: "uppercase" },
    { ok: checks.number, label: "number" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= score ? BAR_COLORS[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium text-foreground">{LABELS[score]}</span>
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {requirements.map((r) => (
          <li
            key={r.label}
            className={cn(
              "flex items-center gap-1 text-xs",
              r.ok ? "text-success" : "text-muted-foreground",
            )}
          >
            {r.ok ? <Check className="size-3" /> : <X className="size-3" />}
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
