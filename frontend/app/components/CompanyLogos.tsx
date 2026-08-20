import Image from "next/image";

const companies = [
  { src: "/images/companies/group x.png", alt: "Group X" },
  { src: "/images/companies/dummy.png", alt: "Dummy" },
];

export default function CompanyLogos() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {[...companies, ...companies, ...companies, ...companies].map(
            (company, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-12 flex items-center justify-center h-16 w-40 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={company.src}
                  alt={company.alt}
                  width={160}
                  height={64}
                  className="object-contain max-h-16"
                />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
