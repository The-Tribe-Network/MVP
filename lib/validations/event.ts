import { z } from "zod";

const eventBaseSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
});

export const createEventSchema = eventBaseSchema.refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const updateEventSchema = eventBaseSchema.partial().refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// Poll validation schema
export const pollDataSchema = z.object({
  question: z.string().min(1, "Poll question is required").max(500),
  options: z.array(z.string().min(1).max(200))
    .min(2, "Poll must have at least 2 options")
    .max(10, "Poll cannot have more than 10 options"),
  allowMultiple: z.boolean(),
  isAnonymous: z.boolean(),
  endsAt: z.date().optional(),
}).refine(
  (data) => new Set(data.options).size === data.options.length,
  { message: "Poll options must be unique", path: ["options"] }
);

// Combined schema for event + optional poll
export const createEventWithPollSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  poll: pollDataSchema.optional().nullable(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type CreateEventWithPollInput = z.infer<typeof createEventWithPollSchema>;
