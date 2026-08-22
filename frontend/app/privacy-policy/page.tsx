import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-[100px]">
        <section className="py-16">
          <div className="mx-[122px] max-w-4xl">
            <h1 className="text-4xl font-bold text-[#111827] mb-8">
              Privacy Policy
            </h1>
            <p className="text-gray-500 mb-8">Last updated: April 21, 2026</p>

            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-[#111827] mb-4">1. Introduction</h2>
                <p className="leading-relaxed">
                  HireLens (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you use our AI-powered talent acquisition platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#111827] mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">For Employers (HR Admins):</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Account information (name, email, company)</li>
                  <li>Job posting details</li>
                  <li>Screening criteria and preferences</li>
                  <li>Usage analytics and logs</li>
                </ul>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">For Candidates:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal information (name, contact details)</li>
                  <li>Resume/CV and application materials</li>
                  <li>Skills and experience data</li>
                  <li>Assessment results and screening scores</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#111827] mb-4">3. How We Use Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our AI screening services</li>
                  <li>To match candidates with suitable job opportunities</li>
                  <li>To improve our AI algorithms and platform features</li>
                  <li>To communicate with users about their accounts and applications</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#111827] mb-4">4. Data Security</h2>
                <p className="leading-relaxed">
                  We implement industry-standard security measures including encryption, access controls, 
                  and regular security audits. All data is stored in secure, GDPR-compliant infrastructure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#111827] mb-4">5. Your Rights</h2>
                <p className="leading-relaxed mb-4">
                  Under GDPR and applicable privacy laws, you have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request correction or deletion</li>
                  <li>Object to processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#111827] mb-4">6. Contact Us</h2>
                <p className="leading-relaxed">
                  For privacy-related questions or to exercise your rights, contact us at: 
                  privacy@hirelens.com
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
