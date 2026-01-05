import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

// ============================================
// Survey Options - aligned with use cases page
// ============================================

export const surveyRoleOptions = [
  { value: "religious_faith", label: "Religious or Faith Community", description: "Church, temple, congregation" },
  { value: "athletic_recreation", label: "Athletic or Recreation Group", description: "Sports team, fitness club, outdoor group" },
  { value: "professional_alumni", label: "Professional or Alumni Network", description: "Industry group, alumni association" },
  { value: "social_hobby", label: "Social or Hobby Group", description: "Book club, maker space, creative community" },
  { value: "other", label: "Other", description: "Something else" },
] as const;

export const surveyUseCaseOptions = [
  { value: "photo_sharing", label: "Photo sharing & archiving" },
  { value: "event_coordination", label: "Event coordination" },
  { value: "member_communication", label: "Member communication" },
  { value: "community_management", label: "Community management" },
  { value: "private_networking", label: "Private group networking" },
  { value: "other", label: "Other" },
] as const;

export const surveyPricingOptions = [
  { value: "free_only", label: "Free only" },
  { value: "tier_29_49", label: "$29-49/mo" },
  { value: "tier_50_99", label: "$50-99/mo" },
  { value: "tier_100_199", label: "$100-199/mo" },
  { value: "tier_200_plus", label: "$200+/mo" },
] as const;

// ============================================
// Survey Validation Schema
// ============================================

const surveyRoleValues = surveyRoleOptions.map(o => o.value) as [string, ...string[]];
const surveyPricingValues = surveyPricingOptions.map(o => o.value) as [string, ...string[]];

export const waitlistSurveySchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(surveyRoleValues, {
    required_error: "Please select your community type",
  }),
  roleOther: z.string().max(200, "Please keep your response under 200 characters").optional(),
  useCases: z.array(z.string()).min(1, "Please select at least one use case"),
  useCasesOther: z.string().max(500, "Please keep your response under 500 characters").optional(),
  problemToSolve: z
    .string()
    .min(10, "Please describe the problem in more detail (at least 10 characters)")
    .max(2000, "Please keep your response under 2000 characters"),
  willingnessToPay: z.enum(surveyPricingValues, {
    required_error: "Please select a pricing option",
  }),
}).refine(
  (data) => data.role !== "other" || (data.roleOther && data.roleOther.trim().length > 0),
  { message: "Please specify your community type", path: ["roleOther"] }
).refine(
  (data) => !data.useCases.includes("other") || (data.useCasesOther && data.useCasesOther.trim().length > 0),
  { message: "Please specify your other use case", path: ["useCasesOther"] }
);

export type WaitlistSurveyInput = z.infer<typeof waitlistSurveySchema>;
