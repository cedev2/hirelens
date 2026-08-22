import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Sparkles, Zap, Shield, BarChart3 } from "lucide-react";

export default function UpdatesPage() {
  const updates = [
    {
      date: "22 April 2026",
      version: "1.3.0 Beta",
      title: "Performance Boost",
      icon: <Zap className="w-6 h-6" />,
      changes: [
        "3x faster candidate matching",
        "Reduced page load times",
        "Optimized database queries",
        "Improved mobile responsiveness",
      ],
    },
    {
      date: "21 April 2026",
      version: "v1.1.0",
      title: "Enhanced AI Screening",
      icon: <Sparkles className="w-6 h-6" />,
      changes: [
        "Improved resume parsing accuracy by 25%",
        "New skills extraction algorithm",
        "Multi-language support for candidate profiles",
        "Custom scoring weights per job posting",
      ],
    },
    {
      date: "20 April 2026",
      version: "v1.0.5",
      title: "Pipeline Management",
      icon: <BarChart3 className="w-6 h-6" />,
      changes: [
        "Visual hiring pipeline with drag-and-drop",
        "Automated status updates and notifications",
        "Interview scheduling integration",
        "Candidate feedback collection tools",
      ],
    },
    {
      date: "16 April 2026",
      version: "v0.9.0",
      title: "Security & Compliance",
      icon: <Shield className="w-6 h-6" />,
      changes: [
        "Full GDPR compliance certification",
        "Enhanced data encryption at rest",
        "Role-based access controls",
        "Audit logging for all data access",
      ],
    },
  ];

  const upcoming = [
    { title: "Video Interview Integration", eta: "Q2 2026" },
    { title: "AI-Powered Interview Questions", eta: "Q2 2026" },
    { title: "Reference Checking Automation", eta: "Q3 2026" },
    { title: "Advanced Analytics Dashboard", eta: "Q3 2026" },
    { title: "Mobile App for Hiring Managers", eta: "Q4 2026" },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-[100px]">
        {/* Hero */}
        <section className="bg-[#f8f8fd] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px]">
            <h1 className="text-5xl font-bold text-[#111827] mb-6">
              Product <span className="text-[#087F5B]">Updates</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Stay informed about new features, improvements, and what&apos;s
              coming next for HireLens.
            </p>
          </div>
        </section>

        {/* Updates Timeline */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px]">
            <h2 className="text-3xl font-bold text-[#111827] mb-8">
              Recent Updates
            </h2>
            <div className="space-y-8">
              {updates.map((update, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-lg p-8 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-6">
                    <div className="text-[#087F5B] p-3 bg-[#f8f8fd] rounded-full">
                      {update.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-gray-500">
                          {update.date}
                        </span>
                        <span className="px-3 py-1 bg-[#087F5B]/10 text-[#087F5B] text-xs font-semibold rounded-full">
                          {update.version}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#111827] mb-3">
                        {update.title}
                      </h3>
                      <ul className="space-y-2">
                        {update.changes.map((change, idx) => (
                          <li
                            key={idx}
                            className="text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-[#087F5B]">•</span>
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming */}
        <section className="py-16 bg-[#f8f8fd]">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px]">
            <h2 className="text-3xl font-bold text-[#111827] mb-8">
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {upcoming.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between"
                >
                  <span className="font-semibold text-[#111827]">
                    {item.title}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {item.eta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px] text-center">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Get notified about new features and improvements directly in your
              inbox.
            </p>
            <div className="flex justify-center gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 border border-gray-200 rounded-lg w-80"
              />
              <button className="px-6 py-3 bg-[#087F5B] hover:bg-[#066B4D] text-white font-semibold rounded-lg">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
