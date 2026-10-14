import React from "react";
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
  ExternalLink,
  ShieldAlert,
  FileCheck,
} from "lucide-react";
import { useGetInterviewByIdQuery } from "../../store/api/interviewApi";
import { InterviewStatusBadge } from "../../components/interviews/InterviewStatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Avatar } from "../../components/common/Avatar";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { formatDateTime, formatDate, formatSalary } from "../../utils/formatters";

export const StudentInterviewDetailsPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

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
              : "Unable to load interview"
          }
          message={
            isForbidden
              ? "You do not have authorization to view this interview record. Interviews are strictly private to the candidate and authorized hiring team."
              : isNotFound
              ? "This interview session does not exist or may have been removed."
              : error?.data?.message || "Failed to load interview details."
          }
          onRetry={isForbidden ? null : refetch}
        />
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/student/interviews")}
            leftIcon={ArrowLeft}
          >
            Back to My Interviews
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
  const job = typeof app.jobId === "object" ? app.jobId : {};
  const company = typeof job.companyId === "object" ? job.companyId : {};
  const interviewerUser = typeof interviewer === "object" ? interviewer : {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/student/interviews")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Interviews</span>
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
                {job.title || "Job Interview"}
              </h1>
              <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{company.name || "Hiring Organization"}</span>
                {job.location && (
                  <>
                    <span>•</span>
                    <span>{job.location}</span>
                  </>
                )}
              </p>
            </div>

            {/* View Application Link */}
            {app._id && (
              <Link to={`/student/applications/${app._id}`} className="shrink-0">
                <Button variant="outline" size="sm" rightIcon={ExternalLink}>
                  View Application
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Join Meeting / Video Call Card */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white shadow-xs">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Video className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Online Interview Meeting Room
              </h3>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                {meetingUrl
                  ? "Your meeting room has been configured by the hiring team. Click below to launch your session when scheduled."
                  : "The recruiter has not attached a video conferencing URL yet. Please check back before your interview time."}
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
                  size="md"
                  variant="primary"
                  leftIcon={Video}
                  rightIcon={ExternalLink}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Join Meeting Now
                </Button>
              </a>
            ) : (
              <Button size="md" variant="outline" disabled>
                Meeting Link Pending
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Schedule & Timing Card */}
        <Card className="border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-600" />
              <span>Date & Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Scheduled Time (Local)
              </span>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {formatDateTime(scheduledAt) || "Pending"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Scheduled On:</span>
              <span className="font-semibold text-slate-700">{formatDate(createdAt)}</span>
            </div>
            {updatedAt && updatedAt !== createdAt && (
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Last Updated:</span>
                <span className="font-semibold text-slate-700">{formatDate(updatedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Interviewer Card */}
        <Card className="border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-primary-600" />
              <span>Assigned Interviewer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <Avatar
                src={interviewerUser.avatar}
                name={interviewerUser.fullname}
                size="md"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {interviewerUser.fullname || "Hiring Lead"}
                </p>
                <p className="text-[11px] text-slate-400">Technical Interviewer</p>
              </div>
            </div>

            {interviewerUser.email && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${interviewerUser.email}`}
                  className="text-primary-600 hover:underline"
                >
                  {interviewerUser.email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentInterviewDetailsPage;
