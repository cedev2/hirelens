"use client";

import { useState, useEffect } from "react";
import { Joyride, STATUS, EVENTS, type Step } from "react-joyride";

interface JobOnboardingProps {
  run?: boolean;
  onComplete?: () => void;
}

export default function JobOnboarding({
  run = false,
  onComplete,
}: JobOnboardingProps) {
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
            Create Job Posting
          </h2>
          <p className="text-gray-600">
            Let's walk through creating a job posting. We'll guide you through
            each section to ensure your job attracts the right candidates.
          </p>
        </div>
      ),
      placement: "center" as const,
    },
    {
      target: '[data-tour="job-title"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Job Title</h3>
          <p className="text-gray-600">
            Enter a clear, descriptive job title that accurately reflects the
            role. This helps candidates find your job in searches.
          </p>
        </div>
      ),
      placement: "bottom" as const,
    },
    {
      target: '[data-tour="job-description"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
          <p className="text-gray-600">
            Provide a detailed description of the role, responsibilities, and
            what makes this opportunity exciting. Use the rich text editor to
            format your content.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="job-requirements"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
          <p className="text-gray-600">
            List the must-have skills and qualifications. These will be used by
            our AI to match candidates to your job. Be specific but reasonable.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="job-weights"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Screening Weights
          </h3>
          <p className="text-gray-600">
            Adjust the importance of skills, experience, and education in
            candidate evaluation. Higher weights mean that factor is more
            important.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="job-details"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
          <p className="text-gray-600">
            Set the job type, location type, deadline, and salary information.
            These details help candidates understand if the role fits their
            preferences.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="job-benefits"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
          <p className="text-gray-600">
            Highlight the perks and benefits of working at your company. This
            helps attract top talent and sets you apart from competitors.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="job-save"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Save & Publish</h3>
          <p className="text-gray-600">
            Save your job as a draft to continue later, or publish it
            immediately to start receiving applications. You can always edit it
            later.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: "body",
      content: (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            You're All Set! 🚀
          </h2>
          <p className="text-gray-600">
            Your job posting is ready. Fill in the details and publish to start
            receiving applications from qualified candidates!
          </p>
        </div>
      ),
      placement: "center" as const,
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;

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
        textColor: "#25324B",
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
