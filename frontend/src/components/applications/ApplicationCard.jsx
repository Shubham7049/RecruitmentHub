import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Banknote,
  Clock,
  ChevronRight,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { formatSalary, formatTimeAgo, formatDateOnly } from "../../utils/formatters";

export const ApplicationCard = ({ application, className = "" }) => {
  const navigate = useNavigate();

  if (!application) return null;

  const job = typeof application.jobId === "object" ? application.jobId : null;
  const company = typeof job?.companyId === "object" ? job.companyId : null;
  const companyName = company?.name || "Verified Organization";
  const companyLogo = company?.logo;
  const status = application.status;

  const handleCardClick = () => {
    navigate(`/student/applications/${application._id}`);
  };

  const handleViewJob = (e) => {
    e.stopPropagation();
    if (job?._id) {
      navigate(`/student/jobs/${job._id}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`group cursor-pointer hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white border border-slate-200 ${className}`}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top Header Row: Company Logo, Title, Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Company Logo / Fallback */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group-hover:border-primary-200 transition-colors">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="h-6 w-6 text-slate-400 group-hover:text-primary-600 transition-colors" />
              )}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                {job?.title || "Job Posting"}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {companyName}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            <ApplicationStatusBadge status={status} size="md" />
          </div>
        </div>

        {/* Middle Metadata Row: Location, Salary, Application Date */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
          {job?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{job.location}</span>
            </div>
          )}

          {job?.salary !== undefined && (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-semibold">
              <Banknote className="h-3.5 w-3.5" />
              <span>{formatSalary(job.salary)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 ml-auto">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Applied {formatTimeAgo(application.createdAt)}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-slate-400">
              ({formatDateOnly(application.createdAt)})
            </span>
          </div>
        </div>

        {/* Status Callout if in Interview stage */}
        {status === "interview" && (
          <div className="rounded-lg bg-purple-50 border border-purple-200/70 p-2.5 flex items-center justify-between text-xs text-purple-900">
            <span className="flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4 text-purple-600" />
              Interview phase active for this position
            </span>
            <span className="font-semibold text-purple-700 hover:underline">
              View Schedule &rarr;
            </span>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {job?._id ? (
            <button
              type="button"
              onClick={handleViewJob}
              className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
            >
              <span>View Original Job</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">Job archived</span>
          )}

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:text-primary-700">
            <span>Track Application</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
