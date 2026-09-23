import { z } from "zod";

/**
 * GET /tribes/{tribeId}/media query (mobile contract `listMedia`, TRI-207).
 * Spec: docs/specs/TRI-207-list-media-filters.md
 */

export const MEDIA_LIST_SORTS = ["newest", "oldest", "popular"] as const;
export type MediaListSort = (typeof MEDIA_LIST_SORTS)[number];

/** Most uploader ids one request may name. */
export const MAX_UPLOADED_BY = 100;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * An ISO 8601 calendar date (`2026-09-01`, midnight UTC) or date-time with `Z` or an offset
 * (`2026-09-01T00:00:00-04:00`). Date-times without a zone are rejected as ambiguous.
 */
const isoDateOrDateTime = z
  .string()
  .refine(
    (value) =>
      DATE_ONLY.test(value)
        ? z.string().date().safeParse(value).success
        : z.string().datetime({ offset: true }).safeParse(value).success,
    { message: "Expected an ISO 8601 date (YYYY-MM-DD) or date-time with Z or an offset" }
  )
  .transform((value) => ({ at: new Date(DATE_ONLY.test(value) ? `${value}T00:00:00Z` : value), dateOnly: DATE_ONLY.test(value) }));

const uuid = z.string().uuid("Invalid UUID format");

export const mediaListQuerySchema = z
  .object({
    // Literal `null` = the general library (album_media.album_id is null).
    albumId: z.union([z.literal("null").transform(() => null), uuid]).optional(),
    type: z.enum(["image", "video", "document"]).optional(),
    // Comma-separated (repeated params are joined before parsing). Deduplicated.
    uploadedBy: z
      .string()
      .transform((value) => value.split(",").map((id) => id.trim()))
      .pipe(z.array(uuid).min(1).max(MAX_UPLOADED_BY, `At most ${MAX_UPLOADED_BY} uploader ids`))
      .transform((ids) => [...new Set(ids.map((id) => id.toLowerCase()))])
      .optional(),
    from: isoDateOrDateTime.optional(),
    to: isoDateOrDateTime.optional(),
    sort: z.enum(MEDIA_LIST_SORTS).default("newest"),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .transform(({ from, to, ...rest }) => ({
    ...rest,
    // Inclusive lower bound on media.created_at.
    createdFrom: from?.at,
    // Exclusive upper bound: a date-time as given, a calendar date through the end of that day (UTC).
    createdBefore: to ? (to.dateOnly ? new Date(to.at.getTime() + DAY_MS) : to.at) : undefined,
  }))
  .refine((q) => !q.createdFrom || !q.createdBefore || q.createdFrom < q.createdBefore, {
    message: "`from` must be before `to`",
    path: ["to"],
  });

export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

/** Reads the listMedia query params off a URL into the shape the schema parses. */
export function mediaListQueryInput(params: URLSearchParams) {
  // Empty values count as absent, as they did before TRI-207 (`?albumId=` lists everything).
  const get = (name: string) => params.get(name) || undefined;
  const uploadedBy = params.getAll("uploadedBy").filter(Boolean);
  return {
    albumId: get("albumId"),
    type: get("type"),
    uploadedBy: uploadedBy.length ? uploadedBy.join(",") : undefined,
    from: get("from"),
    to: get("to"),
    sort: get("sort"),
    limit: get("limit"),
    offset: get("offset"),
  };
}
