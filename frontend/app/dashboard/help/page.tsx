"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Book,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
  FileText,
  Video,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const faqs = [
  {
    question: "How do I create a job application profile?",
    answer:
      "To create your job application profile, navigate to the Profile section in your dashboard. Fill in your personal information, work experience, education, and skills. Make sure to upload a professional photo and complete all sections to increase your visibility to recruiters.",
    category: "Getting Started",
  },
  {
    question: "How can I search for jobs that match my skills?",
    answer:
      "Use the advanced search feature on the Jobs page. You can filter by job title, location, salary range, experience level, and required skills. The algorithm will also recommend jobs based on your profile information and previous applications.",
    category: "Job Search",
  },
  {
    question: "What is the application process like?",
    answer:
      'Once you find a job you\'re interested in, click "Apply Now" and submit your application. You can track the status of your applications in real-time through your dashboard. Typical stages include: Applied → Under Review → Shortlisted → Interview → Offer.',
    category: "Applications",
  },
  {
    question: "How do I prepare for interviews?",
    answer:
      "Our platform offers interview preparation resources including common questions, mock interviews, and tips specific to your industry. You can also schedule practice sessions with career coaches through the Resources section.",
    category: "Interviews",
  },
  {
    question: "Can I edit my application after submitting?",
    answer:
      'Yes, you can edit your application as long as the job is still accepting applications and your status is "Applied" or "Under Review". Go to your Applications page, find the job, and click "Edit Application".',
    category: "Applications",
  },
  {
    question: "How do I set up job alerts?",
    answer:
      "Navigate to Settings → Notifications and enable job alerts. You can set specific criteria for the types of jobs you want to be notified about, including keywords, location, and salary range.",
    category: "Notifications",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      'Click "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. The link expires after 24 hours for security reasons.',
    category: "Account",
  },
  {
    question: "How can I delete my account?",
    answer:
      "Go to Settings → Account → Delete Account. Please note that this action is permanent and cannot be undone. We recommend downloading your data before deleting your account.",
    category: "Account",
  },
];

const resources = [
  {
    title: "Resume Builder",
    description: "Create professional resumes with our templates",
    icon: FileText,
    link: "#",
  },
  {
    title: "Interview Preparation",
    description: "Practice with mock interviews and common questions",
    icon: Video,
    link: "#",
  },
  {
    title: "Career Blog",
    description: "Tips and advice from industry experts",
    icon: Book,
    link: "#",
  },
  {
    title: "Community Forum",
    description: "Connect with other job seekers and professionals",
    icon: Users,
    link: "#",
  },
];

export default function HelpSupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });

  const categories = [
    "All",
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Support ticket submitted:", contactForm);
    // Handle support ticket submission
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600">
            Find answers to your questions or get in touch with our support team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <MessageCircle className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            <p className="text-sm text-gray-600 mt-1">
              Chat with our support team
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <Mail className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Email Support</h3>
            <p className="text-sm text-gray-600 mt-1">Get help via email</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <Phone className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Phone Support</h3>
            <p className="text-sm text-gray-600 mt-1">Call us at 1-800-JOBS</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <Book className="h-8 w-8 text-orange-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Knowledge Base</h3>
            <p className="text-sm text-gray-600 mt-1">Browse our articles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQs Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>

              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const originalIndex = faqs.indexOf(faq);
                  return (
                    <div
                      key={originalIndex}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        onClick={() => toggleFaq(originalIndex)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {faq.question}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {faq.category}
                            </p>
                          </div>
                        </div>
                        {expandedFaq === originalIndex ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {expandedFaq === originalIndex && (
                        <div className="px-4 pb-3 pt-0">
                          <div className="pl-8 text-sm text-gray-600">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No FAQs found matching your search.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-green-50 mt-3 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Support Status</p>
                  <p className="text-sm text-green-700">
                    All systems operational
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Clock className="h-4 w-4" />
                  <span>Average response time: 2-4 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form & Resources */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Contact Support
              </h2>
              <form onSubmit={handleSubmitSupport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Helpful Resources
              </h2>
              <div className="space-y-3">
                {resources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <a
                      key={index}
                      href={resource.link}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {resource.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {resource.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  );
                })}
              </div>
            </div>
            {/* Support Status */}
          </div>
        </div>
      </div>
    </div>
  );
}
