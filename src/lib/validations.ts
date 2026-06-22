/**
 * Zod schemas — the single validation contract enforced on every write path
 * (API routes, server actions and forms all reuse these).
 */
import { z } from "zod";
import { SCORE, MIN_CHARITY_PCT, DRAW } from "@/lib/config";

export const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const scoreSchema = z.object({
  value: z
    .number({ message: "Score is required" })
    .int("Whole numbers only")
    .min(SCORE.min, `Minimum ${SCORE.min}`)
    .max(SCORE.max, `Maximum ${SCORE.max}`),
  playedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")
    .refine((d) => new Date(d) <= new Date(), "Date can't be in the future"),
});
export type ScoreInput = z.infer<typeof scoreSchema>;

export const charitySelectionSchema = z.object({
  charityId: z.string().min(1, "Choose a charity"),
  charityPct: z
    .number()
    .min(MIN_CHARITY_PCT, `Minimum ${MIN_CHARITY_PCT}%`)
    .max(100, "Maximum 100%"),
});
export type CharitySelectionInput = z.infer<typeof charitySelectionSchema>;

export const luckyNumbersSchema = z.object({
  numbers: z
    .array(z.number().int().min(DRAW.min).max(DRAW.max))
    .length(DRAW.pick, `Pick exactly ${DRAW.pick} numbers`)
    .refine((n) => new Set(n).size === n.length, "Numbers must be unique"),
});
export type LuckyNumbersInput = z.infer<typeof luckyNumbersSchema>;

export const subscribeSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  charityId: z.string().min(1, "Choose a charity"),
  charityPct: z.number().min(MIN_CHARITY_PCT).max(100).default(MIN_CHARITY_PCT),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;

export const charityUpsertSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  description: z.string().min(10),
  mission: z.string().min(10),
  imageUrl: z.string().url().or(z.literal("")),
  isFeatured: z.boolean().default(false),
});
export type CharityUpsertInput = z.infer<typeof charityUpsertSchema>;

export const runDrawSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
  logic: z.enum(["random", "algorithmic"]),
  publish: z.boolean().default(false),
});
export type RunDrawInput = z.infer<typeof runDrawSchema>;

export const donationSchema = z.object({
  charityId: z.string().min(1),
  amount: z.number().positive("Enter an amount"),
});
export type DonationInput = z.infer<typeof donationSchema>;
