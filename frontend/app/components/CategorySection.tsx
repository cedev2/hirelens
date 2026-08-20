import {
  ArrowRight,
  Briefcase,
  Users,
  BarChart3,
  FileText,
  Zap,
  Shield,
  Search,
  Settings,
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  highlighted?: boolean;
}

const features: Feature[] = [
  {
    name: "Job Management",
    description: "Create and manage job postings",
    icon: <Briefcase className="w-6 h-6" />,
    link: "/admin/jobs",
  },
  {
    name: "AI Screening",
    description: "Automated candidate screening",
    icon: <Zap className="w-6 h-6" />,
    link: "/admin/screening",
    highlighted: true,
  },
  {
    name: "Talent Pool",
    description: "Access pre-screened candidates",
    icon: <Users className="w-6 h-6" />,
    link: "/admin",
  },
  {
    name: "Analytics",
    description: "Track hiring metrics",
    icon: <BarChart3 className="w-6 h-6" />,
    link: "/admin",
  },
  {
    name: "Smart Search",
    description: "Find ideal candidates fast",
    icon: <Search className="w-6 h-6" />,
    link: "/admin",
  },
  {
    name: "Security",
    description: "Secure email/password login",
    icon: <Shield className="w-6 h-6" />,
    link: "/admin/settings",
  },
  {
    name: "Resume Parser",
    description: "Auto-extract candidate data",
    icon: <FileText className="w-6 h-6" />,
    link: "/admin",
  },
  {
    name: "Access Settings",
    description: "View and manage device sessions",
    icon: <Settings className="w-6 h-6" />,
    link: "/admin/settings",
  },
];

export default function CategorySection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-[122px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-bold text-[#25324B]">
            Powerful <span className="text-[#087F5B]">Features</span> for HR
            Teams
          </h2>
          <a
            href="/admin"
            className="flex items-center gap-2 text-sm font-medium text-[#087F5B] hover:text-[#066B4D]"
          >
            Access Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-4 gap-6">
          {features.map((feature) => (
            <a
              key={feature.name}
              href={feature.link}
              className={`group p-6 border transition-all ${
                feature.highlighted
                  ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                  : "bg-white border-gray-100 hover:border-[#087F5B] hover:shadow-md text-[#25324B]"
              }`}
            >
              <div
                className={`mb-4 ${
                  feature.highlighted ? "text-white" : "text-[#4F46E5]"
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
              <div
                className={`flex items-center gap-2 text-sm ${
                  feature.highlighted
                    ? "text-white/80"
                    : "text-gray-500 group-hover:text-[#087F5B]"
                }`}
              >
                <span>{feature.description}</span>
                <ArrowRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                    feature.highlighted ? "text-white" : ""
                  }`}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
