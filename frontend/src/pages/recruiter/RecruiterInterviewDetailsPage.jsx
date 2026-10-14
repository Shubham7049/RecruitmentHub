import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Building2,
  Briefcase,
  User,
  Mail,
  Phone,
  ExternalLink,
  Edit2,
  XCircle,
  FileCheck,
} from "lucide-react";
import { useGetInterviewByIdQuery } from "../../store/api/interviewApi";
import { InterviewStatusBadge } from "../../components/interviews/InterviewStatusBadge";
import { EditInterviewModal } from "../../components/interviews/EditInterviewModal";
import { CancelInterviewDialog } from "../../components/interviews/CancelInterviewDialog";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Avatar } from "../../components/common/Avatar";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { formatDateTime, formatDate } from "../../utils/formatters";

export const RecruiterInterviewDetailsPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const {
    data: interviewResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetInterviewByIdQuery(interviewId);

  const interview = interviewResponse?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-6 w-32" />
        <Card className="p-8 border-slate-200">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !interview) {
    const isForbidden = error?.status === 403;
    const isNotFound = error?.status === 404;

    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title={
            isForbidden
              ? "Access Denied"
              : isNotFound
              ? "Interview Not Found"
              : "Unable to load interview session"
          }
          message={
            isForbidden
              ? "You do not have authorization to view this interview record. You can only inspect interviews for jobs you posted or where you are the assigned interviewer."
              : isNotFound
              ? "This interview session does not exist or may have been removed."
              : error?.data?.message || "Failed to load interview details."
          }
          onRetry={isForbidden ? null : refetch}
        />
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/recruiter/interviews")}
            leftIcon={ArrowLeft}
          >
            Back to Interview Sessions
          </Button>
        </div>
      </div>
    );
  }

  const {
    applicationId,
    round,
    scheduledAt,
    meetingUrl,
    interviewer,
    status,
    createdAt,
    updatedAt,
  } = interview;

  const app = typeof applicationId === "object" ? applicationId : {};
  const candidate = typeof app.userId === "object" ? app.userId : {};
  const job = typeof app.jobId === "object" ? app.jobId : {};
  const company = typeof job.companyId === "object" ? job.companyId : {};
  const interviewerUser = typeof interviewer === "object" ? interviewer : {};

  const isActionable = status !== "completed" && status !== "cancelled";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/recruiter/interviews")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Interview Sessions</span>
        </button>
      </div>

      {/* Main Header Banner */}
      <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-md">
                  {round}
                </span>
                <InterviewStatusBadge status={status} size="md" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 pt-1">
                {job.title || "Job Interview Session"}
              </h1>
              <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{company.name || "Company"}</span>
                {job.location && (
                  <>
                    <span>•</span>
                    <span>{job.location}</span>
                  </>
                )}
              </p>
            </div>

            {/* Recruiter Quick Actions */}
            {isActionable && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={Edit2}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Reschedule / Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={XCircle}
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Meeting Room Card */}
      <Card className="border-slate-200/90 shadow-sm bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 border border-primary-100">
              <Video className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Online Interview Meeting URL
              </h3>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                {meetingUrl
                  ? meetingUrl
                  : "No meeting URL has been assigned yet. Click Reschedule/Edit to attach a Google Meet or Zoom link."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={Video}
                  rightIcon={ExternalLink}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Launch Room
                </Button>
              </a>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                Add Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Candidate & Job Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Candidate Profile Box */}
        <Card className="border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-primary-600" />
              <span>Candidate Profile</span>
            </CardTitle>
            {app._id && (
              <Link
                to={`/recruiter/applications/${app._id}`}
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
              >
                <span>Full Application</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <Avatar
                src={candidate.avatar}
                name={candidate.fullname}
                size="md"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {candidate.fullname || "Applicant"}
                </p>
                <p className="text-[11px] text-slate-400">Candidate Applicant</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
              {candidate.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${candidate.phone}`} className="hover:underline">
                    {candidate.phone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Interviewer Box */}
        <Card className="border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-600" />
              <span>Schedule & Interviewer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Scheduled Time
              </span>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {formatDateTime(scheduledAt) || "Time pending"}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Assigned Interviewer:</span>
              <span className="font-bold text-slate-900">
                {interviewerUser.fullname || "Recruiter"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Created:</span>
              <span className="font-semibold text-slate-700">{formatDate(createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditInterviewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          interview={interview}
        />
      )}

      {/* Cancel Dialog */}
      {isCancelDialogOpen && (
        <CancelInterviewDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          interview={interview}
        />
      )}
    </div>
  );
};

export default RecruiterInterviewDetailsPage;
