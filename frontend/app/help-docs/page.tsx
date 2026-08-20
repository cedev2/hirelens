import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Book, FileText, MessageCircle, Zap, Search } from "lucide-react";

export default function HelpDocsPage() {
  const docs = [
    {
      icon: <Book className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn the basics of setting up your account and creating your first job posting.",
      link: "#"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Screening Guide",
      description: "Understand how our AI evaluates candidates and how to configure screening criteria.",
      link: "#"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Managing Job Postings",
      description: "Create, edit, and manage job listings. Set requirements and track applications.",
      link: "#"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Talent Search",
      description: "Search and filter the talent pool to find the perfect candidates for your roles.",
      link: "#"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Communication Tools",
      description: "Learn how to communicate with candidates and manage the interview process.",
      link: "#"
    }
  ];

  const faqs = [
    {
      question: "How does the AI screening work?",
      answer: "Our AI analyzes candidate resumes against your job requirements, assigning scores based on skills match, experience relevance, and education fit. You can customize the weights for each criterion."
    },
    {
      question: "Can I override AI recommendations?",
      answer: "Absolutely. AI scores are recommendations only. You have full control to advance or decline any candidate regardless of their score."
    },
    {
      question: "How is candidate data protected?",
      answer: "All data is encrypted at rest and in transit. We comply with GDPR and other applicable data protection regulations."
    },
    {
      question: "What file formats are supported for resumes?",
      answer: "We currently support PDF, DOC, and DOCX formats. Files up to 10MB can be uploaded."
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
              Help <span className="text-[#087F5B]">Center</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Find answers, tutorials, and documentation to help you get the most 
              out of HireLens.
            </p>
          </div>
        </section>

        {/* Docs Grid */}
        <section className="py-16">
          <div className="mx-[122px]">
            <h2 className="text-3xl font-bold text-[#25324B] mb-8">Documentation</h2>
            <div className="grid grid-cols-3 gap-6">
              {docs.map((doc, index) => (
                <a
                  key={index}
                  href={doc.link}
                  className="p-6 border border-gray-100 rounded-lg hover:border-[#087F5B] hover:shadow-md transition-all"
                >
                  <div className="text-[#087F5B] mb-4">{doc.icon}</div>
                  <h3 className="text-lg font-semibold text-[#25324B] mb-2">{doc.title}</h3>
                  <p className="text-gray-600 text-sm">{doc.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-[#f8f8fd]">
          <div className="mx-[122px]">
            <h2 className="text-3xl font-bold text-[#25324B] mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6 max-w-3xl">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-[#25324B] mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-16">
          <div className="mx-[122px] text-center">
            <h2 className="text-3xl font-bold text-[#25324B] mb-4">
              Need More Help?
            </h2>
            <p className="text-gray-600 mb-6">
              Our support team is ready to assist you with any questions.
            </p>
            <a
              href="/contact-us"
              className="inline-block bg-[#087F5B] hover:bg-[#066B4D] text-white px-8 py-4 font-semibold"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
