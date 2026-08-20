import Image from "next/image";

export default function CtaSection() {
  return (
    <section className="py-16">
      <div className="mx-[122px] bg-[#4640de] px-[70px] pt-[50px] pb-[30px] flex items-center justify-between">
        <div className="space-y-5 text-white">
          <h3 className="text-[48px] font-bold leading-[50px]">
            Transform Your <br /> Hiring Today
          </h3>

          <p className="text-[16px] font-medium">
            AI-powered screening, automated workflows, and smarter decisions.
          </p>

          <a
            href="/admin/auth/login"
            className="inline-block px-[24px] py-[12px] bg-white text-[#4640de] font-bold transition-all hover:bg-[#d6d5fd]"
          >
            Get Started
          </a>
        </div>

        <div className="relative">
          <Image
            src="/images/screenshots/dashboard.png"
            alt="Dashboard Screenshot"
            className="relative bottom-[-40px]"
            width={600}
            height={600}
          />
        </div>
      </div>
    </section>
  );
}
