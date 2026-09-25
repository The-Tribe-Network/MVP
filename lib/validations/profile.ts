import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Step 1: Avatar, Display Name, Bio
export const profileStep1Schema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .trim(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),
  avatar: z
    .union([uuidSchema, z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

// Step 2: Username
export const profileStep2Schema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim()
    .refine((val) => !val.startsWith("_"), {
      message: "Username cannot start with underscore",
    })
    .transform((val) => val.toLowerCase()),
});

// Step 3: Location (reuse tribe location pattern)
export const profileStep3Schema = z.object({
  location: z
    .string()
    .min(1, "Location is required")
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return parsed?.placeId != null && parsed?.displayName != null;
        } catch {
          return false;
        }
      },
      { message: "Location must be selected from the dropdown" }
    ),
});

// ── Social links (TRI-15, decision TRI-81: one link per network) ──

export const SOCIAL_NETWORKS = ["youtube", "instagram", "tiktok", "x", "website"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

type HandleNetwork = Exclude<SocialNetwork, "website">;

// Handle rules per network, and the hosts whose profile URLs we accept for it
const HANDLE_RULES: Record<HandleNetwork, { hosts: string[]; pattern: RegExp; hint: string }> = {
  youtube: { hosts: ["youtube.com"], pattern: /^[A-Za-z0-9._-]{3,30}$/, hint: "3-30 letters, numbers, . _ -" },
  instagram: { hosts: ["instagram.com"], pattern: /^[A-Za-z0-9._]{1,30}$/, hint: "1-30 letters, numbers, . _" },
  tiktok: { hosts: ["tiktok.com"], pattern: /^[A-Za-z0-9._]{2,24}$/, hint: "2-24 letters, numbers, . _" },
  x: { hosts: ["x.com", "twitter.com"], pattern: /^[A-Za-z0-9_]{1,15}$/, hint: "1-15 letters, numbers, _" },
};

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

function parseUrl(raw: string): URL | null {
  try {
    const url = new URL(SCHEME.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * The stored form of a social link, or an error message. Handle networks store the bare handle (no `@`),
 * whether the user typed `@name`, `name` or a profile URL; a YouTube channel URL without an @handle
 * (`/channel/…`, `/c/…`, `/user/…`) is kept as a canonical https URL. `website` stores a full http(s) URL.
 */
export function normalizeSocialLink(network: SocialNetwork, input: string): { value: string } | { error: string } {
  const raw = input.trim();
  if (!raw) return { error: "Value is required" };
  if (raw.length > 2048) return { error: "Value is too long" };

  if (network === "website") {
    const url = parseUrl(raw);
    if (!url || !url.hostname.includes(".") || /\s/.test(raw)) return { error: "Enter a valid website URL" };
    const value = url.toString();
    // "https://example.com/" → "https://example.com"
    return { value: url.pathname === "/" && !url.search && !url.hash ? value.replace(/\/$/, "") : value };
  }

  const rules = HANDLE_RULES[network];
  const host = (h: string) => h.toLowerCase().replace(/^(www|m|mobile)\./, "");
  const looksLikeUrl = SCHEME.test(raw) || rules.hosts.some((h) => raw.toLowerCase().replace(/^(www|m|mobile)\./, "").startsWith(`${h}/`));

  let handle: string;
  if (looksLikeUrl) {
    const url = parseUrl(raw);
    if (!url || !rules.hosts.includes(host(url.hostname))) {
      return { error: `Enter a ${network} handle or a ${rules.hosts[0]} profile URL` };
    }
    const segments = url.pathname.split("/").filter(Boolean);
    const first = segments[0] ?? "";
    if (network === "youtube" && !first.startsWith("@")) {
      if (["channel", "c", "user"].includes(first) && segments[1] && /^[A-Za-z0-9._-]{1,100}$/.test(segments[1])) {
        return { value: `https://www.youtube.com/${first}/${segments[1]}` };
      }
      return { error: "Enter a YouTube @handle or channel URL" };
    }
    if (network === "tiktok" && !first.startsWith("@")) {
      return { error: "Enter a TikTok @handle or profile URL" };
    }
    handle = first.replace(/^@/, "");
  } else {
    handle = raw.replace(/^@/, "");
  }

  if (!rules.pattern.test(handle)) return { error: `Invalid ${network} handle (${rules.hint})` };
  return { value: handle };
}

export const socialLinkSchema = z
  .object({
    network: z.enum(SOCIAL_NETWORKS),
    value: z.string(),
    order: z.number().int().min(0).max(1000).optional(),
  })
  .strict()
  .transform((link, ctx) => {
    const normalized = normalizeSocialLink(link.network, link.value);
    if ("error" in normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: normalized.error, path: ["value"] });
      return z.NEVER;
    }
    return { network: link.network, value: normalized.value, order: link.order };
  });

/**
 * Replace-all list: `[]` clears every link. One entry per network (DUPLICATE_NETWORK otherwise). Stored `order`
 * is the given `order`, else the array index; the list comes back sorted by it.
 */
export const socialLinksSchema = z
  .array(socialLinkSchema)
  .max(SOCIAL_NETWORKS.length)
  .superRefine((links, ctx) => {
    const seen = new Set<string>();
    links.forEach((link, i) => {
      if (seen.has(link.network)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate network: ${link.network}`, path: [i, "network"] });
      }
      seen.add(link.network);
    });
  })
  .transform((links) => links.map((link, i) => ({ ...link, order: link.order ?? i })));

export type SocialLinkInput = z.output<typeof socialLinkSchema>;

// Complete profile update schema (all fields optional for partial updates)
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),
  avatar: z
    .union([uuidSchema, z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  removeAvatar: z.boolean().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .refine((val) => !val.startsWith("_"), {
      message: "Username cannot start with underscore",
    })
    .transform((val) => val.toLowerCase())
    .optional(),
  location: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
});

// ── Privacy preferences (USET-06, TRI-15) ──

export const PROFILE_VISIBILITIES = ["everyone", "tribe_members"] as const;

// PATCH /me/privacy: any subset; unknown keys are a 400
export const updatePrivacySchema = z
  .object({
    profileVisibility: z.enum(PROFILE_VISIBILITIES),
    showOnlineStatus: z.boolean(),
    showLastSeen: z.boolean(),
    showEmail: z.boolean(),
    showLocation: z.boolean(),
    showJoinDate: z.boolean(),
    showSharedTribes: z.boolean(),
  })
  .partial()
  .strict();

export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;

// ── Member profile reads (PROF-02, TRI-15) ──

const optionalUuid = z.string().uuid("Invalid UUID format").optional();

// GET /users/{id}/profile?tribeId
export const memberProfileQuerySchema = z.object({ tribeId: optionalUuid });

// GET /users/{id}/posts|events|media?tribeId&limit&offset
export const memberContentQuerySchema = z.object({
  tribeId: optionalUuid,
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type MemberContentQuery = z.infer<typeof memberContentQuerySchema>;

// Export types
export type ProfileStep1Input = z.infer<typeof profileStep1Schema>;
export type ProfileStep2Input = z.infer<typeof profileStep2Schema>;
export type ProfileStep3Input = z.infer<typeof profileStep3Schema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Validation helper for API routes
export function validateApiRequest<T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: z.ZodError } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { success: false, error: errorMessage, details: error };
    }
    return { success: false, error: "Validation failed" };
  }
}
