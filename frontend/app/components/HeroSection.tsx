import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative mt-[50px] bg-[#f8f8fd] overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px] py-12 sm:py-16 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        <div className="max-w-2xl w-full min-w-0">
          <h1 className="text-4xl sm:text-5xl lg:text-[70px] font-bold text-[#25324B] leading-tight">
            Screen
            <br />
            Applications
            <br />
            With <span className="text-[#087F5B]">Ease</span>
          </h1>

          <p className="text-gray-500 text-base mb-8 leading-relaxed pt-5">
            Streamline your hiring process with AI-driven candidate screening,
            automated workflows, and data-driven recruitment decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href="/admin"
              className="bg-[#087F5B] hover:bg-[#066B4D] text-white px-8 py-4 text-sm font-semibold transition-colors text-center"
            >
              Access Dashboard
            </a>
            <a
              href="/admin/jobs"
              className="border border-gray-300 hover:border-[#087F5B] hover:text-[#087F5B] text-gray-700 px-8 py-4 text-sm font-semibold transition-all text-center"
            >
              Manage Job Postings
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-start sm:justify-between gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#087F5B]">10K+</p>
              <p className="text-sm text-gray-500">Talent screening capacity</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#087F5B]">97%</p>
              <p className="text-sm text-gray-500">Faster Hiring</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#087F5B]">5s</p>
              <p className="text-sm text-gray-500">Screening latency</p>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[500px] aspect-[10/9] flex items-center justify-center">
          <div className="w-full max-w-[401px] aspect-square relative z-10 overflow-hidden shadow-lg rounded-xl">
            <Image
              src="/images/companies/group.jpg"
              alt="HireLens Dashboard"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
