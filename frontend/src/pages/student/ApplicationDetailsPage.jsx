import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  Clock,
  ExternalLink,
  ShieldAlert,
  User,
  Mail,
  Phone,
  FileCheck,
  Calendar,
  Video,
} from "lucide-react";
import { useGetApplicationByIdQuery } from "../../store/api/applicationApi";
import { useGetMyInterviewsQuery } from "../../store/api/interviewApi";
import { ApplicationStatusBadge } from "../../components/applications/ApplicationStatusBadge";
import { InterviewStatusBadge } from "../../components/interviews/InterviewStatusBadge";
import { ApplicationTimeline } from "../../components/applications/ApplicationTimeline";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import {
  formatSalary,
  formatExperience,
  formatDateTime,
  getApplicationStatusConfig,
} from "../../utils/formatters";

export const ApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const {
    data: applicationResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApplicationByIdQuery(applicationId);

  const { data: interviewsData } = useGetMyInterviewsQuery();
  const matchedInterview = (interviewsData?.data || []).find(
    (i) => (i.applicationId?._id || i.applicationId) === applicationId
  );

  const application = applicationResponse?.data;
  const job = typeof application?.jobId === "object" ? application.jobId : null;
  const company = typeof job?.companyId === "object" ? job.companyId : null;
  const applicant = typeof application?.userId === "object" ? application.userId : null;
  const requirements = Array.isArray(job?.requirements) ? job.requirements : [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4 bg-white border border-slate-200">
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6 space-y-4 bg-white border border-slate-200">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Handle 403 Forbidden or 404 Not Found
  if (isError || !application) {
    const isForbidden = error?.status === 403;
    const isNotFound = error?.status === 404;

    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title={
            isForbidden
              ? "Access Denied"
              : isNotFound
              ? "Application Not Found"
              : "Unable to load application"
          }
          message={
            isForbidden
              ? "You do not have permission to inspect this application. Applications are strictly private to the candidate and the hiring organization."
              : isNotFound
              ? "This application record does not exist or may have been removed."
              : error?.data?.message || "Failed to load application details."
          }
          onRetry={isForbidden ? null : refetch}
        />
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/student/applications")}
            leftIcon={ArrowLeft}
          >
            Back to My Applications
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getApplicationStatusConfig(application.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Back Navigation Button */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/student/applications")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Applications</span>
        </button>
      </div>

      {/* 2. Top Header Overview Card */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
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
                  <Building2 className="h-8 w-8 text-slate-400" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {job?.title || "Role Details"}
                  </h1>
                </div>

                <p className="text-sm font-medium text-slate-600">
                  {company?.name || "Verified Organization"}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Submitted on {formatDateTime(application.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="sm:self-start flex flex-col sm:items-end gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Status
              </span>
              <ApplicationStatusBadge status={application.status} size="lg" />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Main 2-Column Body: Timeline on Left, Job & Applicant Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Timeline & Progression */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Information Card */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <span>Interview Information</span>
              </CardTitle>
              {matchedInterview && (
                <InterviewStatusBadge status={matchedInterview.status} size="sm" />
              )}
            </CardHeader>
            <CardContent className="p-6">
              {matchedInterview ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
                        {matchedInterview.round}
                      </span>
                      <p className="text-base font-bold text-slate-900">
                        {formatDateTime(matchedInterview.scheduledAt)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Interviewer: {matchedInterview.interviewer?.fullname || "Assigned Team"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {matchedInterview.meetingUrl ? (
                        <a
                          href={matchedInterview.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={Video}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            Join Meeting
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Meeting link pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Link
                      to={`/student/interviews/${matchedInterview._id}`}
                      className="text-xs font-semibold text-primary-700 hover:underline"
                    >
                      View Full Interview Details →
                    </Link>
                  </div>
                </div>
              ) : application.status === "interview" ? (
                <div className="text-center py-4 space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    🎉 Interview Stage Reached!
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The hiring team has moved your application to the interview stage. Your interview schedule and meeting link will be posted here shortly.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  No interviews scheduled for this application.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Application Progress & Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ApplicationTimeline application={application} />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Job Summary & Submitted Candidate Info */}
        <div className="space-y-6">
          {/* Job Overview Card */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary-600" />
                Position Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-slate-900">{job?.title}</p>
                <p className="text-slate-500">{company?.name}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-slate-600">
                {job?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job?.salary !== undefined && (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <Banknote className="h-3.5 w-3.5" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                )}
                {job?.experience !== undefined && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatExperience(job.experience)}</span>
                  </div>
                )}
              </div>

              {requirements.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Skills Required
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {requirements.slice(0, 4).map((r, i) => (
                      <Badge
                        key={i}
                        variant="default"
                        size="sm"
                        className="text-[10px] normal-case"
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job?._id && (
                <div className="pt-3">
                  <Link to={`/student/jobs/${job._id}`} className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                      rightIcon={ExternalLink}
                    >
                      View Original Job
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submitted Candidate Profile Card */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary-600" />
                Submitted Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                  {applicant?.fullname ? applicant.fullname[0].toUpperCase() : "C"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{applicant?.fullname || "Candidate"}</p>
                  <p className="text-xs text-slate-500">Applicant Identity</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-slate-600 text-xs">
                {applicant?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{applicant.email}</span>
                  </div>
                )}
                {applicant?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{applicant.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
