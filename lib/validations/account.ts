import { z } from "zod";
import { AUTH_CONSTANTS } from "@/lib/constants/auth";

/**
 * Account fields (TRI-16, USET-02/03): birthday (13+ age gate), phone, language, timezone, and the
 * DELETE /me/account confirmation. Shared by PATCH /user/profile and the Better-Auth config (sign-up and
 * `/update-user`), so every path that writes a field applies the same rule.
 */

const BIRTHDAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** Whole years between a 'YYYY-MM-DD' birthday and `today` (UTC calendar date). */
export function ageOn(birthday: string, today: Date = new Date()): number {
  const [y, m, d] = birthday.split("-").map(Number);
  const ty = today.getUTCFullYear();
  const tm = today.getUTCMonth() + 1;
  const td = today.getUTCDate();
  const hadBirthday = tm > m || (tm === m && td >= d);
  return ty - y - (hadBirthday ? 0 : 1);
}

/** A real calendar date: '2011-02-30' is not. */
function isCalendarDate(value: string): boolean {
  if (!BIRTHDAY_FORMAT.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export type BirthdayProblem = "BIRTHDAY_REQUIRED" | "BIRTHDAY_INVALID" | "UNDER_MIN_AGE";

/** Why a birthday is not acceptable, or null when it is. Used where a specific error code is returned (sign-up). */
export function birthdayProblem(value: unknown, today: Date = new Date()): BirthdayProblem | null {
  if (value === undefined || value === null || value === "") return "BIRTHDAY_REQUIRED";
  if (typeof value !== "string" || !isCalendarDate(value)) return "BIRTHDAY_INVALID";
  if (value > today.toISOString().slice(0, 10)) return "BIRTHDAY_INVALID"; // in the future
  const age = ageOn(value, today);
  if (age > 130) return "BIRTHDAY_INVALID";
  if (age < AUTH_CONSTANTS.MIN_AGE) return "UNDER_MIN_AGE";
  return null;
}

export const BIRTHDAY_MESSAGES: Record<BirthdayProblem, string> = {
  BIRTHDAY_REQUIRED: "Birthday is required",
  BIRTHDAY_INVALID: "Birthday must be a real date in YYYY-MM-DD format",
  UNDER_MIN_AGE: `You must be at least ${AUTH_CONSTANTS.MIN_AGE} years old to use Tribe`,
};

/** 'YYYY-MM-DD', a real past date, age 13–130. */
export const birthdaySchema = z.string().superRefine((value, ctx) => {
  const problem = birthdayProblem(value);
  if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, message: BIRTHDAY_MESSAGES[problem], params: { code: problem } });
});

/** Free text with light checks: digits and + ( ) - . space, 5–20 digits. `null` or "" clears it. */
export const phoneSchema = z
  .union([z.string(), z.null()])
  .transform((value) => (value === null ? null : value.trim().replace(/\s+/g, " ")))
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value.length <= 32, "Phone number is too long")
  .refine((value) => value === null || /^\+?[0-9 ().-]+$/.test(value), "Phone number may contain digits, spaces and + ( ) - . only")
  .refine((value) => {
    if (value === null) return true;
    const digits = value.replace(/\D/g, "").length;
    return digits >= 5 && digits <= 20;
  }, "Phone number must have 5 to 20 digits");

/** A BCP-47 language tag ('en', 'es', 'pt-BR'), stored canonical ('en-us' → 'en-US'). */
export const languageSchema = z
  .string()
  .trim()
  .max(35, "Language tag is too long")
  .regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, "Language must be a language code like 'en' or 'pt-BR'")
  .transform((value, ctx) => {
    try {
      return Intl.getCanonicalLocales(value)[0];
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Language must be a valid BCP-47 tag" });
      return z.NEVER;
    }
  });

/** An IANA time zone name the runtime knows ('America/New_York', 'UTC'). `null` clears it. */
export const timezoneSchema = z.union([
  z.null(),
  z
    .string()
    .trim()
    .min(1, "Time zone is required")
    .max(64, "Time zone is too long")
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Time zone must be an IANA name such as 'America/New_York'"),
]);

/**
 * DELETE /me/account body. `confirmation` must be exactly "DELETE" (same field as DELETE /tribes/{id});
 * `confirm` is accepted as an alias. `mode`, if sent, must be "delete" (deactivate is TRI-293, not built).
 */
export const deleteAccountSchema = z
  .object({
    confirmation: z.string().optional(),
    confirm: z.string().optional(),
    mode: z.literal("delete", { errorMap: () => ({ message: "Only mode 'delete' is supported" }) }).optional(),
  })
  .refine((body) => (body.confirmation ?? body.confirm) === "DELETE", {
    message: 'Type "DELETE" to confirm',
    path: ["confirmation"],
  });
