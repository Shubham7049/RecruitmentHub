import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  Briefcase,
  Search,
  Plus,
  Filter,
  Sparkles,
} from "lucide-react";
import { useGetMyInterviewsQuery } from "../../store/api/interviewApi";
import { InterviewCard } from "../../components/interviews/InterviewCard";
import { EditInterviewModal } from "../../components/interviews/EditInterviewModal";
import { CancelInterviewDialog } from "../../components/interviews/CancelInterviewDialog";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { cn } from "../../utils/cn";

export const RecruiterInterviewsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [editingInterview, setEditingInterview] = useState(null);
  const [cancellingInterview, setCancellingInterview] = useState(null);

  const {
    data: interviewsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyInterviewsQuery();

  const interviews = interviewsResponse?.data || [];

  // Metrics computation
  const counts = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((i) => i.status === "scheduled").length;
    const rescheduled = interviews.filter((i) => i.status === "rescheduled").length;
    const completed = interviews.filter((i) => i.status === "completed").length;
    const cancelled = interviews.filter((i) => i.status === "cancelled").length;
    return { total, scheduled, rescheduled, completed, cancelled };
  }, [interviews]);

  // Filter & Search
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      // 1. Status Filter
      if (activeFilter !== "all") {
        if (interview.status !== activeFilter) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const app = typeof interview.applicationId === "object" ? interview.applicationId : {};
        const candidate = typeof app.userId === "object" ? app.userId : {};
        const job = typeof app.jobId === "object" ? app.jobId : {};

        const candName = (candidate.fullname || "").toLowerCase().includes(q);
        const candEmail = (candidate.email || "").toLowerCase().includes(q);
        const jobTitle = (job.title || "").toLowerCase().includes(q);
        const roundName = (interview.round || "").toLowerCase().includes(q);

        return candName || candEmail || jobTitle || roundName;
      }

      return true;
    });
  }, [interviews, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3 py-0.5 text-xs font-semibold text-primary-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            <span>Recruiter Scheduling Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interview Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage scheduled candidate discussions, update video links, and review session statuses.
          </p>
        </div>

        <Link to="/recruiter/applications">
          <Button variant="primary" size="sm" leftIcon={Users}>
            Schedule from Applicants
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Sessions</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">
            {isLoading ? <Skeleton className="h-6 w-10" /> : counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Scheduled</p>
          <p className="text-xl font-bold text-blue-700 mt-0.5">
            {isLoading ? <Skeleton className="h-6 w-10" /> : counts.scheduled}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Rescheduled</p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">
            {isLoading ? <Skeleton className="h-6 w-10" /> : counts.rescheduled}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">
            {isLoading ? <Skeleton className="h-6 w-10" /> : counts.completed}
          </p>
        </div>

        <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Cancelled</p>
          <p className="text-xl font-bold text-rose-700 mt-0.5">
            {isLoading ? <Skeleton className="h-6 w-10" /> : counts.cancelled}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs">
          {[
            { id: "all", label: "All", count: counts.total },
            { id: "scheduled", label: "Scheduled", count: counts.scheduled },
            { id: "rescheduled", label: "Rescheduled", count: counts.rescheduled },
            { id: "completed", label: "Completed", count: counts.completed },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all",
                activeFilter === tab.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  activeFilter === tab.id
                    ? "bg-primary-50 text-primary-700"
                    : "bg-slate-200/80 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search candidate, role, or round..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={Search}
            className="text-xs"
          />
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load interviews"
          message={error?.data?.message || "Failed to fetch scheduled recruiter interviews."}
          onRetry={refetch}
        />
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            searchQuery
              ? "No matching interview sessions"
              : activeFilter !== "all"
              ? `No ${activeFilter} interviews`
              : "No interviews scheduled yet"
          }
          message={
            searchQuery
              ? "Try adjusting your search terms or filter selection."
              : "Navigate to your Applicants pipeline to schedule interviews with qualified candidates."
          }
          actionText={!searchQuery ? "View Applicants" : undefined}
          onAction={
            !searchQuery
              ? () => (window.location.href = "/recruiter/applications")
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              role="recruiter"
              onEdit={(item) => setEditingInterview(item)}
              onCancel={(item) => setCancellingInterview(item)}
            />
          ))}
        </div>
      )}

      {/* Edit / Reschedule Modal */}
      {editingInterview && (
        <EditInterviewModal
          isOpen={Boolean(editingInterview)}
          onClose={() => setEditingInterview(null)}
          interview={editingInterview}
        />
      )}

      {/* Cancel Confirmation Dialog */}
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

export default RecruiterInterviewsPage;
