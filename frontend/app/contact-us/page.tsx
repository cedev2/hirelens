import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactUsPage() {
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      value: "support@hirelens.com",
      description: "For general inquiries and support"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      value: "+250 123 456 789",
      description: "Mon-Fri, 8AM - 6PM CAT"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Office",
      value: "Kigali, Rwanda",
      description: "KG 7 Ave, Kigali Innovation City"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Support Hours",
      value: "24/7 Online Support",
      description: "Critical issues resolved within 4 hours"
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-[100px]">
        {/* Hero */}
        <section className="bg-[#f8f8fd] py-20">
          <div className="mx-[122px]">
            <h1 className="text-5xl font-bold text-[#111827] mb-6">
              Contact <span className="text-[#087F5B]">Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              We&apos;re here to help. Reach out to our team for support, questions, 
              or partnership inquiries.
            </p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <div key={index} className="p-6 border border-gray-100 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="text-[#087F5B] mb-4 flex justify-center">{info.icon}</div>
                  <h3 className="font-semibold text-[#111827] mb-1">{info.title}</h3>
                  <p className="text-[#087F5B] font-medium mb-2">{info.value}</p>
                  <p className="text-gray-500 text-sm">{info.description}</p>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-[#111827] mb-6">
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#111827] mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#087F5B]"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#111827] mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#087F5B]"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#087F5B]"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">
                      Subject
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#087F5B]">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Sales & Partnerships</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#087F5B]"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#087F5B] hover:bg-[#066B4D] text-white px-8 py-4 font-semibold rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              </div>

              {/* Map Placeholder */}
              <div className="bg-[#f8f8fd] rounded-lg p-8 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-[#111827] mb-4">
                  Visit Our Office
                </h3>
                <p className="text-gray-600 mb-6">
                  We&apos;re located in the heart of Kigali&apos;s tech district. 
                  Come say hello or schedule a demo of our platform.
                </p>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <p className="font-semibold text-[#111827] mb-2">HireLens</p>
                  <p className="text-gray-600 text-sm">
                    KG 7 Ave, Kigali Innovation City<br />
                    Kigali, Rwanda<br />
                    P.O. Box 1234
                  </p>
                </div>
                <div className="mt-6 p-4 bg-[#087F5B]/10 rounded-lg">
                  <p className="text-sm text-[#087F5B]">
                    <strong>Enterprise Support:</strong> For dedicated account management, 
                    contact enterprise@hirelens.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
