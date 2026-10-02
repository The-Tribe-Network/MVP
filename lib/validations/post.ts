import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

export const POST_MAX_PHOTOS = 10;

// A poll made in the composer (TRI-151). It belongs to the post, unlike `pollId`, which shares an
// event's poll. Options are trimmed, 2–10 and unique; the end time, when given, is in the future.
export const inlinePollSchema = z
  .object({
    question: z.string().trim().min(1, "Poll question is required").max(500),
    options: z
      .array(z.string().trim().min(1, "Poll options cannot be empty").max(200))
      .min(2, "Poll must have at least 2 options")
      .max(10, "Poll cannot have more than 10 options"),
    allowMultiple: z.boolean().optional(),
    isAnonymous: z.boolean().optional(),
    endsAt: z.string().datetime().optional().nullable(),
  })
  .refine((data) => new Set(data.options).size === data.options.length, {
    message: "Poll options must be unique",
    path: ["options"],
  })
  .refine((data) => !data.endsAt || new Date(data.endsAt).getTime() > Date.now(), {
    message: "Poll must end in the future",
    path: ["endsAt"],
  });

// Create post schema
// `mediaIds` is the canonical photo list; `mediaId` is the legacy single-image field and is read
// only when `mediaIds` is absent. Content may be empty when the post carries an attachment.
//
// `addToAlbum` decides whether the photos also go into the tribe's media library (`album_media`),
// which is what `GET /tribes/{tribeId}/media` lists. With `albumId` they are filed in that album;
// without one they land in the general library (`album_id` null, `GET /media?albumId=null`).
// `false` leaves them on the post only. No album picker is needed for the default case.
//
// `libraryMediaIds` (TRI-419) marks which of `mediaIds` are photos already in the tribe, picked from its
// library: any image of the tribe the author can see. They stay where they are (their albums, their
// original post) and are only shown on the new post; `addToAlbum` does not apply to them.
export const createPostSchema = z
  .object({
    content: z
      .string()
      .max(5000, "Post content must be less than 5000 characters")
      .trim(),
    addToAlbum: z.boolean(),
    mediaId: z.string().uuid("Invalid media ID format").optional().nullable(),
    mediaIds: z
      .array(z.string().uuid("Invalid media ID format"))
      .max(POST_MAX_PHOTOS, `A post can have at most ${POST_MAX_PHOTOS} photos`)
      .optional(),
    libraryMediaIds: z
      .array(z.string().uuid("Invalid media ID format"))
      .max(POST_MAX_PHOTOS, `A post can have at most ${POST_MAX_PHOTOS} photos`)
      .optional(),
    albumId: z.string().uuid("Invalid album ID format").optional().nullable(),
    linkedAlbumId: z.string().uuid("Invalid linked album ID format").optional().nullable(),
    eventId: z.string().uuid("Invalid event ID format").optional().nullable(),
    pollId: z.string().uuid("Invalid poll ID format").optional().nullable(),
    poll: inlinePollSchema.optional().nullable(),
    isPinned: z.boolean().optional(),
    // The posts timeline to post in; Global when omitted (TRI-314)
    timelineId: z.string().uuid("Invalid timeline ID format").optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const hasMedia = (data.mediaIds?.length ?? 0) > 0 || Boolean(data.mediaId);
    const links = [data.eventId, data.pollId, data.poll, data.linkedAlbumId].filter(Boolean).length;

    if (links > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventId"],
        message: "A post can carry only one of an event, a poll or an album",
      });
    }

    const listed = new Set(data.mediaIds ?? []);
    if ((data.libraryMediaIds ?? []).some((id) => !listed.has(id))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["libraryMediaIds"],
        message: "Library photos must also be listed in mediaIds",
      });
    }

    if (data.content.length === 0 && !hasMedia && links === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Post content is required",
      });
    }
  });

// Feed query schema (GET /posts)
export const listPostsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  // Keyset cursor from the previous page's `nextCursor` (TRI-360); wins over `offset`
  cursor: z.string().min(1).optional(),
  sort: z.enum(["new", "hot", "top"]).default("new"),
  contentType: z.enum(["all", "text", "media", "announcements", "events", "polls"]).default("all"),
  // One posts timeline's feed; Global when omitted (TRI-314)
  timelineId: z.string().uuid("Invalid timeline ID format").optional(),
});

// Update post schema
export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content must be less than 5000 characters")
    .trim(),
});

// Post ID parameter schema
export const postIdParamSchema = z.object({
  post_id: uuidSchema,
});

// Tribe ID parameter schema (for nested routes)
export const tribeIdParamSchema = z.object({
  tribe_id: uuidSchema,
});

// Combined schema for nested routes
export const tribePostIdParamSchema = z.object({
  tribe_id: uuidSchema,
  post_id: uuidSchema,
});

// Export types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type TribeIdParam = z.infer<typeof tribeIdParamSchema>;
export type TribePostIdParam = z.infer<typeof tribePostIdParamSchema>;

// Validation helper for API routes
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
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

