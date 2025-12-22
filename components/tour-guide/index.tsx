"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTourStatus, useCompleteTour } from "@/lib/hooks/use-profile";
import { useAuthUser } from "@/lib/hooks/use-auth";
import "./tour-guide.css";

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="sidebar-logo"]',
    content: "Click here to return to your dashboard",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-nav"]',
    content:
      "Your navigation hub! Your tribes appear here, along with options to discover new tribes or create your own.",
    placement: "right",
  },
  {
    target: '[data-tour="toolbar"]',
    content: "The toolbar provides quick access to important features and notifications",
    placement: "bottom",
  },
  {
    target: '[data-tour="toolbar-buttons"]',
    content: "Stay connected! View invites, announcements, and notifications here.",
    placement: "bottom",
  },
  {
    target: '[data-tour="sidebar-user"]',
    content: "Access your profile and settings from here",
    placement: "right",
  },
];

export function TourGuide() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthUser();
  const { data: tourStatus, isLoading } = useTourStatus();
  const { mutate: completeTour } = useCompleteTour();
  const [runTour, setRunTour] = useState(false);

  // Determine if tour should run
  useEffect(() => {
    if (isLoading) return;

    const shouldRun =
      isAuthenticated &&
      pathname !== "/welcome" &&
      tourStatus?.tourCompleted === false;

    if (shouldRun) {
      // Delay to ensure DOM is ready and tour targets are mounted
      const timer = setTimeout(() => {
        // Double-check that targets exist before starting tour
        const hasTargets = TOUR_STEPS.every((step) => {
          if (typeof step.target === 'string') {
            return document.querySelector(step.target) !== null;
          }
          return true;
        });

        if (hasTargets) {
          setRunTour(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setRunTour(false);
    }
  }, [isAuthenticated, pathname, tourStatus?.tourCompleted, isLoading]);

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      // Mark tour as completed
      completeTour();
    }
  };

  // Don't render if loading or conditions not met
  if (isLoading || !runTour) {
    return null;
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleTourCallback}
      styles={{
        options: {
          primaryColor: "var(--primary)",
          textColor: "var(--card-foreground)",
          backgroundColor: "var(--card)",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "var(--card)",
          zIndex: 10000,
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}

