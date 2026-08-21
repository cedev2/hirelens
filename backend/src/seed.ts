import mongoose from "mongoose";
import bcrypt from "bcrypt";
import ENV from "./config/env";
import User from "./models/user.model";
import Talent from "./models/talents.model";
import Jobs from "./models/jobs.model";
import Application from "./models/application.model";
import Screening from "./models/screening.model";

async function seed() {
  console.log("Connecting to", ENV.mongo_uri);
  await mongoose.connect(ENV.mongo_uri);
  console.log("Connected. Cleaning existing HireLens data...");

  await Promise.all([
    User.deleteMany({}),
    Talent.deleteMany({}),
    Jobs.deleteMany({}),
    Application.deleteMany({}),
    Screening.deleteMany({}),
  ]);

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await User.create({
    email: "admin@hirelens.com",
    password: adminPassword,
    firstName: "HireLens",
    lastName: "Admin",
    role: "admin",
    isActive: true,
    emailVerified: true,
  });
  console.log("Admin user created:", admin.email);

  const talentsData = [
    {
      email: "david.uwimana@example.com",
      firstName: "David",
      lastName: "Uwimana",
      headline: "Senior Full-Stack Developer | React, Node.js, TypeScript",
      bio: "Full-stack engineer with 7 years building scalable web applications.",
      location: "Kigali, Rwanda",
      skills: [
        { name: "React", level: "Expert", yearsOfExperience: 6 },
        { name: "Node.js", level: "Advanced", yearsOfExperience: 5 },
        { name: "TypeScript", level: "Advanced", yearsOfExperience: 5 },
        { name: "MongoDB", level: "Advanced", yearsOfExperience: 4 },
        { name: "PostgreSQL", level: "Intermediate", yearsOfExperience: 3 },
      ],
      languages: [
        { name: "English", proficiency: "Fluent" },
        { name: "Kinyarwanda", proficiency: "Native" },
      ],
      experience: [
        {
          company: "FinTechX",
          role: "Senior Full-Stack Developer",
          startDate: new Date("2019-01-01"),
          endDate: undefined,
          description:
            "Led the development of payment platforms serving 500K users.",
          technologies: ["React", "Node.js", "MongoDB", "AWS"],
          IsCurrent: true,
        },
        {
          company: "HealthTech",
          role: "Software Engineer",
          startDate: new Date("2017-01-01"),
          endDate: new Date("2018-12-01"),
          description: "Built patient management dashboards.",
          technologies: ["React", "Express", "PostgreSQL"],
          IsCurrent: false,
        },
      ],
      education: [
        {
          institution: "University of Rwanda",
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          startYear: new Date("2012-01-01"),
          endYear: new Date("2016-12-01"),
        },
      ],
      certifications: [
        { name: "AWS Developer Associate", issuer: "AWS", issueDate: new Date("2021-06-01") },
      ],
      projects: [
        {
          name: "Real-time Analytics Dashboard",
          description: "Streaming analytics platform with websockets.",
          technologies: ["React", "Node.js", "Redis"],
          role: "Lead",
          startDate: new Date("2022-01-01"),
          endDate: new Date("2022-08-01"),
        },
      ],
      availability: { status: "Available", type: "Full-time" },
      socialLinks: ["https://linkedin.com", "https://github.com"],
    },
    {
      email: "amina.niyonkuru@example.com",
      firstName: "Amina",
      lastName: "Niyonkuru",
      headline: "Frontend Engineer | Next.js, React, TypeScript",
      bio: "Product-focused frontend engineer passionate about UX.",
      location: "Kigali, Rwanda",
      skills: [
        { name: "React", level: "Advanced", yearsOfExperience: 4 },
        { name: "Next.js", level: "Advanced", yearsOfExperience: 3 },
        { name: "TypeScript", level: "Advanced", yearsOfExperience: 3 },
        { name: "Tailwind CSS", level: "Expert", yearsOfExperience: 4 },
      ],
      languages: [{ name: "English", proficiency: "Fluent" }],
      experience: [
        {
          company: "EduLabs",
          role: "Frontend Engineer",
          startDate: new Date("2021-03-01"),
          endDate: undefined,
          description: "Built e-learning platform used by 100K students.",
          technologies: ["Next.js", "React", "Tailwind"],
          IsCurrent: true,
        },
      ],
      education: [
        {
          institution: "Kigali Independent University",
          degree: "BSc",
          fieldOfStudy: "Software Engineering",
          startYear: new Date("2016-01-01"),
          endYear: new Date("2020-12-01"),
        },
      ],
      certifications: [],
      projects: [
        {
          name: "Design System Library",
          description: "Reusable component library with Storybook.",
          technologies: ["React", "Storybook"],
          role: "Owner",
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-05-01"),
        },
      ],
      availability: { status: "Available", type: "Full-time" },
      socialLinks: ["https://github.com"],
    },
    {
      email: "brian.mugisha@example.com",
      firstName: "Brian",
      lastName: "Mugisha",
      headline: "Backend Engineer | Node.js, PostgreSQL, Docker",
      bio: "Backend engineer focused on APIs, microservices and reliability.",
      location: "Nairobi, Kenya",
      skills: [
        { name: "Node.js", level: "Expert", yearsOfExperience: 6 },
        { name: "TypeScript", level: "Advanced", yearsOfExperience: 4 },
        { name: "PostgreSQL", level: "Advanced", yearsOfExperience: 5 },
        { name: "Docker", level: "Advanced", yearsOfExperience: 4 },
        { name: "Kubernetes", level: "Intermediate", yearsOfExperience: 2 },
      ],
      languages: [{ name: "English", proficiency: "Fluent" }],
      experience: [
        {
          company: "HealthTech",
          role: "Senior Backend Engineer",
          startDate: new Date("2020-02-01"),
          endDate: undefined,
          description: "Designed microservices handling 2M daily API calls.",
          technologies: ["Node.js", "PostgreSQL", "Docker", "Kubernetes"],
          IsCurrent: true,
        },
        {
          company: "HireLens",
          role: "Backend Engineer",
          startDate: new Date("2018-02-01"),
          endDate: new Date("2020-01-01"),
          description: "Built REST APIs for recruitment platform.",
          technologies: ["Node.js", "Express", "MongoDB"],
          IsCurrent: false,
        },
      ],
      education: [
        {
          institution: "Makerere University",
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          startYear: new Date("2013-01-01"),
          endYear: new Date("2017-12-01"),
        },
      ],
      certifications: [
        { name: "AWS Solutions Architect", issuer: "AWS", issueDate: new Date("2022-03-01") },
      ],
      projects: [],
      availability: { status: "Open", type: "Contract" },
      socialLinks: ["https://github.com", "https://linkedin.com"],
    },
    {
      email: "grace.mukamana@example.com",
      firstName: "Grace",
      lastName: "Mukamana",
      headline: "UI/UX Designer | Figma, Design Systems",
      bio: "Designer bridging business goals and user needs.",
      location: "Kampala, Uganda",
      skills: [
        { name: "Figma", level: "Expert", yearsOfExperience: 5 },
        { name: "User Research", level: "Advanced", yearsOfExperience: 4 },
        { name: "Prototyping", level: "Expert", yearsOfExperience: 5 },
      ],
      languages: [{ name: "English", proficiency: "Fluent" }],
      experience: [
        {
          company: "FinTechX",
          role: "Product Designer",
          startDate: new Date("2021-01-01"),
          endDate: undefined,
          description: "Redesigned onboarding flow improving conversion by 25%.",
          technologies: ["Figma", "Maze"],
          IsCurrent: true,
        },
      ],
      education: [
        {
          institution: "Makerere University",
          degree: "BDes",
          fieldOfStudy: "Design",
          startYear: new Date("2015-01-01"),
          endYear: new Date("2019-12-01"),
        },
      ],
      certifications: [],
      projects: [
        {
          name: "FinTech App Redesign",
          description: "Full mobile app redesign with design tokens.",
          technologies: ["Figma"],
          role: "Lead",
          startDate: new Date("2022-06-01"),
          endDate: new Date("2022-12-01"),
        },
      ],
      availability: { status: "Available", type: "Part-time" },
      socialLinks: ["https://dribbble.com"],
    },
    {
      email: "kevin.okello@example.com",
      firstName: "Kevin",
      lastName: "Okello",
      headline: "Data Analyst | Python, SQL, Power BI",
      bio: "Data analyst turning raw data into decisions.",
      location: "Nairobi, Kenya",
      skills: [
        { name: "Python", level: "Advanced", yearsOfExperience: 4 },
        { name: "SQL", level: "Advanced", yearsOfExperience: 5 },
        { name: "Excel", level: "Expert", yearsOfExperience: 6 },
        { name: "Power BI", level: "Advanced", yearsOfExperience: 3 },
      ],
      languages: [{ name: "English", proficiency: "Native" }, { name: "Swahili", proficiency: "Native" }],
      experience: [
        {
          company: "EduLabs",
          role: "Data Analyst",
          startDate: new Date("2020-04-01"),
          endDate: undefined,
          description: "Built reporting dashboards for executive team.",
          technologies: ["Python", "SQL", "Power BI"],
          IsCurrent: true,
        },
      ],
      education: [
        {
          institution: "University of Nairobi",
          degree: "BSc",
          fieldOfStudy: "Statistics",
          startYear: new Date("2014-01-01"),
          endYear: new Date("2018-12-01"),
        },
      ],
      certifications: [
        { name: "Google Data Analytics", issuer: "Google", issueDate: new Date("2021-09-01") },
      ],
      projects: [],
      availability: { status: "Open", type: "Full-time" },
      socialLinks: ["https://linkedin.com"],
    },
    {
      email: "sarah.kamanzi@example.com",
      firstName: "Sarah",
      lastName: "Kamanzi",
      headline: "DevOps Engineer | AWS, Docker, Kubernetes",
      bio: "Automating infrastructure and CI/CD pipelines.",
      location: "Remote",
      skills: [
        { name: "AWS", level: "Expert", yearsOfExperience: 6 },
        { name: "Docker", level: "Expert", yearsOfExperience: 5 },
        { name: "Kubernetes", level: "Advanced", yearsOfExperience: 4 },
        { name: "Terraform", level: "Advanced", yearsOfExperience: 3 },
        { name: "CI/CD", level: "Advanced", yearsOfExperience: 5 },
      ],
      languages: [{ name: "English", proficiency: "Fluent" }],
      experience: [
        {
          company: "HealthTech",
          role: "DevOps Engineer",
          startDate: new Date("2019-06-01"),
          endDate: undefined,
          description: "Managed AWS infrastructure and Kubernetes clusters.",
          technologies: ["AWS", "Kubernetes", "Terraform"],
          IsCurrent: true,
        },
      ],
      education: [
        {
          institution: "University of Rwanda",
          degree: "BSc",
          fieldOfStudy: "Information Technology",
          startYear: new Date("2013-01-01"),
          endYear: new Date("2017-12-01"),
        },
      ],
      certifications: [
        { name: "AWS DevOps Pro", issuer: "AWS", issueDate: new Date("2020-11-01") },
      ],
      projects: [],
      availability: { status: "Available", type: "Full-time" },
      socialLinks: ["https://github.com"],
    },
  ];

  const jobsData = [
    {
      title: "Senior Full-Stack Developer",
      description:
        "Build and scale full-stack web applications using React, Node.js and TypeScript. Own features end-to-end from database schema to polished UI.",
      requirements: [
        "5+ years building web applications",
        "Expert in React and TypeScript",
        "Strong Node.js backend experience",
        "Experience with MongoDB or PostgreSQL",
        "Experience with cloud platforms (AWS preferred)",
      ],
      weights: { skills: 40, experience: 35, education: 25 },
      deadline: new Date("2026-12-31"),
      jobType: "full-time",
      locationType: "remote",
      status: "open",
      salary: { amount: 4000, currency: "USD" },
      benefits: ["Health insurance", "Remote work", "Learning budget"],
    },
    {
      title: "Frontend Engineer",
      description:
        "Craft beautiful, accessible user interfaces with Next.js and React. Work closely with designers to ship pixel-perfect features.",
      requirements: [
        "3+ years frontend development",
        "Proficient in React and TypeScript",
        "Experience with Next.js",
        "Strong CSS and Tailwind skills",
        "Eye for UI/UX detail",
      ],
      weights: { skills: 40, experience: 35, education: 25 },
      deadline: new Date("2026-12-31"),
      jobType: "full-time",
      locationType: "hybrid",
      status: "open",
      salary: { amount: 2500, currency: "USD" },
      benefits: ["Health insurance", "Hybrid work"],
    },
    {
      title: "Backend Engineer",
      description:
        "Design robust APIs and microservices powering our recruitment platform. Focus on reliability, performance and clean architecture.",
      requirements: [
        "4+ years backend development",
        "Strong Node.js and TypeScript skills",
        "Experience with PostgreSQL and MongoDB",
        "Docker and containerization experience",
        "API design best practices",
      ],
      weights: { skills: 40, experience: 35, education: 25 },
      deadline: new Date("2026-11-30"),
      jobType: "full-time",
      locationType: "on-site",
      status: "open",
      salary: { amount: 3000, currency: "USD" },
      benefits: ["Health insurance", "On-site meals"],
    },
  ];

  const jobs = await Jobs.insertMany(jobsData);
  console.log(`${jobs.length} jobs created`);

  const talentUsers: any[] = [];
  for (const t of talentsData) {
    const user = await User.create({
      email: t.email,
      firstName: t.firstName,
      lastName: t.lastName,
      role: "applicant",
      isActive: true,
      emailVerified: true,
    });
    const talent = await Talent.create({
      userId: user._id,
      headline: t.headline,
      bio: t.bio,
      location: t.location,
      skills: t.skills,
      languages: t.languages,
      experience: t.experience,
      education: t.education,
      certifications: t.certifications,
      projects: t.projects,
      availability: t.availability,
      socialLinks: t.socialLinks,
    } as any);
    user.talentProfileId = talent._id.toString();
    await user.save();
    talentUsers.push({ user, talent });
  }
  console.log(`${talentUsers.length} talents created`);

  // Applicant user
  const applicantPassword = await bcrypt.hash("password", 10);
  const applicantUser = await User.create({
    email: "applicant@gmail.com",
    password: applicantPassword,
    firstName: "Jane",
    lastName: "Applicant",
    role: "applicant",
    isActive: true,
    emailVerified: true,
  }) as any;
  const applicantTalent = await Talent.create({
    userId: applicantUser._id,
    headline: "Frontend Developer | React, Next.js",
    bio: "Passionate frontend developer looking for new opportunities.",
    location: "Kigali, Rwanda",
    skills: [
      { name: "React", level: "Advanced", yearsOfExperience: 3 },
      { name: "Next.js", level: "Intermediate", yearsOfExperience: 2 },
      { name: "TypeScript", level: "Intermediate", yearsOfExperience: 2 },
      { name: "Tailwind CSS", level: "Advanced", yearsOfExperience: 3 },
    ],
    languages: [{ name: "English", proficiency: "Fluent" }],
    experience: [
      {
        company: "StartupXYZ",
        role: "Frontend Developer",
        startDate: new Date("2023-01-01"),
        endDate: undefined,
        description: "Built responsive web applications with React and Next.js.",
        technologies: ["React", "Next.js", "Tailwind"],
        IsCurrent: true,
      },
    ],
    education: [
      {
        institution: "University of Rwanda",
        degree: "BSc",
        fieldOfStudy: "Software Engineering",
        startYear: new Date("2018-01-01"),
        endYear: new Date("2022-12-01"),
      },
    ],
    certifications: [],
    projects: [],
    availability: { status: "Available", type: "Full-time" },
    socialLinks: [],
  }) as any;
  applicantUser.talentProfileId = applicantTalent._id.toString();
  await applicantUser.save();
  console.log("Applicant user created:", applicantUser.email);

  const applications = [
    { jobIndex: 0, talentIndex: 0 },
    { jobIndex: 0, talentIndex: 1 },
    { jobIndex: 0, talentIndex: 2 },
    { jobIndex: 0, talentIndex: 5 },
    { jobIndex: 1, talentIndex: 1 },
    { jobIndex: 1, talentIndex: 3 },
    { jobIndex: 2, talentIndex: 0 },
    { jobIndex: 2, talentIndex: 2 },
    { jobIndex: 2, talentIndex: 4 },
  ];

  for (const app of applications) {
    await Application.create({
      jobId: jobs[app.jobIndex]._id.toString(),
      talentId: talentUsers[app.talentIndex].talent._id.toString(),
      status: "pending",
    });
  }
  console.log(`${applications.length} applications created`);

  // Sample applications for the applicant user with varied statuses
  const applicantApps = [
    { jobIndex: 0, status: "reviewing" as const },
    { jobIndex: 1, status: "shortlisted" as const },
    { jobIndex: 2, status: "pending" as const },
  ];
  for (const app of applicantApps) {
    await Application.create({
      jobId: jobs[app.jobIndex]._id.toString(),
      talentId: applicantTalent._id.toString(),
      status: app.status,
      coverLetter: "I am excited to apply for this position and believe my skills are a great match.",
    });
  }
  console.log(`${applicantApps.length} applicant applications created`);

  const sampleScreening = await Screening.create({
    jobId: jobs[0]._id.toString(),
    candidates: [
      {
        candidateId: talentUsers[0].talent._id.toString(),
        rank: 1,
        matchScore: 92,
        confidence: "high",
        strengths: ["Full-stack expertise", "AWS certified", "7 years experience"],
        gaps: ["Limited Kubernetes exposure"],
        reasoning: "Matches all core requirements with deep full-stack experience.",
        finalRecommendation: "Strong hire",
      },
      {
        candidateId: talentUsers[2].talent._id.toString(),
        rank: 2,
        matchScore: 85,
        confidence: "high",
        strengths: ["Deep Node.js knowledge", "Microservices experience"],
        gaps: ["Frontend experience is limited"],
        reasoning: "Excellent backend profile, slightly less full-stack coverage.",
        finalRecommendation: "Strong hire",
      },
      {
        candidateId: talentUsers[1].talent._id.toString(),
        rank: 3,
        matchScore: 78,
        confidence: "medium",
        strengths: ["Excellent frontend skills", "Product-minded"],
        gaps: ["Less backend experience"],
        reasoning: "Strong frontend specialist; backend skills need verification.",
        finalRecommendation: "Hire",
      },
      {
        candidateId: talentUsers[5].talent._id.toString(),
        rank: 4,
        matchScore: 70,
        confidence: "medium",
        strengths: ["Cloud infrastructure skills", "CI/CD automation"],
        gaps: ["Limited application development experience"],
        reasoning: "DevOps profile; may be better suited for platform engineering.",
        finalRecommendation: "Consider",
      },
    ],
    comparisonSummary:
      "David is the strongest overall match for the Senior Full-Stack role. Brian and Amina are solid secondary candidates. (Sample pre-seeded screening - run a real AI screening for fresh results.)",
  });
  console.log("Sample screening created:", sampleScreening._id.toString());

  console.log("\nSeeding complete! Collections in Compass:");
  const collections = await mongoose.connection.db!.listCollections().toArray();
  for (const c of collections) console.log(" -", c.name);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
