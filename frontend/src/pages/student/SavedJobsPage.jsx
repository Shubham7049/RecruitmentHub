import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { useGetMySavedJobsQuery, useUnsaveJobMutation } from "../../store/api/savedJobApi";
import { JobCard } from "../../components/jobs/JobCard";
import { Card, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import toast from "react-hot-toast";

export const SavedJobsPage = () => {
  const navigate = useNavigate();

  const {
    data: savedJobsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMySavedJobsQuery();

  const [unsaveJob, { isLoading: isUnsaving }] = useUnsaveJobMutation();

  // Extract valid jobs from savedJob records
  const savedItems = savedJobsResponse?.data || [];
  const validSavedJobs = savedItems
    .map((item) => (typeof item.jobId === "object" ? item.jobId : null))
    .filter(Boolean);

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId).unwrap();
      toast.success("Job removed from saved bookmarks");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove job from saved list");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Saved Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isLoading ? (
              <span>Loading your saved roles...</span>
            ) : (
              <span>
                You saved{" "}
                <strong className="text-slate-900">{validSavedJobs.length}</strong>{" "}
                opportunit{validSavedJobs.length === 1 ? "y" : "ies"}
              </span>
            )}
          </p>
        </div>

        <Link to="/student/jobs">
          <Button variant="outline" size="sm" rightIcon={ArrowRight}>
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {/* 2. Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-6 space-y-4 border border-slate-200 bg-white">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load saved jobs"
          message="Could not retrieve your bookmarked jobs. Please check your connection and retry."
          onRetry={refetch}
        />
      ) : validSavedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Save interesting opportunities so you can easily come back and apply to them later."
          action={
            <Button
              variant="primary"
              onClick={() => navigate("/student/jobs")}
              leftIcon={Briefcase}
            >
              Explore Jobs
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {validSavedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSaved={true}
                onSaveToggle={() => handleUnsave(job._id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
