import { Request, Response } from "express";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
type LangProf = "Basic" | "Conversational" | "Fluent" | "Native";
type AvailabilityStatus = "Available" | "Open" | "Not Available";
type AvailabilityType = "Full-time" | "Part-time" | "Contract";

type HirelensTalent = {
  email: string;
  firstName: string;
  lastName?: string;
  headline: string;
  bio?: string;
  location?: string;
  skills: Array<{
    name: string;
    level: SkillLevel;
    yearsOfExperience: number;
  }>;
  languages: Array<{
    name?: string;
    proficiency?: LangProf;
  }>;
  experience: Array<{
    company?: string;
    role?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    technologies: string[];
    IsCurrent?: boolean;
  }>;
  education: Array<{
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    startYear?: Date;
    endYear?: Date;
  }>;
  certifications: Array<{
    name?: string;
    issuer?: string;
    issueDate?: Date;
  }>;
  projects: Array<{
    name?: string;
    description?: string;
    technologies: string[];
    role?: string;
    link?: string;
    startDate?: Date;
    endDate?: Date;
  }>;
  availability: {
    status?: AvailabilityStatus;
    type?: AvailabilityType;
    startDate?: Date;
  };
  socialLinks: string[];
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function int(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function yearsAgo(n: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}

function buildDummyTalents(count = 30): HirelensTalent[] {
  const firstNames = [
    "David",
    "Amina",
    "Brian",
    "Grace",
    "Kevin",
    "Sarah",
    "Joshua",
    "Linda",
    "Daniel",
    "Patricia",
  ];
  const lastNames = [
    "Uwimana",
    "Niyonkuru",
    "Mugisha",
    "Mukamana",
    "Okello",
    "Kamanzi",
    "Nkurunziza",
    "Tumusiime",
  ];
  const locations = ["Kigali", "Nairobi", "Kampala", "Remote", "Lagos"];
  const headlines = [
    "Full-Stack Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "UI/UX Designer",
    "Data Analyst",
    "DevOps Engineer",
  ];
  const skills = [
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Python",
    "Django",
    "Go",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
  ];
  const languages = ["English", "French", "Kinyarwanda", "Swahili"];
  const tech = [
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "Docker",
    "AWS",
  ];

  const skillLevels: SkillLevel[] = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
  ];
  const langProfs: LangProf[] = ["Basic", "Conversational", "Fluent", "Native"];
  const availStatus: AvailabilityStatus[] = [
    "Available",
    "Open",
    "Not Available",
  ];
  const availTypes: AvailabilityType[] = ["Full-time", "Part-time", "Contract"];

  return Array.from({ length: count }).map((_, idx) => {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);

    const email = `${firstName}.${lastName}.${idx + 1}@dummy-hirelens.com`
      .toLowerCase()
      .replace(/\s+/g, "");

    const headline = `${pick(headlines)} | ${pick(["Remote", "Hybrid", "On-site"])}`;

    const selectedSkills = Array.from({ length: int(4, 8) }).map(() => ({
      name: pick(skills),
      level: pick(skillLevels),
      yearsOfExperience: int(1, 8),
    }));

    const selectedLang = Array.from({ length: int(1, 3) }).map(() => ({
      name: pick(languages),
      proficiency: pick(langProfs),
    }));

    const expCount = int(1, 3);
    const experience = Array.from({ length: expCount }).map((__, i) => {
      const start = yearsAgo(int(1 + i, 7 + i));
      const current = i === 0 && Math.random() > 0.6;
      const end = current ? undefined : yearsAgo(int(0, 2));
      return {
        company: pick(["HireLens", "FinTechX", "HealthTech", "EduLabs"]),
        role: pick([
          "Software Engineer",
          "Senior Engineer",
          "Product Designer",
          "Data Analyst",
        ]),
        startDate: start,
        endDate: end,
        description:
          "Built products, shipped features, collaborated cross-functionally.",
        technologies: Array.from({ length: int(3, 6) }).map(() => pick(tech)),
        IsCurrent: current,
      };
    });

    const education = [
      {
        institution: pick([
          "University of Rwanda",
          "Kigali Independent University",
          "Makerere University",
        ]),
        degree: pick(["BSc", "MSc"]),
        fieldOfStudy: pick([
          "Computer Science",
          "Information Systems",
          "Software Engineering",
        ]),
        startYear: yearsAgo(int(6, 10)),
        endYear: yearsAgo(int(1, 5)),
      },
    ];

    const certifications = Array.from({ length: int(0, 2) }).map(() => ({
      name: pick(["AWS CCP", "Google Data Analytics", "Scrum Master"]),
      issuer: pick(["AWS", "Google", "Scrum.org"]),
      issueDate: daysAgo(int(60, 900)),
    }));

    const projects = Array.from({ length: int(1, 3) }).map((__, p) => ({
      name: `Project ${p + 1}`,
      description:
        "Portfolio project with real-world constraints and delivery.",
      technologies: Array.from({ length: int(2, 5) }).map(() => pick(tech)),
      role: pick(["Owner", "Contributor", "Lead"]),
      link: "https://example.com",
      startDate: yearsAgo(int(1, 3)),
      endDate: yearsAgo(int(0, 1)),
    }));

    return {
      email,
      firstName,
      lastName,
      headline,
      bio: "Passionate builder focused on impact, product thinking, and quality.",
      location: pick(locations),
      skills: selectedSkills,
      languages: selectedLang,
      experience,
      education,
      certifications,
      projects,
      availability: {
        status: pick(availStatus),
        type: pick(availTypes),
        startDate: daysAgo(int(0, 45)),
      },
      socialLinks: ["https://linkedin.com", "https://github.com"],
    };
  });
}

export const hirelensController = {
  async getDummyTalents(req: Request, res: Response) {
    const count = Number(req.query.count ?? 30);
    const safeCount = Number.isFinite(count)
      ? Math.min(Math.max(count, 1), 100)
      : 30;

    const talents = buildDummyTalents(safeCount);
    return res.status(200).json({
      message: `${talents.length} dummy talents generated`,
      talents,
    });
  },
};
