import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetMyJobsQuery,
  useDeleteJobMutation,
} from "../../store/api/jobApi";
import { RecruiterJobCard } from "../../components/jobs/RecruiterJobCard";
import { DeleteJobModal } from "../../components/jobs/DeleteJobModal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Skeleton } from "../../components/common/Skeleton";
import { Card } from "../../components/common/Card";

export const RecruiterJobsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const {
    data: jobsResponse,
    isLoading: isJobsLoading,
    isError: isJobsError,
    refetch,
  } = useGetMyJobsQuery();

  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  const jobs = jobsResponse?.data || [];

  // Filter jobs by search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    const term = searchTerm.toLowerCase().trim();
    return jobs.filter((j) => {
      const companyName =
        typeof j.companyId === "object" ? j.companyId?.name || "" : "";
      return (
        j.title?.toLowerCase().includes(term) ||
        j.location?.toLowerCase().includes(term) ||
        companyName.toLowerCase().includes(term)
      );
    });
  }, [jobs, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    setDeleteError(null);

    try {
      await deleteJob(jobToDelete._id).unwrap();
      toast.success(`${jobToDelete.title} was deleted successfully`);
      setJobToDelete(null);
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to delete job posting. Please check attached applications and try again.";
      setDeleteError(errorMsg);
    }
  };

  const handleOpenDelete = (job) => {
    setDeleteError(null);
    setJobToDelete(job);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-primary-600" />
            My Job Postings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your published roles, requirements, and monitor candidate recruitment.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/recruiter/jobs/create")}
          leftIcon={Plus}
          className="shrink-0"
        >
          Post a Job
        </Button>
      </div>

      {/* Filter / Search Bar */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search by job title, location, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
              className="pr-8"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <span className="text-xs font-medium text-slate-500">
            {filteredJobs.length} {filteredJobs.length === 1 ? "posting" : "postings"}
          </span>
        </div>
      )}

      {/* Content Area */}
      {isJobsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="p-6 space-y-4 border-slate-200">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      ) : isJobsError ? (
        <Card className="border-rose-200 bg-rose-50/50 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-rose-900">Unable to load your jobs</h3>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
            A server error occurred while retrieving your job postings.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : jobs.length === 0 ? (
        /* Global Empty State */
        <Card className="border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-sm">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            You haven&apos;t posted any jobs yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Create your first job posting to start receiving applications from qualified candidates.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate("/recruiter/jobs/create")}
              leftIcon={Plus}
            >
              Post a Job
            </Button>
          </div>
        </Card>
      ) : filteredJobs.length === 0 ? (
        /* Search Empty State */
        <Card className="border-slate-200 bg-slate-50 p-8 text-center">
          <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No matching jobs found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No job postings match &ldquo;{searchTerm}&rdquo;. Try adjusting your keywords.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
              Clear Filter
            </Button>
          </div>
        </Card>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <RecruiterJobCard
              key={job._id}
              job={job}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteJobModal
        isOpen={Boolean(jobToDelete)}
        onClose={() => {
          setJobToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        job={jobToDelete}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default RecruiterJobsPage;
