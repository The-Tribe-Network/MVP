import type { WaitlistInput } from "@/lib/validations/waitlist";

export async function submitWaitlist(data: WaitlistInput) {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to join waitlist");
  }

  return response.json();
}
