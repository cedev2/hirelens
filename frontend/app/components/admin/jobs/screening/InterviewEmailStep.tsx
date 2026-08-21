"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Mail,
  Clock,
  Calendar,
  MapPin,
  Video,
  User,
  Edit3,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export type InterviewEmailCandidate = {
  candidateId: string;
  name: string;
  email: string;
  rank: number;
  matchScore: number;
};

type InterviewType = "video" | "in-person" | "phone";

const DEFAULT_TEMPLATES: Record<
  InterviewType,
  { subject: string; body: string }
> = {
  video: {
    subject: "Interview Invitation - {{jobTitle}} at HireLens",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at HireLens. We have reviewed your application and are impressed with your background.

We would like to invite you for a video interview.

📅 Interview Details:
• Date: {{interviewDate}}
• Time: {{interviewTime}}
• Duration: {{duration}}
• Platform: Google Meet/Zoom (link will be shared)

Please confirm your availability by replying to this email.

We look forward to speaking with you!

Best regards,
HireLens Hiring Team`,
  },
  "in-person": {
    subject: "Interview Invitation - {{jobTitle}} at HireLens",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at HireLens. We have reviewed your application and are impressed with your background.

We would like to invite you for an in-person interview at our office.

📅 Interview Details:
• Date: {{interviewDate}}
• Time: {{interviewTime}}
• Duration: {{duration}}
• Location: {{location}}

Please confirm your attendance by replying to this email.

We look forward to meeting you!

Best regards,
HireLens Hiring Team`,
  },
  phone: {
    subject: "Phone Interview Invitation - {{jobTitle}} at HireLens",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at HireLens.

We would like to schedule a brief phone interview to discuss your background and the role.

📅 Interview Details:
• Date: {{interviewDate}}
• Time: {{interviewTime}}
• Duration: {{duration}}
• Phone: {{phoneNumber}}

Please confirm your availability by replying to this email.

Best regards,
HireLens Hiring Team`,
  },
};

export default function InterviewEmailStep({
  candidates,
  jobTitle,
  onSend,
  onBack,
}: {
  candidates: InterviewEmailCandidate[];
  jobTitle: string;
  onSend: (data: {
    candidates: InterviewEmailCandidate[];
    interviewType: InterviewType;
    date: string;
    time: string;
    duration: string;
    location?: string;
    subject: string;
    body: string;
  }) => void;
  onBack: () => void;
}) {
  const [interviewType, setInterviewType] = useState<InterviewType>("video");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("45 minutes");
  const [location, setLocation] = useState("HireLens HQ, Kigali");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState(DEFAULT_TEMPLATES.video.subject);
  const [body, setBody] = useState(DEFAULT_TEMPLATES.video.body);
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const replaceVariables = (text: string, candidateName: string) => {
    return text
      .replace(/{{candidateName}}/g, candidateName)
      .replace(/{{jobTitle}}/g, jobTitle)
      .replace(/{{interviewDate}}/g, date || "[Date]")
      .replace(/{{interviewTime}}/g, time || "[Time]")
      .replace(/{{duration}}/g, duration)
      .replace(/{{location}}/g, location)
      .replace(/{{phoneNumber}}/g, phoneNumber || "[Phone Number]");
  };

  const handleTypeChange = (type: InterviewType) => {
    setInterviewType(type);
    setSubject(DEFAULT_TEMPLATES[type].subject);
    setBody(DEFAULT_TEMPLATES[type].body);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend({
        candidates,
        interviewType,
        date,
        time,
        duration,
        location,
        subject,
        body,
      });
    } finally {
      setIsSending(false);
    }
  };

  const canSend = date && time && candidates.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C8493] hover:text-[#25324B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shortlist
        </button>
        <div className="flex items-center gap-2 text-sm text-[#7C8493]">
          <Mail className="h-4 w-4" />
          <span>Compose Interview Invitations</span>
        </div>
      </div>

      {/* Recipients */}
      <div className="rounded-xl border border-green-100 bg-[#F8F8FD] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#087F5B]/10 text-[#087F5B]">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#25324B]">
              {candidates.length} candidates will receive interview invitations
            </p>
            <p className="text-xs text-[#7C8493]">
              {jobTitle} • Ranks #{candidates[0]?.rank || "-"} to #
              {candidates[candidates.length - 1]?.rank || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Interview Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#25324B]">Interview Details</h3>

          {/* Interview Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#25324B]">
              Interview Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(["video", "in-person", "phone"] as InterviewType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                      interviewType === type
                        ? "border-[#087F5B] bg-[#E8F7F0] text-[#087F5B]"
                        : "border-gray-200 bg-white text-[#7C8493] hover:border-gray-300"
                    }`}
                  >
                    {type === "video" && <Video className="h-5 w-5" />}
                    {type === "in-person" && <MapPin className="h-5 w-5" />}
                    {type === "phone" && <User className="h-5 w-5" />}
                    <span className="text-xs font-medium capitalize">
                      {type.replace("-", " ")}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#25324B]">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#25324B]">
                <Clock className="inline h-4 w-4 mr-1" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#25324B]">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
            >
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option>1 hour</option>
              <option>1.5 hours</option>
              <option>2 hours</option>
            </select>
          </div>

          {/* Location/Phone */}
          {interviewType === "in-person" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#25324B]">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
              />
            </div>
          )}
          {interviewType === "phone" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#25324B]">
                Your Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Number to call candidate"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
              />
            </div>
          )}
        </div>

        {/* Right: Email Template */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#25324B]">Email Template</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                isEditing
                  ? "bg-[#087F5B] text-white"
                  : "bg-gray-100 text-[#25324B] hover:bg-gray-200"
              }`}
            >
              <Edit3 className="h-3 w-3" />
              {isEditing ? "Done Editing" : "Edit Template"}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#25324B]">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#25324B]">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B] font-mono"
                />
              </div>
              <p className="text-xs text-[#7C8493]">
                {
                  "Variables: {{candidateName}}, {{jobTitle}}, {{interviewDate}}, {{interviewTime}}, {{duration}}, {{location}}, {{phoneNumber}}"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-[#7C8493]">
                  Preview (for {candidates[0]?.name || "Candidate"})
                </div>
                <div className="p-4 space-y-3">
                  <p className="font-semibold text-[#25324B]">
                    {replaceVariables(
                      subject,
                      candidates[0]?.name || "Candidate",
                    )}
                  </p>
                  <div className="text-sm text-[#25324B] whitespace-pre-wrap">
                    {replaceVariables(body, candidates[0]?.name || "Candidate")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-[#7C8493]">
          {!canSend && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              Please select date and time
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend || isSending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#087F5B] px-6 py-2 text-sm font-bold text-white shadow-md shadow-green-100 hover:bg-[#066B4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSending
              ? "Sending..."
              : `Send to ${candidates.length} Candidates`}
          </button>
        </div>
      </div>
    </div>
  );
}
