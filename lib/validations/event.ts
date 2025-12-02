import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
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

export type CreateEventInput = z.infer<typeof createEventSchema>;
