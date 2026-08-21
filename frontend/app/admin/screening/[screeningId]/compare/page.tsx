"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertTriangle, FileText, X } from "lucide-react";
import { api } from "@/lib/api/client";

type BackendTalent = {
  _id: string;
  headline: string;
  bio?: string;
  location: string;
  skills?: { name: string; level?: string; yearsOfExperience?: number }[];
  languages?: { name: string; proficiency?: string }[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  availability?: { status?: string; type?: string };
  userId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  firstName?: string;
  lastName?: string;
};

type InternalScreening = {
  _id: string;
  jobId: string;
};

type BackendApplication = {
  _id: string;
  jobId: string;
  talentId: string;
  resumeUrl: string;
};

function fullName(t: BackendTalent | undefined) {
  const first = String(t?.userId?.firstName ?? t?.firstName ?? "").trim();
  const last = String(t?.userId?.lastName ?? t?.lastName ?? "").trim();
  return `${first} ${last}`.trim() || "Unnamed talent";
}

function normSet(values: string[]) {
  return new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean));
}

function skillList(t: BackendTalent | undefined) {
  const raw = Array.isArray(t?.skills) ? t!.skills : [];
  return raw.map((s) => String(s?.name ?? "")).filter(Boolean);
}

function langList(t: BackendTalent | undefined) {
  const raw = Array.isArray(t?.languages) ? t!.languages : [];
  return raw.map((l) => String(l?.name ?? "")).filter(Boolean);
}

function countArr(v: any) {
  return Array.isArray(v) ? v.length : 0;
}

function winsLabel(a: number, b: number) {
  if (a === b) return "Tie";
  return a > b ? "Wins" : "Loses";
}

function Chip({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "shared" | "unique" | "missing";
}) {
  const cls =
    tone === "shared"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "unique"
        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
        : "bg-amber-50 border-amber-200 text-amber-800";

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function ChipsRow({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "shared" | "unique" | "missing";
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#25324B]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? (
          items.map((x) => (
            <Chip key={`${tone}-${title}-${x}`} tone={tone}>
              {x}
            </Chip>
          ))
        ) : (
          <span className="text-xs text-[#7C8493]">None</span>
        )}
      </div>
    </div>
  );
}

export default function ScreeningComparePage() {
  const params = useParams<{ screeningId: string }>();
  const screeningId = params?.screeningId ?? "";
  const sp = useSearchParams();
  const a = sp.get("a") ?? "";
  const b = sp.get("b") ?? "";

  const [resumeModal, setResumeModal] = useState<{
    open: boolean;
    url: string;
    name: string;
  }>({ open: false, url: "", name: "" });

  const canLoad = !!screeningId && !!a && !!b && a !== b;

  const aQuery = useQuery({
    queryKey: ["admin", "screening", screeningId, "compare", "talent", a],
    enabled: canLoad,
    queryFn: async () => {
      const res = await api.get(`/talents/${a}`);
      return res.data?.fetchedTalent as BackendTalent;
    },
  });

  const bQuery = useQuery({
    queryKey: ["admin", "screening", screeningId, "compare", "talent", b],
    enabled: canLoad,
    queryFn: async () => {
      const res = await api.get(`/talents/${b}`);
      return res.data?.fetchedTalent as BackendTalent;
    },
  });

  const isLoading = aQuery.isLoading || bQuery.isLoading;
  const talentA = aQuery.data;
  const talentB = bQuery.data;

  const screeningQuery = useQuery({
    queryKey: ["admin", "screening", screeningId, "compare", "screening"],
    enabled: !!screeningId,
    queryFn: async () => {
      try {
        const res = await api.get(`/screening/${screeningId}`);
        return res.data?.fetchedScreening as InternalScreening;
      } catch {
        return null;
      }
    },
  });

  const applicationsQuery = useQuery({
    queryKey: [
      "admin",
      "screening",
      screeningId,
      "compare",
      "applications",
      screeningQuery.data?.jobId,
    ],
    enabled: !!screeningQuery.data?.jobId,
    queryFn: async () => {
      const jobId = screeningQuery.data!.jobId;
      const res = await api.get(`/applications/job/${jobId}`);
      return (res.data?.applications as BackendApplication[]) ?? [];
    },
  });

  const resumeUrlByTalentId = useMemo(() => {
    const apps = applicationsQuery.data ?? [];
    const map = new Map<string, string>();
    for (const app of apps) {
      const url = String(app?.resumeUrl ?? "").trim();
      if (!url || url === "#") continue;
      map.set(String(app.talentId), url);
    }
    return map;
  }, [applicationsQuery.data]);

  const computed = useMemo(() => {
    const aSkills = skillList(talentA);
    const bSkills = skillList(talentB);
    const aSet = normSet(aSkills);
    const bSet = normSet(bSkills);

    const sharedSkills = aSkills.filter((s) =>
      bSet.has(s.trim().toLowerCase()),
    );
    const aOnlySkills = aSkills.filter(
      (s) => !bSet.has(s.trim().toLowerCase()),
    );
    const bOnlySkills = bSkills.filter(
      (s) => !aSet.has(s.trim().toLowerCase()),
    );

    const aLang = langList(talentA);
    const bLang = langList(talentB);
    const aLangSet = normSet(aLang);
    const bLangSet = normSet(bLang);

    const sharedLang = aLang.filter((l) =>
      bLangSet.has(l.trim().toLowerCase()),
    );
    const aOnlyLang = aLang.filter(
      (l) => !bLangSet.has(l.trim().toLowerCase()),
    );
    const bOnlyLang = bLang.filter(
      (l) => !aLangSet.has(l.trim().toLowerCase()),
    );

    return {
      sharedSkills,
      aOnlySkills,
      bOnlySkills,
      sharedLang,
      aOnlyLang,
      bOnlyLang,
      aExp: countArr(talentA?.experience),
      bExp: countArr(talentB?.experience),
      aEdu: countArr(talentA?.education),
      bEdu: countArr(talentB?.education),
      aProj: countArr(talentA?.projects),
      bProj: countArr(talentB?.projects),
      aSkillCount: aSkills.length,
      bSkillCount: bSkills.length,
    };
  }, [talentA, talentB]);

  const aResumeUrl = resumeUrlByTalentId.get(a) ?? "";
  const bResumeUrl = resumeUrlByTalentId.get(b) ?? "";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/screening/${screeningId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#087F5B] hover:underline mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Link>
        <h1 className="text-2xl font-bold text-[#25324B]">
          Compare Candidates
        </h1>
        <p className="text-sm text-[#7C8493]">Diff layout, gaps, wins.</p>
      </div>

      {!canLoad ? (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Need 2 different candidates.
          </div>
          <p className="mt-1 text-xs">
            Go back, select 2 candidates, click Vs.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-gray-200 bg-white py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm text-[#7C8493]">Loading comparison...</p>
        </div>
      ) : !talentA || !talentB ? (
        <div className="rounded-[10px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Failed load one or both talent profiles.
        </div>
      ) : (
        <div className="rounded-[10px] border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-0">
            <div className="md:pr-8">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C8493]">
                Candidate A
              </p>
              <p className="mt-1 text-xl font-bold text-[#25324B]">
                {fullName(talentA)}
              </p>
              <p className="text-sm text-[#7C8493]">{talentA.headline}</p>

              {aResumeUrl ? (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setResumeModal({
                        open: true,
                        url: aResumeUrl,
                        name: fullName(talentA),
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </button>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                    Skills
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {computed.aSkillCount} (
                    {winsLabel(computed.aSkillCount, computed.bSkillCount)})
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                    Experience
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {computed.aExp} ({winsLabel(computed.aExp, computed.bExp)})
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                    Projects
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {computed.aProj} (
                    {winsLabel(computed.aProj, computed.bProj)})
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm font-bold text-[#25324B]">
                    Skills Comparison
                  </p>
                  <div className="mt-3 space-y-3">
                    <ChipsRow
                      title="Shared"
                      items={computed.sharedSkills}
                      tone="shared"
                    />
                    <ChipsRow
                      title="A unique"
                      items={computed.aOnlySkills}
                      tone="unique"
                    />
                    <ChipsRow
                      title="Missing (B has)"
                      items={computed.bOnlySkills}
                      tone="missing"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-[#25324B]">
                    Languages Comparison
                  </p>
                  <div className="mt-3 space-y-3">
                    <ChipsRow
                      title="Shared"
                      items={computed.sharedLang}
                      tone="shared"
                    />
                    <ChipsRow
                      title="A unique"
                      items={computed.aOnlyLang}
                      tone="unique"
                    />
                    <ChipsRow
                      title="Missing (B has)"
                      items={computed.bOnlyLang}
                      tone="missing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                      Education entries
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#25324B]">
                      {computed.aEdu}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                      Availability
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#25324B]">
                      {talentA.availability?.type ?? "HireLens"} •{" "}
                      {talentA.availability?.status ?? "HireLens"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-stretch px-8">
              <div className="w-px border-l border-dashed border-gray-300" />
            </div>

            <div className="md:pl-8">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C8493]">
                Candidate B
              </p>
              <p className="mt-1 text-xl font-bold text-[#25324B]">
                {fullName(talentB)}
              </p>
              <p className="text-sm text-[#7C8493]">{talentB.headline}</p>

              {bResumeUrl ? (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setResumeModal({
                        open: true,
                        url: bResumeUrl,
                        name: fullName(talentB),
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </button>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                    Skills
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {computed.bSkillCount} (
                    {winsLabel(computed.bSkillCount, computed.aSkillCount)})
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                    Experience
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {computed.bExp} ({winsLabel(computed.bExp, computed.aExp)})
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                    Projects
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {computed.bProj} (
                    {winsLabel(computed.bProj, computed.aProj)})
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm font-bold text-[#25324B]">
                    Skills Comparison
                  </p>
                  <div className="mt-3 space-y-3">
                    <ChipsRow
                      title="Shared"
                      items={computed.sharedSkills}
                      tone="shared"
                    />
                    <ChipsRow
                      title="B unique"
                      items={computed.bOnlySkills}
                      tone="unique"
                    />
                    <ChipsRow
                      title="Missing (A has)"
                      items={computed.aOnlySkills}
                      tone="missing"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-[#25324B]">
                    Languages Comparison
                  </p>
                  <div className="mt-3 space-y-3">
                    <ChipsRow
                      title="Shared"
                      items={computed.sharedLang}
                      tone="shared"
                    />
                    <ChipsRow
                      title="B unique"
                      items={computed.bOnlyLang}
                      tone="unique"
                    />
                    <ChipsRow
                      title="Missing (A has)"
                      items={computed.aOnlyLang}
                      tone="missing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                      Education entries
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#25324B]">
                      {computed.bEdu}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#7C8493]">
                      Availability
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#25324B]">
                      {talentB.availability?.type ?? "HireLens"} •{" "}
                      {talentB.availability?.status ?? "HireLens"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {resumeModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="relative h-full max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[10px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C8493]">
                  Resume
                </p>
                <p className="truncate text-sm font-bold text-[#25324B]">
                  {resumeModal.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={resumeModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Open
                </a>
                <button
                  onClick={() =>
                    setResumeModal({ open: false, url: "", name: "" })
                  }
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="h-[calc(90vh-72px)] bg-gray-50">
              <iframe
                title="Resume preview"
                src={resumeModal.url}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
