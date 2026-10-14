import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useGetMyInterviewsQuery } from "../../store/api/interviewApi";
import { InterviewCard } from "../../components/interviews/InterviewCard";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { cn } from "../../utils/cn";

export const StudentInterviewsPage = () => {
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: interviewsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyInterviewsQuery();

  const interviews = interviewsResponse?.data || [];

  // Metrics count
  const counts = useMemo(() => {
    const total = interviews.length;
    const upcoming = interviews.filter(
      (i) => i.status === "scheduled" || i.status === "rescheduled"
    ).length;
    const completed = interviews.filter((i) => i.status === "completed").length;
    const cancelled = interviews.filter((i) => i.status === "cancelled").length;
    return { total, upcoming, completed, cancelled };
  }, [interviews]);

  // Filtered & Searched Interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      // 1. Status Filter
      if (activeFilter === "upcoming") {
        if (interview.status !== "scheduled" && interview.status !== "rescheduled") {
          return false;
        }
      } else if (activeFilter === "completed") {
        if (interview.status !== "completed") return false;
      } else if (activeFilter === "cancelled") {
        if (interview.status !== "cancelled") return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const app = typeof interview.applicationId === "object" ? interview.applicationId : {};
        const job = typeof app.jobId === "object" ? app.jobId : {};
        const company = typeof job.companyId === "object" ? job.companyId : {};

        const titleMatch = (job.title || "").toLowerCase().includes(q);
        const compMatch = (company.name || "").toLowerCase().includes(q);
        const roundMatch = (interview.round || "").toLowerCase().includes(q);

        return titleMatch || compMatch || roundMatch;
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
            <span>Interview Preparation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Interviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track interview rounds, access verified meeting links, and prepare for your discussions.
          </p>
        </div>

        <Link to="/student/applications">
          <Button variant="outline" size="sm" leftIcon={Briefcase}>
            View Applications
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Rounds</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">
            {isLoading ? <Skeleton className="h-7 w-12" /> : counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Upcoming Sessions</p>
          <p className="text-2xl font-bold text-blue-700 mt-0.5">
            {isLoading ? <Skeleton className="h-7 w-12" /> : counts.upcoming}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">
            {isLoading ? <Skeleton className="h-7 w-12" /> : counts.completed}
          </p>
        </div>

        <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-bold text-rose-700 mt-0.5">
            {isLoading ? <Skeleton className="h-7 w-12" /> : counts.cancelled}
          </p>
        </div>
      </div>

      {/* Search & Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs">
          {[
            { id: "upcoming", label: "Upcoming", count: counts.upcoming },
            { id: "completed", label: "Completed", count: counts.completed },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
            { id: "all", label: "All Sessions", count: counts.total },
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

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search role, company, or round..."
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
          message={error?.data?.message || "Failed to fetch your scheduled interviews."}
          onRetry={refetch}
        />
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            searchQuery
              ? "No matching interviews found"
              : activeFilter === "upcoming"
              ? "No upcoming interviews"
              : activeFilter === "completed"
              ? "No completed interviews yet"
              : activeFilter === "cancelled"
              ? "No cancelled interviews"
              : "No interviews scheduled"
          }
          message={
            searchQuery
              ? "Try refining your search keyword or clearing the filters."
              : activeFilter === "upcoming"
              ? "When recruiters schedule an interview for your submitted applications, you will receive an alert and the details will appear here."
              : "Explore open job positions and apply to start scheduling interview rounds."
          }
          actionText={!searchQuery && activeFilter === "upcoming" ? "Explore Jobs" : undefined}
          onAction={
            !searchQuery && activeFilter === "upcoming"
              ? () => (window.location.href = "/student/jobs")
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              role="student"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentInterviewsPage;
