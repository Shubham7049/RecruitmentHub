import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Trophy,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { formatDateTime, formatDateOnly } from "../../utils/formatters";

export const ApplicationTimeline = ({ application }) => {
  if (!application) return null;

  const status = (application.status || "applied").toLowerCase().trim();
  const createdAt = application.createdAt;
  const updatedAt = application.updatedAt;

  // Derive step states based on backend status enum:
  // 'applied' -> 'shortlisted' -> 'interview' -> 'hired' (or 'rejected')
  const isAppliedDone = true; // Always done if application exists
  const isShortlistedDone = ["shortlisted", "interview", "hired"].includes(status);
  const isInterviewDone = ["interview", "hired"].includes(status);
  const isHired = status === "hired";
  const isRejected = status === "rejected";

  const steps = [
    {
      id: "applied",
      title: "Application Submitted",
      description: "Application and candidate profile received by the employer.",
      timestamp: createdAt ? formatDateTime(createdAt) : null,
      isCompleted: isAppliedDone,
      isActive: status === "applied",
    },
    {
      id: "shortlisted",
      title: "Recruiter Review & Shortlisting",
      description: isShortlistedDone
        ? "Your profile was reviewed and shortlisted by the talent team."
        : isRejected
        ? "Application review concluded."
        : "Recruiter is reviewing qualifications, skills, and portfolio.",
      timestamp: isShortlistedDone && updatedAt ? `Updated ${formatDateOnly(updatedAt)}` : null,
      isCompleted: isShortlistedDone,
      isActive: status === "shortlisted",
    },
    {
      id: "interview",
      title: "Interview Rounds",
      description: isInterviewDone
        ? "Interview evaluation in progress or successfully cleared."
        : isRejected
        ? "Not scheduled."
        : "Technical and behavioral discussions with the hiring team.",
      timestamp: isInterviewDone && updatedAt ? `Stage reached ${formatDateOnly(updatedAt)}` : null,
      isCompleted: isInterviewDone,
      isActive: status === "interview",
    },
    {
      id: "decision",
      title: isHired
        ? "Offer Extended & Hired"
        : isRejected
        ? "Application Concluded"
        : "Final Selection Decision",
      description: isHired
        ? "Congratulations! You have been chosen for this role."
        : isRejected
        ? "The recruiter moved forward with other applicants for this opening."
        : "Final outcome will be determined following all interview evaluations.",
      timestamp: (isHired || isRejected) && updatedAt ? formatDateTime(updatedAt) : null,
      isCompleted: isHired,
      isRejected: isRejected,
      isActive: isHired || isRejected,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Contextual Status Banner */}
      {isHired && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3.5 text-emerald-900">
          <Trophy className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-emerald-900">
              Congratulations! Offer Extended
            </h4>
            <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
              The hiring organization has hired you for this position. Please watch your registered email and notifications for onboarding documentation.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex items-start gap-3.5 text-slate-800">
          <XCircle className="h-6 w-6 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              Application Not Selected
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Thank you for applying. While you were not selected for this particular role, your profile remains active in the platform for other matching opportunities.
            </p>
          </div>
        </div>
      )}

      {status === "interview" && (
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-purple-900">
          <div className="flex items-start gap-3.5">
            <Calendar className="h-6 w-6 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-purple-900">
                Interview Stage Active
              </h4>
              <p className="text-xs sm:text-sm text-purple-700">
                The recruiter has scheduled an interview for your application.
              </p>
            </div>
          </div>
          <Link
            to="/student/interviews"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors self-start sm:self-auto shrink-0 shadow-xs"
          >
            <span>View Interviews</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          let iconContainerClass = "bg-white border-2 border-slate-300 text-slate-400";
          let titleClass = "text-slate-700";

          if (step.isCompleted) {
            iconContainerClass = "bg-emerald-600 border-2 border-emerald-600 text-white";
            titleClass = "text-slate-900 font-bold";
          } else if (step.isRejected) {
            iconContainerClass = "bg-rose-500 border-2 border-rose-500 text-white";
            titleClass = "text-rose-900 font-bold";
          } else if (step.isActive) {
            iconContainerClass = "bg-primary-600 border-2 border-primary-600 text-white ring-4 ring-primary-100";
            titleClass = "text-primary-700 font-bold";
          }

          return (
            <div key={step.id} className="relative group">
              {/* Step Icon Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 -top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full transition-colors ${iconContainerClass}`}
              >
                {step.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.isRejected ? (
                  <XCircle className="h-4 w-4" />
                ) : step.isActive ? (
                  <Clock className="h-4 w-4 animate-spin-slow" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className={`text-sm sm:text-base ${titleClass}`}>
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[11px] font-medium text-slate-400">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
