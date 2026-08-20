import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-[100px]">
        <section className="py-16">
          <div className="mx-[122px] max-w-4xl">
            <h1 className="text-4xl font-bold text-[#25324B] mb-8">
              Terms of Service
            </h1>
            <p className="text-gray-500 mb-8">Last updated: April 21, 2026</p>

            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing or using HireLens, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of the terms, you may not access the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">2. Use of Service</h2>
                <p className="leading-relaxed mb-4">
                  HireLens is an AI-powered talent acquisition platform designed for HR professionals 
                  and hiring managers. You agree to use the service only for lawful purposes.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be at least 18 years old to use this service</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You agree not to use the service for any illegal or unauthorized purpose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">3. AI Screening</h2>
                <p className="leading-relaxed">
                  Our AI screening tools are designed to assist in the hiring process. While we strive for 
                  accuracy, final hiring decisions remain the sole responsibility of the employer. 
                  HireLens is not liable for hiring outcomes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">4. Data Privacy</h2>
                <p className="leading-relaxed">
                  All candidate data processed through our platform is handled in accordance with our 
                  Privacy Policy and applicable data protection laws including GDPR. You are responsible 
                  for ensuring your use of candidate data complies with local regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">5. Subscription & Billing</h2>
                <p className="leading-relaxed">
                  Some features may require a paid subscription. Billing cycles, refund policies, and 
                  cancellation terms are specified during the subscription process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">6. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  HireLens shall not be liable for any indirect, incidental, special, 
                  consequential or punitive damages resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#25324B] mb-4">7. Contact</h2>
                <p className="leading-relaxed">
                  For questions about these Terms, please contact us at: support@hirelens.com
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
