"use client";

import { useState, useEffect } from "react";
import { Joyride, STATUS, EVENTS, type Step } from "react-joyride";

interface AdminOnboardingProps {
  run?: boolean;
  onComplete?: () => void;
}

export default function AdminOnboarding({
  run = false,
  onComplete,
}: AdminOnboardingProps) {
  const [runTour, setRunTour] = useState(run);

  useEffect(() => {
    setRunTour(run);
  }, [run]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="text-center">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Welcome to HireLens! 🎉
          </h2>
          <p className="text-gray-600">
            Let's take a quick tour to help you get familiar with all the
            powerful features available to manage your recruitment platform.
          </p>
        </div>
      ),
      placement: "center" as const,
    },
    {
      target: '[data-tour="kpi-cards"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Key Performance Indicators
          </h3>
          <p className="text-gray-600">
            These cards show you the most important metrics at a glance: total
            jobs, open positions, closed jobs, and total candidates in your
            system.
          </p>
        </div>
      ),
      placement: "bottom" as const,
    },
    {
      target: '[data-tour="job-statistics-chart"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Job Statistics Overview
          </h3>
          <p className="text-gray-600">
            Track job postings and applications over time. This chart helps you
            understand hiring trends and platform activity.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="recent-jobs"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Recent Job Postings
          </h3>
          <p className="text-gray-600">
            View and manage your most recent job listings. You can edit, close,
            or delete jobs directly from here.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="recent-applications"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Recent Talents</h3>
          <p className="text-gray-600">
            Monitor a few talents and their experience plus also their status if
            available or not.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="candidate-composition"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Candidate Experience Levels
          </h3>
          <p className="text-gray-600">
            Understand your talent pool composition by experience level. This
            helps you match candidates to appropriate roles.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="sidebar-navigation"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Navigation Menu</h3>
          <p className="text-gray-600">
            Access all admin features from the sidebar: Dashboard, Jobs,
            Candidates, Applications, Screening, and Settings.
          </p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: "body",
      content: (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            You're All Set! 🚀
          </h2>
          <p className="text-gray-600">
            Now you know your way around the admin dashboard. Start managing
            your recruitment platform effectively!
          </p>
        </div>
      ),
      placement: "center" as const,
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status, type, step } = data;

    if (
      type === EVENTS.STEP_AFTER &&
      step?.target === '[data-tour="sidebar-navigation"]'
    ) {
      // Scroll to sidebar if needed
      const sidebar = document.querySelector(
        '[data-tour="sidebar-navigation"]',
      );
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      onComplete?.();
    }
  };

  const customStyles = {
    tooltip: {
      borderRadius: 8,
      fontSize: 14,
    },
    tooltipContainer: {
      textAlign: "left" as const,
    },
    buttonPrimary: {
      backgroundColor: "#4F46E5",
      fontSize: 14,
      borderRadius: 6,
      padding: "8px 16px",
    },
    buttonBack: {
      color: "#6B7280",
      marginRight: 10,
      fontSize: 14,
    },
    buttonSkip: {
      color: "#6B7280",
      fontSize: 14,
    },
    buttonClose: {
      height: 14,
      width: 14,
      right: 15,
      top: 15,
    },
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      onEvent={handleJoyrideCallback}
      styles={customStyles}
      options={{
        buttons: ["back", "skip", "primary"],
        hideOverlay: false,
        overlayColor: "rgba(0, 0, 0, 0.5)",
        overlayClickAction: false,
        dismissKeyAction: false,
        primaryColor: "#4F46E5",
        spotlightPadding: 10,
        textColor: "#111827",
        backgroundColor: "#FFFFFF",
        beaconSize: 36,
        zIndex: 100,
      }}
      locale={{
        back: "Previous",
        close: "Close",
        last: "Finish",
        next: "Next",
        open: "Open the dialog",
        skip: "Skip tour",
      }}
    />
  );
}
