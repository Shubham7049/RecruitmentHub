import React, { useState } from "react";
import {
  Briefcase,
  Search,
  Trash2,
  MapPin,
  IndianRupee,
  Calendar,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useGetJobsQuery } from "../../store/api/jobApi";
import { useDeleteJobAdminMutation } from "../../store/api/adminApi";
import { formatDate } from "../../utils/formatters";

export const AdminJobsPage = () => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobAdminMutation();

  const queryParams = {
    page: currentPage,
    limit: 15,
  };
  if (keyword.trim()) queryParams.keyword = keyword.trim();
  if (location.trim()) queryParams.location = location.trim();

  const { data, isLoading, isError, error } = useGetJobsQuery(queryParams);

  const jobs = data?.data?.jobs || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setCurrentPage(1);
  };

  const handlePromptDelete = (job) => {
    setJobToDelete(job);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob(jobToDelete._id).unwrap();
      toast.success(`Job listing "${jobToDelete.title}" removed successfully.`);
      setIsConfirmOpen(false);
      setJobToDelete(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove job");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Job Listings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit employer job opportunities, compensation ranges, and moderate platform postings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            {pagination.total} Active Postings
          </Badge>
        </div>
      </div>

      {/* Search & Location Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search by job title or keyword..."
              value={keyword}
              onChange={handleKeywordChange}
              leftIcon={Search}
              size="sm"
            />
            <Input
              placeholder="Filter by location (e.g. Remote, Bangalore)..."
              value={location}
              onChange={handleLocationChange}
              leftIcon={MapPin}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Jobs Table / Card List */}
      <Card>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Loading job postings...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rose-600 font-medium">
              {error?.data?.message || "Failed to load jobs"}
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try relaxing your keyword or location filters."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Position</th>
                    <th scope="col" className="py-3.5 px-4">Company</th>
                    <th scope="col" className="py-3.5 px-4">Location & Exp</th>
                    <th scope="col" className="py-3.5 px-4">Salary</th>
                    <th scope="col" className="py-3.5 px-4">Posted Date</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{job.title}</div>
                        {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.requirements.slice(0, 3).map((req, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                              >
                                {req}
                              </span>
                            ))}
                            {job.requirements.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{job.requirements.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-900 truncate">
                            {job.companyId?.name || "Company"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {job.experience ? `${job.experience}+ yrs exp` : "Any experience"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                        {job.salary ? `₹${job.salary.toLocaleString()} / mo` : "Disclosed"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDelete(job)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Remove job from platform"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {job.companyId?.name || "Company"} • {job.location}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {job.salary ? `₹${job.salary.toLocaleString()}` : "Disclosed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Posted: {formatDate(job.createdAt)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptDelete(job)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove Job
                    </Button>
                  </div>
                </div>
              ))}
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setJobToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Job Posting Platform-Wide?"
        message={`Are you sure you want to remove the job listing "${jobToDelete?.title}" (${jobToDelete?.companyId?.name || "Company"})? This moderation action immediately removes the listing from the platform.`}
        confirmText="Yes, Remove Job"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminJobsPage;
