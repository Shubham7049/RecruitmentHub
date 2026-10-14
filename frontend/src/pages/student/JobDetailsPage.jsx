import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  Mail,
  User,
  AlertCircle,
} from "lucide-react";
import {
  useGetJobByIdQuery,
} from "../../store/api/jobApi";
import {
  useCheckIsJobSavedQuery,
  useSaveJobMutation,
  useUnsaveJobMutation,
} from "../../store/api/savedJobApi";
import {
  useGetMyApplicationsQuery,
  useApplyForJobMutation,
} from "../../store/api/applicationApi";
import { ApplyConfirmModal } from "../../components/applications/ApplyConfirmModal";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { formatSalary, formatExperience, formatTimeAgo } from "../../utils/formatters";
import toast from "react-hot-toast";

export const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch Job Details
  const {
    data: jobResponse,
    isLoading: isJobLoading,
    isError: isJobError,
    refetch,
  } = useGetJobByIdQuery(jobId);

  // 2. Saved Job Status & Mutations
  const {
    data: savedStatusResponse,
    isLoading: isCheckingSaved,
  } = useCheckIsJobSavedQuery(jobId);
  const isSaved = Boolean(savedStatusResponse?.data?.isSaved);

  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: isUnsaving }] = useUnsaveJobMutation();
  const isSaveActionPending = isSaving || isUnsaving;

  // 3. Candidate Applications & Apply Mutation
  const { data: myAppsResponse } = useGetMyApplicationsQuery();
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Determine whether current candidate already applied
  const existingApplication = myAppsResponse?.data?.find((app) => {
    const appJobId = typeof app.jobId === "object" ? app.jobId?._id : app.jobId;
    return appJobId?.toString() === jobId?.toString();
  });
  const isAlreadyApplied = Boolean(existingApplication);

  const job = jobResponse?.data;
  const company = typeof job?.companyId === "object" ? job.companyId : null;
  const recruiter = typeof job?.createdBy === "object" ? job.createdBy : null;
  const requirements = Array.isArray(job?.requirements) ? job.requirements : [];

  const handleSaveToggle = async () => {
    if (isSaveActionPending) return;

    try {
      if (isSaved) {
        await unsaveJob(jobId).unwrap();
        toast.success("Job removed from saved bookmarks");
      } else {
        await saveJob(jobId).unwrap();
        toast.success("Job saved to your bookmarks");
      }
    } catch (err) {
      if (err?.status === 409) {
        toast.success("Job is already in your bookmarks");
      } else {
        toast.error(err?.data?.message || "Failed to update bookmark");
      }
    }
  };

  const handleConfirmApply = async () => {
    try {
      await applyForJob(jobId).unwrap();
      setIsApplyModalOpen(false);
      toast.success("Application submitted successfully! You can track its progress in Applications.");
    } catch (err) {
      setIsApplyModalOpen(false);
      if (err?.status === 409) {
        toast.error("You have already submitted an application for this job");
      } else {
        toast.error(err?.data?.message || "Failed to submit application");
      }
    }
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    } else {
      toast("Share URL: " + window.location.href);
    }
  };

  const isLoading = isJobLoading;
  const isError = isJobError;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-8 w-32" />
        <Card className="p-6 sm:p-8 space-y-6 bg-white border border-slate-200">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Job Posting Not Found"
          message="This job opening may have expired, been closed by the recruiter, or the link is invalid."
          onRetry={refetch}
        />
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/student/jobs")}
            leftIcon={ArrowLeft}
          >
            Back to Job Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Back Navigation Button */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/student/jobs")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Jobs</span>
        </button>
      </div>

      {/* 2. Hero Header Card */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: Company Logo, Title, Company Name */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 className="h-9 w-9 text-slate-400" />
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span>{company?.name || "Verified Organization"}</span>
                  {company?.website && (
                    <a
                      href={
                        company.website.startsWith("http")
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-400 pt-1">
                  Posted {formatTimeAgo(job.createdAt)}
                </p>
              </div>
            </div>

            {/* Right: Actions (Apply, Bookmark, Share) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:self-start">
              <Button
                variant="outline"
                size="md"
                onClick={handleSaveToggle}
                disabled={isSaveActionPending}
                isLoading={isSaveActionPending}
                className={isSaved ? "border-primary-300 text-primary-600 bg-primary-50" : ""}
                title={isSaved ? "Remove from saved" : "Save Job"}
              >
                <Bookmark className={`h-4 w-4 mr-1.5 ${isSaved ? "fill-primary-600" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleShareClick}
                title="Share Job"
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>

              {isAlreadyApplied ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    disabled
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold cursor-default opacity-100"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                    Applied
                  </Button>
                  <Link to={`/student/applications/${existingApplication._id}`}>
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 text-xs">
                      Track &rarr;
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-6 shadow-sm"
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          {/* Key Metadata Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Location
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {job.location || "Remote / Hybrid"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                Offered CTC
              </div>
              <p className="text-sm font-semibold text-emerald-700 mt-1">
                {formatSalary(job.salary)}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                Experience
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatExperience(job.experience)}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Job Status
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1 text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Actively Hiring
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. 2-Column Body: Description on Left, Company & Recruiter on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Job Description & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description Card */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">
                About the Role & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Qualifications Card */}
          {requirements.length > 0 && (
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Key Skills & Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  {requirements.map((req, idx) => (
                    <Badge
                      key={idx}
                      variant="primary"
                      size="md"
                      className="normal-case font-medium text-xs bg-primary-50 text-primary-700 border-primary-200"
                    >
                      {req}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2.5 pt-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Floating Apply CTA */}
          <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isAlreadyApplied ? "Application Active" : "Interested in this position?"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {isAlreadyApplied
                  ? "You have already submitted an application for this position. Track its status in your applications dashboard."
                  : "Make sure your profile and contact details are up to date before applying."}
              </p>
            </div>
            {isAlreadyApplied ? (
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Applied
                </span>
                <Link to={`/student/applications/${existingApplication._id}`}>
                  <Button variant="outline" size="sm">
                    Track Status
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsApplyModalOpen(true)}
                className="shrink-0 w-full sm:w-auto"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Company & Recruiter Overview */}
        <div className="space-y-6">
          {/* Company Profile Card */}
          {company && (
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary-600" />
                  About {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {company.about ? (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {company.about}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No detailed company summary provided.
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  {company.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>Headquarters: <strong>{company.location}</strong></span>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline font-medium truncate"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recruiter / Posted By Card */}
          {recruiter && (
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary-600" />
                  Hiring Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                    {recruiter.fullname ? recruiter.fullname[0].toUpperCase() : "R"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{recruiter.fullname}</p>
                    <p className="text-xs text-slate-500">Talent Acquisition Partner</p>
                  </div>
                </div>

                {recruiter.email && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{recruiter.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 4. Confirmation Modal for Application Submission */}
      <ApplyConfirmModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onConfirm={handleConfirmApply}
        job={job}
        isApplying={isApplying}
      />
    </div>
  );
};

export default JobDetailsPage;
