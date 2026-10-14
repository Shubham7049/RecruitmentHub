import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useGetMyApplicationsQuery } from "../../store/api/applicationApi";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { Card, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Badge } from "../../components/common/Badge";

const STATUS_TABS = [
  { id: "all", label: "All Applications" },
  { id: "applied", label: "Applied" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Not Selected" },
];

export const StudentApplicationsPage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");

  const {
    data: applicationsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyApplicationsQuery();

  const applications = applicationsResponse?.data || [];

  // Calculate counts per status
  const counts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interview: applications.filter((a) => a.status === "interview").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // Filter applications by selected tab
  const filteredApplications =
    selectedStatus === "all"
      ? applications
      : applications.filter((a) => a.status === selectedStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your candidate application lifecycle from submission to interview and hire.
          </p>
        </div>

        <Link to="/student/jobs">
          <Button variant="primary" size="sm" leftIcon={Briefcase}>
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {/* 2. Status Filter Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isSelected = selectedStatus === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-primary-50 text-primary-700 border border-primary-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-primary-600 text-white font-bold"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-6 space-y-4 border border-slate-200 bg-white">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load applications"
          message="Could not retrieve your job applications. Please verify your connection and retry."
          onRetry={refetch}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications submitted yet"
          description="Start exploring open roles and submit applications to matching positions."
          action={
            <Button
              variant="primary"
              onClick={() => navigate("/student/jobs")}
              leftIcon={Briefcase}
            >
              Find Jobs
            </Button>
          }
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={`No applications with status "${STATUS_TABS.find((t) => t.id === selectedStatus)?.label}"`}
          description="You currently don't have any applications matching this status filter."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStatus("all")}
            >
              View All Applications
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsPage;
