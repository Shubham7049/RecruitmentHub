import React, { useState } from "react";
import {
  Calendar,
  Video,
  XCircle,
  ExternalLink,
  User,
  Briefcase,
  Clock,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { InterviewStatusBadge } from "../../components/interviews/InterviewStatusBadge";
import { useGetAllInterviewsAdminQuery } from "../../store/api/adminApi";
import { useCancelInterviewMutation } from "../../store/api/interviewApi";
import { formatDate } from "../../utils/formatters";

export const AdminInterviewsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Cancellation state
  const [interviewToCancel, setInterviewToCancel] = useState(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const [cancelInterview, { isLoading: isCancelling }] = useCancelInterviewMutation();

  const queryParams = {
    page: currentPage,
    limit: 15,
  };
  if (selectedStatus) queryParams.status = selectedStatus;

  const { data, isLoading, isError, error } =
    useGetAllInterviewsAdminQuery(queryParams);

  const interviews = data?.data?.interviews || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePromptCancel = (item) => {
    setInterviewToCancel(item);
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!interviewToCancel) return;
    try {
      await cancelInterview(interviewToCancel._id).unwrap();
      toast.success(
        `Interview round "${interviewToCancel.round}" has been cancelled.`
      );
      setIsCancelConfirmOpen(false);
      setInterviewToCancel(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to cancel interview");
    }
  };

  const statusFilters = [
    { label: "All Statuses", value: "" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Rescheduled", value: "rescheduled" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Interview Moderation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit evaluation rounds, monitor video rooms, and execute audit-preserving cancellations when required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            {pagination.total} Total Interviews
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusSelect(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === tab.value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Interviews Table / List */}
      <Card>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Auditing platform interview schedules...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rose-600 font-medium">
              {error?.data?.message || "Failed to load interviews"}
            </p>
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No interviews found"
            description="No interviews match the selected status filter."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Round & Candidate</th>
                    <th scope="col" className="py-3.5 px-4">Applied Job</th>
                    <th scope="col" className="py-3.5 px-4">Interviewer</th>
                    <th scope="col" className="py-3.5 px-4">Scheduled Date</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.map((intItem) => {
                    const candidateName =
                      intItem.applicationId?.userId?.fullname || "Candidate";
                    const candidateEmail =
                      intItem.applicationId?.userId?.email || "";
                    const jobTitle =
                      intItem.applicationId?.jobId?.title || "Role";
                    const interviewerName =
                      intItem.interviewer?.fullname || "Assigned Interviewer";
                    const canCancel =
                      intItem.status === "scheduled" ||
                      intItem.status === "rescheduled";

                    return (
                      <tr key={intItem._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {intItem.round || "Interview Session"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {candidateName} {candidateEmail && `(${candidateEmail})`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-900 truncate block max-w-xs">
                            {jobTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {interviewerName}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(intItem.scheduledAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <InterviewStatusBadge status={intItem.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {intItem.meetingUrl && (
                              <a
                                href={intItem.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Room
                              </a>
                            )}
                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePromptCancel(intItem)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                title="Cancel interview"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-100">
              {interviews.map((intItem) => {
                const candidateName =
                  intItem.applicationId?.userId?.fullname || "Candidate";
                const jobTitle =
                  intItem.applicationId?.jobId?.title || "Role";
                const canCancel =
                  intItem.status === "scheduled" ||
                  intItem.status === "rescheduled";

                return (
                  <div key={intItem._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {intItem.round || "Interview"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Candidate: {candidateName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Job: {jobTitle}
                        </p>
                      </div>
                      <InterviewStatusBadge status={intItem.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Date: {formatDate(intItem.scheduledAt)}</span>
                      {intItem.meetingUrl && (
                        <a
                          href={intItem.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 font-semibold inline-flex items-center gap-1"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Room
                        </a>
                      )}
                    </div>

                    {canCancel && (
                      <div className="pt-2 flex justify-end border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromptCancel(intItem)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancel Session
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </Card>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => {
          setIsCancelConfirmOpen(false);
          setInterviewToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel Interview Session?"
        message={`Are you sure you want to cancel the interview round "${interviewToCancel?.round}"? This sets the interview status to "cancelled", preserving audit records and notifying the candidate.`}
        confirmText="Yes, Cancel Interview"
        cancelText="Keep Session"
        isDestructive={true}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default AdminInterviewsPage;
