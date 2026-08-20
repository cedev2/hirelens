"use client";

import { useState, useEffect } from "react";
import { Joyride, STATUS, EVENTS, type Step } from "react-joyride";

interface ScreeningOnboardingProps {
  run?: boolean;
  onComplete?: () => void;
}

export default function ScreeningOnboarding({
  run = false,
  onComplete,
}: ScreeningOnboardingProps) {
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
            AI-Powered Screening Tour 🤖
          </h2>
          <p className="text-gray-600">
            Let's walk through the AI screening process. Our system will help you
            identify the best candidates for your job posting.
          </p>
        </div>
      ),
      placement: "center" as const,
    },
    {
      target: '[data-tour="screening-results"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Screening Results
          </h3>
          <p className="text-gray-600">
            View all candidates ranked by their match score. Expand each candidate to
            see detailed analysis including strengths, gaps, and AI recommendations.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="candidate-selection"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Select Candidates
          </h3>
          <p className="text-gray-600">
            Check the boxes next to candidates you want to move forward. You can select
            multiple candidates at once for batch actions like shortlisting or emailing.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="compare-candidates"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Compare Candidates
          </h3>
          <p className="text-gray-600">
            Select 2-3 candidates and click compare to see a side-by-side analysis.
            This helps you make informed decisions when choosing between top candidates.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="shortlist-action"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Shortlist Candidates
          </h3>
          <p className="text-gray-600">
            Move selected candidates to the shortlist. These are your top picks that
            you want to consider for the next stage of the hiring process.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="email-action"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Send Interview Emails
          </h3>
          <p className="text-gray-600">
            Automatically send interview invitations to selected candidates. Customize
            the email template with your company details and interview information.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="pipeline-steps"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Pipeline Progress
          </h3>
          <p className="text-gray-600">
            Track candidates through the hiring pipeline: Results → Shortlist →
            Interview → Contract. Each step is designed to move candidates forward efficiently.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="interview-manage"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Manage Interviews
          </h3>
          <p className="text-gray-600">
            Schedule interviews, track candidate status, and provide ratings. This
            helps you stay organized and make data-driven hiring decisions.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: '[data-tour="contract-generate"]',
      content: (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Generate Contracts
          </h3>
          <p className="text-gray-600">
            For selected candidates, generate employment contracts automatically.
            Customize terms and send for electronic signature.
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
            Ready to Screen! 🎯
          </h2>
          <p className="text-gray-600">
            You now understand the AI screening workflow. Start analyzing candidates
            and find your perfect match!
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
