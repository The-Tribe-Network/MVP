import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { waitlist } from "@/lib/database/schemas/waitlist";
import { waitlistSchema } from "@/lib/validations/waitlist";
import { sendWaitlistEmail } from "@/lib/services/email";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = waitlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email, source } = validation.data;

    // Check for duplicate
    const existing = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "You're already on the waitlist!" },
        { status: 200 }
      );
    }

    // Insert new waitlist entry
    await db
      .insert(waitlist)
      .values({
        email,
        source: source || "unknown",
        referrer: request.headers.get("referer") || null,
        userAgent: request.headers.get("user-agent") || null,
      })
      .returning();

    // Send confirmation email (non-blocking)
    await sendWaitlistEmail(email);

    return NextResponse.json({
      success: true,
      message: "Thanks for joining our waitlist!",
    });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
