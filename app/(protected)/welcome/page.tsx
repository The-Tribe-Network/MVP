import WelcomePage from "@/app-pages/welcome";
import { requireAuth } from "@/lib/services/auth";
import { isProfileComplete } from "@/lib/services/user";
import { redirect } from "next/navigation";

export default async function Welcome() {
  const user = await requireAuth();

  // If profile is already complete, redirect to dashboard
  const profileComplete = await isProfileComplete(user.id);
  if (profileComplete) {
    redirect("/dashboard");
  }

  return <WelcomePage />;
}
