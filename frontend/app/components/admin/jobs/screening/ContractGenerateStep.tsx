"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  Edit3,
  User,
  Briefcase,
  Calendar,
  Clock,
  Download,
  Loader2,
  Eye,
} from "lucide-react";
import { BsCash } from "react-icons/bs";

export type ContractCandidate = {
  candidateId: string;
  name: string;
  email: string;
  position: string;
};

export type ContractData = {
  salary: string;
  startDate: string;
  employmentType: "full-time" | "part-time" | "contract";
  probationPeriod: string;
  workingHours: string;
  benefits: string[];
  terms: string;
};

const DEFAULT_CONTRACT_TEMPLATE = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into between:

EMPLOYER: HireLens Ltd.
Address: [Company Address]

AND

EMPLOYEE: {{candidateName}}
Position: {{position}}
Start Date: {{startDate}}

1. POSITION AND DUTIES
The Employee is hereby employed as {{position}}. The Employee agrees to perform all duties associated with this position to the best of their ability.

2. COMPENSATION
The Employee shall receive a monthly salary of {{salary}} Rwandan Francs, payable on the last working day of each month.

3. EMPLOYMENT TYPE
This is a {{employmentType}} position.

4. PROBATION PERIOD
The Employee shall serve a probationary period of {{probationPeriod}}. During this period, either party may terminate this agreement with one week's notice.

5. WORKING HOURS
Normal working hours shall be {{workingHours}}.

6. BENEFITS
The Employee shall be entitled to: {{benefits}}

7. TERMINATION
After the probation period, either party may terminate this agreement with one month's written notice.

8. CONFIDENTIALITY
The Employee agrees to maintain strict confidentiality regarding all company information.

Signed this {{signDate}}

_______________________
For HireLens Ltd.

_______________________
{{candidateName}} (Employee)`;

export default function ContractGenerateStep({
  candidates,
  jobTitle,
  onContinue,
  onBack,
}: {
  candidates: ContractCandidate[];
  jobTitle: string;
  onContinue: (
    contracts: {
      candidateId: string;
      contractText: string;
      name: string;
      email: string;
    }[],
  ) => void;
  onBack: () => void;
}) {
  const [contractData, setContractData] = useState<ContractData>({
    salary: "500000",
    startDate: "",
    employmentType: "full-time",
    probationPeriod: "3 months",
    workingHours: "8:00 AM - 5:00 PM, Monday to Friday",
    benefits: [
      "Health insurance",
      "Annual leave (18 days)",
      "Paid public holidays",
    ],
    terms: DEFAULT_CONTRACT_TEMPLATE,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateField = <K extends keyof ContractData>(
    field: K,
    value: ContractData[K],
  ) => {
    setContractData((prev) => ({ ...prev, [field]: value }));
  };

  const generateContract = (candidate: ContractCandidate) => {
    const today = new Date().toLocaleDateString();
    return contractData.terms
      .replace(/{{candidateName}}/g, candidate.name)
      .replace(/{{position}}/g, jobTitle)
      .replace(/{{startDate}}/g, contractData.startDate || "[Start Date]")
      .replace(/{{salary}}/g, contractData.salary)
      .replace(/{{employmentType}}/g, contractData.employmentType)
      .replace(/{{probationPeriod}}/g, contractData.probationPeriod)
      .replace(/{{workingHours}}/g, contractData.workingHours)
      .replace(/{{benefits}}/g, contractData.benefits.join(", "))
      .replace(/{{signDate}}/g, today);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    const contracts = candidates.map((c) => ({
      candidateId: c.candidateId,
      contractText: generateContract(c),
      name: c.name,
      email: c.email,
    }));
    onContinue(contracts);
    setIsGenerating(false);
  };

  const canGenerate = contractData.salary && contractData.startDate;
  const previewCandidate =
    candidates.find((c) => c.candidateId === previewId) || candidates[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Interview Management
        </button>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <FileText className="h-4 w-4" />
          <span>Generate Employment Contracts</span>
        </div>
      </div>

      {/* Candidates */}
      <div className="rounded-xl border border-green-100 bg-[#F9FAFB] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#087F5B]/10 text-[#087F5B]">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#111827]">
              {candidates.length} contract{candidates.length > 1 ? "s" : ""} to
              generate
            </p>
            <p className="text-xs text-[#6B7280]">Position: {jobTitle}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {candidates.map((c) => (
            <button
              key={c.candidateId}
              onClick={() => setPreviewId(c.candidateId)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                previewId === c.candidateId
                  ? "bg-[#087F5B] text-white"
                  : "bg-white text-[#111827] border border-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Contract Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#111827]">Contract Details</h3>

          {/* Salary */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">
              <BsCash className="inline h-4 w-4 mr-1" />
              Monthly Salary (RWF)
            </label>
            <input
              type="number"
              value={contractData.salary}
              onChange={(e) => updateField("salary", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">
              <Calendar className="inline h-4 w-4 mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={contractData.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            />
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">
              Employment Type
            </label>
            <select
              value={contractData.employmentType}
              onChange={(e) =>
                updateField(
                  "employmentType",
                  e.target.value as ContractData["employmentType"],
                )
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          {/* Probation */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">
              Probation Period
            </label>
            <select
              value={contractData.probationPeriod}
              onChange={(e) => updateField("probationPeriod", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            >
              <option>1 month</option>
              <option>2 months</option>
              <option>3 months</option>
              <option>6 months</option>
              <option>No probation</option>
            </select>
          </div>

          {/* Working Hours */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">
              <Clock className="inline h-4 w-4 mr-1" />
              Working Hours
            </label>
            <input
              type="text"
              value={contractData.workingHours}
              onChange={(e) => updateField("workingHours", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            />
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">
              Benefits
            </label>
            <div className="flex flex-wrap gap-2">
              {contractData.benefits.map((benefit, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                >
                  {benefit}
                  <button
                    onClick={() =>
                      updateField(
                        "benefits",
                        contractData.benefits.filter((_, idx) => idx !== i),
                      )
                    }
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add benefit and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  updateField("benefits", [
                    ...contractData.benefits,
                    e.currentTarget.value.trim(),
                  ]);
                  e.currentTarget.value = "";
                }
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            />
          </div>
        </div>

        {/* Right: Template Editor & Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#111827]">Contract Template</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPreviewId(previewId ? null : candidates[0]?.candidateId)
                }
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  previewId
                    ? "bg-[#087F5B] text-white"
                    : "bg-gray-100 text-[#111827] hover:bg-gray-200"
                }`}
              >
                <Eye className="h-3 w-3" />
                {previewId ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  isEditing
                    ? "bg-[#087F5B] text-white"
                    : "bg-gray-100 text-[#111827] hover:bg-gray-200"
                }`}
              >
                <Edit3 className="h-3 w-3" />
                {isEditing ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={contractData.terms}
              onChange={(e) => updateField("terms", e.target.value)}
              rows={20}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B] font-mono"
            />
          ) : previewId ? (
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-[#6B7280]">
                Preview for {previewCandidate?.name}
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs text-[#111827]">
                  {generateContract(previewCandidate)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-sm text-[#6B7280]">
                Click "Show Preview" to see the generated contract
              </p>
            </div>
          )}

          <p className="text-xs text-[#6B7280]">
            Variables:{" "}
            {
              "{{candidateName}}, {{position}}, {{startDate}}, {{salary}}, {{employmentType}}, {{probationPeriod}}, {{workingHours}}, {{benefits}}, {{signDate}}"
            }
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-[#6B7280]">
          {!canGenerate && <span>Please fill in salary and start date</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-[#111827] hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#087F5B] px-6 py-2 text-sm font-bold text-white shadow-md shadow-green-100 hover:bg-[#066B4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isGenerating
              ? "Generating..."
              : `Generate ${candidates.length} Contracts`}
          </button>
        </div>
      </div>
    </div>
  );
}
