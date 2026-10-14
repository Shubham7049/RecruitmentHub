import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatSalary, formatExperience, formatTimeAgo } from "../../utils/formatters";
import {
  useSaveJobMutation,
  useUnsaveJobMutation,
  useGetMySavedJobsQuery,
} from "../../store/api/savedJobApi";
import toast from "react-hot-toast";

export const JobCard = ({
  job,
  isSaved: propIsSaved,
  onSaveToggle,
  className,
}) => {
  const navigate = useNavigate();

  const { data: mySavedResponse } = useGetMySavedJobsQuery();
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: isUnsaving }] = useUnsaveJobMutation();

  if (!job) return null;

  // Determine if saved from prop or from cached saved jobs list
  const isJobSaved =
    propIsSaved !== undefined
      ? propIsSaved
      : Boolean(
          mySavedResponse?.data?.some((s) => {
            const savedJobId =
              typeof s.jobId === "object" ? s.jobId?._id : s.jobId;
            return savedJobId?.toString() === job._id?.toString();
          })
        );

  const company = typeof job.companyId === "object" ? job.companyId : null;
  const companyName = company?.name || "Verified Organization";
  const companyLogo = company?.logo;
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    if (onSaveToggle) {
      onSaveToggle(job._id);
      return;
    }

    if (isSaving || isUnsaving) return;

    try {
      if (isJobSaved) {
        await unsaveJob(job._id).unwrap();
        toast.success("Job removed from saved bookmarks");
      } else {
        await saveJob(job._id).unwrap();
        toast.success("Job saved to your bookmarks");
      }
    } catch (err) {
      if (err?.status === 409) {
        toast.success("Job is already saved");
      } else {
        toast.error(err?.data?.message || "Failed to update bookmark");
      }
    }
  };

  const handleCardClick = () => {
    navigate(`/student/jobs/${job._id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`group cursor-pointer hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white ${className || ""}`}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top Header Row: Company Logo, Title, Bookmark */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Company Logo / Fallback */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden group-hover:border-primary-200 transition-colors">
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

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {companyName}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleSaveClick}
            className={`rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
              isJobSaved
                ? "bg-primary-50 text-primary-600"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
            title={isJobSaved ? "Remove from saved jobs" : "Save this job"}
          >
            <Bookmark
              className={`h-5 w-5 ${isJobSaved ? "fill-primary-600" : ""}`}
            />
          </button>
        </div>

        {/* Middle Metadata Row: Location, Salary, Experience */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.location || "Remote / Hybrid"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-semibold">
            <Banknote className="h-3.5 w-3.5" />
            <span>{formatSalary(job.salary)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatExperience(job.experience)}</span>
          </div>

          {job.createdAt && (
            <div className="flex items-center gap-1 text-slate-400 text-[11px] ml-auto">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(job.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Requirements / Skills Pills */}
        {requirements.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {requirements.slice(0, 4).map((skill, idx) => (
              <Badge
                key={idx}
                variant="default"
                size="sm"
                className="bg-slate-100 text-slate-700 border-slate-200 normal-case font-medium text-[11px]"
              >
                {skill}
              </Badge>
            ))}
            {requirements.length > 4 && (
              <span className="text-[11px] text-slate-400 font-medium self-center pl-1">
                +{requirements.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors font-medium">
            Click to view full description
          </span>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:text-primary-700">
            <span>View Job</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
