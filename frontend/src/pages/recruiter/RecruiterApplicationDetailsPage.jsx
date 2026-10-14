import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
  Bell,
  Clock,
  ExternalLink,
  Video,
  Plus,
  Edit2,
  XCircle,
} from "lucide-react";
import { useGetApplicationByIdQuery } from "../../store/api/applicationApi";
import { useGetMyInterviewsQuery } from "../../store/api/interviewApi";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Avatar } from "../../components/common/Avatar";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { ApplicationStatusBadge } from "../../components/applications/ApplicationStatusBadge";
import { StatusUpdateSelect } from "../../components/applications/StatusUpdateSelect";
import { InterviewStatusBadge } from "../../components/interviews/InterviewStatusBadge";
import { ScheduleInterviewModal } from "../../components/interviews/ScheduleInterviewModal";
import { EditInterviewModal } from "../../components/interviews/EditInterviewModal";
import { CancelInterviewDialog } from "../../components/interviews/CancelInterviewDialog";
import { formatDate, formatDateTime } from "../../utils/formatters";

export const RecruiterApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [cancellingInterview, setCancellingInterview] = useState(null);

  const {
    data: applicationResponse,
    isLoading,
    isError,
    error,
  } = useGetApplicationByIdQuery(applicationId);

  const { data: myInterviewsData } = useGetMyInterviewsQuery();

  const application = applicationResponse?.data;
  const interviews = (myInterviewsData?.data || []).filter(
    (i) => (i.applicationId?._id || i.applicationId) === applicationId
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Card className="p-8 border-slate-200">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !application) {
    const isForbidden = error?.status === 403;
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-rose-200 bg-rose-50/60 p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900">
            {isForbidden ? "Access Denied" : "Application Not Found"}
          </h2>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto leading-relaxed">
            {error?.data?.message ||
              "You do not have authorization to view this application or it has been removed."}
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/recruiter/applications")}
              leftIcon={ArrowLeft}
            >
              Back to Applicants
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { userId, jobId, status, createdAt, updatedAt } = application;
  const applicant = typeof userId === "object" ? userId : {};
  const job = typeof jobId === "object" ? jobId : {};
  const company = job?.companyId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <Link
        to="/recruiter/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Applicants</span>
      </Link>

      {/* Candidate Profile Header */}
      <Card className="border-slate-200/90 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={applicant.avatar}
                name={applicant.fullname}
                size="lg"
                className="h-16 w-16 text-xl"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {applicant.fullname || "Candidate Profile"}
                  </h1>
                  <ApplicationStatusBadge status={status} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  {applicant.email && (
                    <a
                      href={`mailto:${applicant.email}`}
                      className="flex items-center gap-1 text-primary-600 hover:underline font-medium"
                    >
                      <Mail className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      <span>{applicant.email}</span>
                    </a>
                  )}

                  {applicant.phone && (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="flex items-center gap-1 text-slate-700 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{applicant.phone}</span>
                    </a>
                  )}

                  {createdAt && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Applied on {formatDate(createdAt)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Control */}
            <div className="shrink-0 pt-1">
              <StatusUpdateSelect
                applicationId={application._id}
                currentStatus={status}
                size="md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applied Position Context */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Applied Role Context
              </CardTitle>
            </div>
            {job?._id && (
              <Link
                to={`/recruiter/jobs/${job._id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"
              >
                <span>View Job Details</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3.5">
              <span className="text-slate-400 font-medium">Job Title</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{job.title || "Not available"}</p>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3.5">
              <span className="text-slate-400 font-medium">Organization</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{company?.name || "Company"}</p>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3.5">
              <span className="text-slate-400 font-medium">Job Location</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{job.location || "Location not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Scheduling & Sessions Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Candidate Interview Sessions
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="primary"
            leftIcon={Plus}
            onClick={() => setIsScheduleModalOpen(true)}
            className="text-xs"
          >
            Schedule Interview
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {interviews.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                No interviews scheduled yet.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Schedule a 1-on-1 discussion, technical assessment, or HR round with this candidate.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={Calendar}
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  Schedule First Interview
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                        {item.round}
                      </span>
                      <InterviewStatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDateTime(item.scheduledAt)}
                    </p>
                    {item.meetingUrl && (
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Join Meeting Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status !== "completed" && item.status !== "cancelled" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={Edit2}
                          onClick={() => setEditingInterview(item)}
                          className="text-xs"
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={XCircle}
                          onClick={() => setCancellingInterview(item)}
                          className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Status Workflow Note */}
      <Card className="border-primary-200/80 bg-primary-50/30 shadow-xs">
        <CardContent className="p-4 flex items-start gap-3 text-xs text-slate-700">
          <Bell className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-900">Automatic Notification Delivery</p>
            <p className="text-slate-600 leading-relaxed">
              When you advance this candidate to &ldquo;Shortlisted&rdquo;, &ldquo;Interview&rdquo;, &ldquo;Hired&rdquo;, or &ldquo;Not Selected&rdquo;, the backend automatically creates a real-time notification in the candidate&apos;s portal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          applicationId={application._id}
          candidateName={applicant.fullname}
          jobTitle={job.title}
        />
      )}

      {/* Edit Modal */}
      {editingInterview && (
        <EditInterviewModal
          isOpen={Boolean(editingInterview)}
          onClose={() => setEditingInterview(null)}
          interview={editingInterview}
        />
      )}

      {/* Cancel Dialog */}
      {cancellingInterview && (
        <CancelInterviewDialog
          isOpen={Boolean(cancellingInterview)}
          onClose={() => setCancellingInterview(null)}
          interview={cancellingInterview}
        />
      )}
    </div>
  );
};

export default RecruiterApplicationDetailsPage;
