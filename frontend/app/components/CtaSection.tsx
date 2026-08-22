import Image from "next/image";

export default function CtaSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px]">
        <div className="bg-[#087F5B] px-6 py-10 sm:px-[70px] sm:pt-[50px] sm:pb-[30px] flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-5 text-white text-center lg:text-left">
            <h3 className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-tight lg:leading-[50px]">
              Transform Your Hiring Today
            </h3>

            <p className="text-[16px] font-medium">
              AI-powered screening, automated workflows, and smarter decisions.
            </p>

            <a
              href="/admin/auth/login"
              className="inline-block px-[24px] py-[12px] bg-white text-[#087F5B] font-bold transition-all hover:bg-[#E8F7F0]"
            >
              Get Started
            </a>
          </div>

          <div className="relative w-full max-w-[600px] min-w-0">
            <Image
              src="/images/screenshots/dashboard.png"
              alt="Dashboard Screenshot"
              className="relative bottom-0 lg:bottom-[-40px] w-full h-auto"
              width={600}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
