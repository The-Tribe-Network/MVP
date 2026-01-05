import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { waitlist, waitlistSurvey } from "@/lib/database/schemas/waitlist";
import { waitlistSurveySchema } from "@/lib/validations/waitlist";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = waitlistSurveySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid survey data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      email,
      role,
      roleOther,
      useCases,
      useCasesOther,
      problemToSolve,
      willingnessToPay
    } = validation.data;

    // Verify email is on waitlist
    const waitlistEntry = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1);

    if (waitlistEntry.length === 0) {
      return NextResponse.json(
        { error: "Email not found on waitlist. Please sign up for the waitlist first." },
        { status: 404 }
      );
    }

    // Check for existing survey submission
    const existingSurvey = await db
      .select()
      .from(waitlistSurvey)
      .where(eq(waitlistSurvey.email, email))
      .limit(1);

    if (existingSurvey.length > 0) {
      return NextResponse.json(
        { message: "You've already completed this survey. Thank you!", alreadySubmitted: true },
        { status: 200 }
      );
    }

    // Insert survey response
    await db.insert(waitlistSurvey).values({
      email,
      role: role as "religious_faith" | "athletic_recreation" | "professional_alumni" | "social_hobby" | "other",
      roleOther: roleOther || null,
      useCases,
      useCasesOther: useCasesOther || null,
      problemToSolve,
      willingnessToPay: willingnessToPay as "free_only" | "tier_29_49" | "tier_50_99" | "tier_100_199" | "tier_200_plus",
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for completing the survey!",
    });
  } catch (error) {
    console.error("Survey submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
