"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    async function checkProfileCompletion() {
      // Skip check if on welcome page - let the page itself handle it
      const isWelcomePage = pathname === "/welcome";

      try {
        const response = await fetch("/api/user/profile/complete");

        if (!response.ok) {
          // If unauthorized, let the auth system handle it
          if (response.status === 401) {
            setIsAllowed(true);
            setIsChecking(false);
            return;
          }
          throw new Error("Failed to check profile completion");
        }

        const data = await response.json();
        const profileComplete = data.isComplete;

        if (!profileComplete && !isWelcomePage) {
          // Profile incomplete and not on welcome page - redirect to welcome
          router.replace("/welcome");
          return;
        }

        if (profileComplete && isWelcomePage) {
          // Profile complete but on welcome page - redirect to dashboard
          router.replace("/dashboard");
          return;
        }

        // All checks passed - allow render
        setIsAllowed(true);
      } catch (error) {
        console.error("Error checking profile completion:", error);
        // On error, allow render to avoid blocking the app
        setIsAllowed(true);
      } finally {
        setIsChecking(false);
      }
    }

    checkProfileCompletion();
  }, [pathname, router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Only render children if allowed
  return isAllowed ? <>{children}</> : null;
}
