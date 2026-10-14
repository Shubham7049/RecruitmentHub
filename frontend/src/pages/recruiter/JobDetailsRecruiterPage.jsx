import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  Calendar,
  Users,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetJobByIdQuery,
  useDeleteJobMutation,
} from "../../store/api/jobApi";
import { useGetApplicantsForJobQuery } from "../../store/api/applicationApi";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { DeleteJobModal } from "../../components/jobs/DeleteJobModal";
import { formatDate, formatSalary } from "../../utils/formatters";

export const JobDetailsRecruiterPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch job details
  const {
    data: jobResponse,
    isLoading: isJobLoading,
    isError: isJobError,
    error: jobApiError,
  } = useGetJobByIdQuery(jobId);

  // Fetch applicants for this specific job
  const {
    data: applicantsResponse,
    isLoading: isApplicantsLoading,
  } = useGetApplicantsForJobQuery(jobId);

  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  const job = jobResponse?.data;
  const applications = applicantsResponse?.data?.applications || [];
  const totalApplicants = applications.length;

  // Status breakdown
  const statusCounts = React.useMemo(() => {
    const counts = { applied: 0, shortlisted: 0, interview: 0, hired: 0, rejected: 0 };
    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });
    return counts;
  }, [applications]);

  // Ownership verification check
  const creatorId =
    typeof job?.createdBy === "object"
      ? job?.createdBy?._id
      : job?.createdBy;
  const isOwner = Boolean(user?._id && creatorId && user._id.toString() === creatorId.toString());

  const handleDeleteConfirm = async () => {
    if (!job) return;
    setDeleteError(null);

    try {
      await deleteJob(job._id).unwrap();
      toast.success(`${job.title} was deleted successfully`);
      setIsDeleteModalOpen(false);
      navigate("/recruiter/jobs");
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to delete job posting. Please check attached applications and try again.";
      setDeleteError(errorMsg);
    }
  };

  if (isJobLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Card className="p-8 border-slate-200">
          <div className="space-y-4">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-rose-200 bg-rose-50/60 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900">Job Not Found</h2>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
            {jobApiError?.data?.message ||
              "The requested job posting could not be found or you do not have permission to view it."}
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/recruiter/jobs")}
              leftIcon={ArrowLeft}
            >
              Back to My Jobs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const {
    title,
    location,
    salary,
    experience,
    description,
    requirements = [],
    companyId,
    createdAt,
  } = job;

  const company = typeof companyId === "object" ? companyId : null;
  const companyName = company?.name || "Registered Company";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to My Jobs</span>
      </Link>

      {/* Header Profile Card */}
      <Card className="border-slate-200/90 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {title}
                </h1>
                <Badge variant="primary" size="sm">
                  Active Posting
                </Badge>
              </div>

              {/* Company Link */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                {company?._id ? (
                  <Link
                    to={`/recruiter/companies/${company._id}`}
                    className="font-semibold text-primary-700 hover:underline flex items-center gap-1"
                  >
                    <span>{companyName}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="font-semibold">{companyName}</span>
                )}
              </div>

              {/* Key Attributes Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <IndianRupee className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{formatSalary(salary)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{experience === 0 ? "Fresher / 0 yrs" : `${experience} yrs exp`}</span>
                </span>
                {createdAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Posted on {formatDate(createdAt)}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-2.5 shrink-0 self-start">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Edit2}
                  onClick={() => navigate(`/recruiter/jobs/${jobId}/edit`)}
                >
                  Edit Job
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Trash2}
                  onClick={() => {
                    setDeleteError(null);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidate Pipeline Summary Card */}
      <Card className="border-slate-200/90 bg-gradient-to-r from-slate-50 to-primary-50/20 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Application Pipeline
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/recruiter/applications?jobId=${jobId}`)}
              rightIcon={ArrowUpRight}
              className="text-xs font-semibold text-primary-700"
            >
              View in Applicants
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isApplicantsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-center shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{totalApplicants}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-center shadow-2xs">
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Under Review</p>
                <p className="text-xl font-bold text-blue-700 mt-0.5">{statusCounts.applied}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-center shadow-2xs">
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Shortlisted</p>
                <p className="text-xl font-bold text-amber-700 mt-0.5">{statusCounts.shortlisted}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-center shadow-2xs">
                <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Interview</p>
                <p className="text-xl font-bold text-purple-700 mt-0.5">{statusCounts.interview}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-center shadow-2xs">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Hired</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">{statusCounts.hired}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Job Description & Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </CardContent>
      </Card>

      {/* Requirements & Skills Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Key Requirements & Technical Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No specific skill requirements listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {requirements.map((req, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-600" />
                  <span>{req}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteJobModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        job={job}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default JobDetailsRecruiterPage;
