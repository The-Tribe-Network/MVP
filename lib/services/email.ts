import { sendWaitlistEmail as sendWaitlistEmailTemplate } from "@/lib/email/templates/waitlist/send-waitlist-email";

export async function sendWaitlistEmail(email: string) {
  try {
    await sendWaitlistEmailTemplate({ to: email });
  } catch (error) {
    console.error("Failed to send waitlist email:", error);
    // Don't throw - we don't want email failures to block waitlist signups
  }
}
