import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lightbulb, BookOpen, Users, Target } from "lucide-react";

export default function AdvicePage() {
  const tips = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Write Compelling Job Descriptions",
      content: "Use clear, inclusive language. Focus on must-have skills vs nice-to-have. Highlight growth opportunities and company culture."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Define Clear Requirements",
      content: "Use our AI-powered screening to set objective criteria. This reduces bias and ensures fair evaluation of all candidates."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Speed Up Your Process",
      content: "Top candidates are off the market in 10 days. Use automated screening and scheduling to move quickly on promising applicants."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Leverage Data Insights",
      content: "Track your hiring metrics. Identify bottlenecks in your funnel and optimize your recruitment strategy over time."
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-[100px]">
        {/* Hero */}
        <section className="bg-[#f8f8fd] py-20">
          <div className="mx-[122px]">
            <h1 className="text-5xl font-bold text-[#25324B] mb-6">
              Hiring <span className="text-[#087F5B]">Advice</span> & Best Practices
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Expert tips and strategies to help you hire smarter, faster, and more effectively 
              using AI-powered recruitment tools.
            </p>
          </div>
        </section>

        {/* Tips Grid */}
        <section className="py-16">
          <div className="mx-[122px]">
            <div className="grid grid-cols-2 gap-8">
              {tips.map((tip, index) => (
                <div key={index} className="p-8 border border-gray-100 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="text-[#087F5B] mb-4">{tip.icon}</div>
                  <h3 className="text-xl font-semibold text-[#25324B] mb-3">{tip.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Tips Section */}
        <section className="py-16 bg-[#f8f8fd]">
          <div className="mx-[122px]">
            <h2 className="text-3xl font-bold text-[#25324B] mb-8">
              Making the Most of AI Screening
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#087F5B] font-bold">1.</span>
                  <span><strong>Set realistic weights:</strong> Balance skills, experience, and education based on role requirements.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#087F5B] font-bold">2.</span>
                  <span><strong>Review AI recommendations:</strong> Use AI scores as a starting point, not the final decision.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#087F5B] font-bold">3.</span>
                  <span><strong>Calibrate regularly:</strong> Adjust screening criteria based on successful hires.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#087F5B] font-bold">4.</span>
                  <span><strong>Combine with human judgment:</strong> AI handles volume; humans assess culture fit.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-[122px] text-center">
            <h2 className="text-3xl font-bold text-[#25324B] mb-4">
              Ready to Put These Tips into Action?
            </h2>
            <a
              href="/admin"
              className="inline-block bg-[#087F5B] hover:bg-[#066B4D] text-white px-8 py-4 font-semibold mt-4"
            >
              Go to Dashboard
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
