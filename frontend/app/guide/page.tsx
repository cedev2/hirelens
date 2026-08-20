import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function GuidePage() {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description:
        "Sign up as an HR admin and complete your company profile. Verify your email to activate all features.",
      action: "Get Started",
      link: "/admin/auth/login",
    },
    {
      number: "02",
      title: "Post Your First Job",
      description:
        "Click 'New Job' and fill in the details. Add requirements, set the deadline, and define your screening criteria.",
      action: "Create Job",
      link: "/admin/jobs",
    },
    {
      number: "03",
      title: "Configure AI Screening",
      description:
        "Set weights for skills, experience, and education. Our AI will automatically score incoming applications.",
      action: "Learn More",
      link: "/advice",
    },
    {
      number: "04",
      title: "Review Candidates",
      description:
        "Access your dashboard to see AI-ranked candidates. Review top matches and advance promising applicants.",
      action: "Go to Dashboard",
      link: "/admin",
    },
    {
      number: "05",
      title: "Manage the Pipeline",
      description:
        "Move candidates through screening stages, schedule interviews, and make data-driven hiring decisions.",
      action: "Start Screening",
      link: "/admin/screening",
    },
  ];

  const tips = [
    "Use specific keywords in job descriptions for better AI matching",
    "Set realistic screening weights - 100% on one criterion may miss great candidates",
    "Respond to top candidates within 24-48 hours",
    "Use the analytics dashboard to identify bottlenecks in your process",
    "Regularly review and update your screening criteria based on successful hires",
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-[100px]">
        {/* Hero */}
        <section className="bg-[#f8f8fd] py-20">
          <div className="mx-[122px]">
            <h1 className="text-5xl font-bold text-[#25324B] mb-6">
              Getting Started <span className="text-[#087F5B]">Guide</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Follow these simple steps to transform your hiring process with
              AI-powered talent acquisition.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="mx-[122px]">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="text-5xl font-bold text-[#087F5B]/20">
                    {step.number}
                  </div>
                  <div className="flex-1 bg-white p-8 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="text-2xl font-semibold text-[#25324B] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    <a
                      href={step.link}
                      className="inline-flex items-center gap-2 text-[#087F5B] font-semibold hover:gap-3 transition-all"
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="py-16 bg-[#f8f8fd]">
          <div className="mx-[122px]">
            <h2 className="text-3xl font-bold text-[#25324B] mb-8">
              Pro Tips for Success
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <ul className="space-y-4">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#087F5B] mt-0.5 shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-[122px] text-center">
            <h2 className="text-3xl font-bold text-[#25324B] mb-4">
              Ready to Start Hiring Smarter?
            </h2>
            <a
              href="/admin"
              className="inline-block bg-[#087F5B] hover:bg-[#066B4D] text-white px-8 py-4 font-semibold mt-4"
            >
              Launch Dashboard
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
