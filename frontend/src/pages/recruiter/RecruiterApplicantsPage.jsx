import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Users,
  Search,
  Briefcase,
  Filter,
  X,
  AlertCircle,
  Plus,
  Mail,
  Phone,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useGetMyJobsQuery } from "../../store/api/jobApi";
import { useGetApplicantsForJobQuery } from "../../store/api/applicationApi";
import { ApplicantCard } from "../../components/applications/ApplicantCard";
import { ApplicantDetailsModal } from "../../components/applications/ApplicantDetailsModal";
import { ApplicationStatusBadge } from "../../components/applications/ApplicationStatusBadge";
import { StatusUpdateSelect } from "../../components/applications/StatusUpdateSelect";
import { Avatar } from "../../components/common/Avatar";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Card, CardContent } from "../../components/common/Card";
import { Skeleton } from "../../components/common/Skeleton";
import { formatDate } from "../../utils/formatters";

const STATUS_FILTERS = [
  { id: "all", label: "All Applicants" },
  { id: "applied", label: "Under Review" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Not Selected" },
];

export const RecruiterApplicantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected job from URL or state
  const initialJobId = searchParams.get("jobId") || "";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalApp, setActiveModalApp] = useState(null);

  // 1. Fetch all recruiter's jobs to populate the job filter
  const {
    data: jobsResponse,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useGetMyJobsQuery();

  const jobs = jobsResponse?.data || [];

  // Auto-select first job if none selected and jobs exist
  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      const firstJobId = jobs[0]._id;
      setSelectedJobId(firstJobId);
      setSearchParams({ jobId: firstJobId }, { replace: true });
    }
  }, [jobs, selectedJobId, setSearchParams]);

  // Sync if URL parameter changes
  useEffect(() => {
    const paramJobId = searchParams.get("jobId");
    if (paramJobId && paramJobId !== selectedJobId) {
      setSelectedJobId(paramJobId);
    }
  }, [searchParams, selectedJobId]);

  // Handle job filter change
  const handleJobChange = (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    if (newJobId) {
      setSearchParams({ jobId: newJobId });
    } else {
      setSearchParams({});
    }
  };

  // 2. Fetch applicants for the selected job
  const {
    data: applicantsResponse,
    isLoading: isApplicantsLoading,
    isError: isApplicantsError,
    refetch,
  } = useGetApplicantsForJobQuery(selectedJobId, {
    skip: !selectedJobId,
  });

  const rawApplications = applicantsResponse?.data?.applications || [];
  const currentJob = applicantsResponse?.data?.job || jobs.find((j) => j._id === selectedJobId);

  // Pipeline Metric counts based on current job's applications
  const pipelineMetrics = useMemo(() => {
    const counts = { all: rawApplications.length, applied: 0, shortlisted: 0, interview: 0, hired: 0, rejected: 0 };
    rawApplications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });
    return counts;
  }, [rawApplications]);

  // Filtered applications by Status & Search Keyword
  const filteredApplications = useMemo(() => {
    return rawApplications.filter((app) => {
      // Status filter
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const applicant = typeof app.userId === "object" ? app.userId : {};
        const nameMatch = applicant.fullname?.toLowerCase().includes(query);
        const emailMatch = applicant.email?.toLowerCase().includes(query);
        const phoneMatch = applicant.phone?.includes(query);
        if (!nameMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rawApplications, statusFilter, searchQuery]);

  // Options for the job selector dropdown
  const jobOptions = jobs.map((j) => ({
    value: j._id,
    label: `${j.title} (${typeof j.companyId === "object" ? j.companyId?.name : "Company"})`,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-primary-600" />
            Applicants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review candidates who applied to your jobs and manage their application status.
          </p>
        </div>

        {selectedJobId && currentJob && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/recruiter/jobs/${selectedJobId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>View Job Posting</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* No Jobs Registered Guard */}
      {!isJobsLoading && jobs.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-sm">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Job Postings Yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            You haven&apos;t published any jobs yet. Create your first job posting so candidates can find your opportunities and submit applications.
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
      ) : (
        <>
          {/* Controls Bar: Job Selector & Search Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Job Selector Dropdown */}
            <div className="md:col-span-1">
              <Select
                label="Filter by Job"
                value={selectedJobId}
                onChange={handleJobChange}
                options={jobOptions}
                placeholder="Select a job opening"
                disabled={isJobsLoading}
              />
            </div>

            {/* Candidate Search Input */}
            <div className="md:col-span-2 flex items-end">
              <div className="relative w-full">
                <Input
                  label="Search Candidates"
                  placeholder="Search by candidate name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={Search}
                  className="pr-8"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-[38px] text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pipeline Metric Pills & Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {STATUS_FILTERS.map((tab) => {
              const count = pipelineMetrics[tab.id] || 0;
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors select-none ${
                    isActive
                      ? "bg-primary-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Applications Content */}
          {isApplicantsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-5 border-slate-200">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isApplicantsError ? (
            <Card className="border-rose-200 bg-rose-50/60 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-rose-900">Failed to load applicants</h3>
              <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
                Unable to retrieve candidates for this job. Please ensure you are authorized and try again.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </Card>
          ) : rawApplications.length === 0 ? (
            /* Job Has Zero Applicants */
            <Card className="border-dashed border-slate-300 bg-slate-50/60 p-10 text-center">
              <Users className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No applicants yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                No candidates have applied to <span className="font-semibold text-slate-800">{currentJob?.title || "this position"}</span> yet. Candidates will appear here as soon as they submit applications.
              </p>
            </Card>
          ) : filteredApplications.length === 0 ? (
            /* Search/Filter Zero State */
            <Card className="border-slate-200 bg-slate-50 p-8 text-center">
              <Filter className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No matching applicants</h3>
              <p className="text-xs text-slate-500 mt-1">
                No candidates match your selected status and search keyword.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-5 py-3.5">Candidate</th>
                      <th scope="col" className="px-4 py-3.5">Contact Details</th>
                      <th scope="col" className="px-4 py-3.5">Applied Date</th>
                      <th scope="col" className="px-4 py-3.5">Current Status</th>
                      <th scope="col" className="px-4 py-3.5">Update Stage</th>
                      <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredApplications.map((app) => {
                      const applicant = typeof app.userId === "object" ? app.userId : {};
                      return (
                        <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar src={applicant.avatar} name={applicant.fullname} size="sm" />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {applicant.fullname || "Candidate"}
                                </p>
                                <p className="text-[11px] text-slate-400">ID: {app._id.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              {applicant.email && (
                                <a
                                  href={`mailto:${applicant.email}`}
                                  className="text-primary-600 hover:underline flex items-center gap-1 truncate"
                                >
                                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{applicant.email}</span>
                                </a>
                              )}
                              {applicant.phone && (
                                <a
                                  href={`tel:${applicant.phone}`}
                                  className="text-slate-600 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{applicant.phone}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                            {formatDate(app.createdAt)}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <ApplicationStatusBadge status={app.status} size="sm" />
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <StatusUpdateSelect
                              applicationId={app._id}
                              currentStatus={app.status}
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveModalApp(app)}
                              leftIcon={Eye}
                              className="text-xs"
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden space-y-3">
                {filteredApplications.map((app) => (
                  <ApplicantCard
                    key={app._id}
                    application={app}
                    jobTitle={currentJob?.title}
                    onViewDetails={(a) => setActiveModalApp(a)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Candidate Review Modal */}
      <ApplicantDetailsModal
        isOpen={Boolean(activeModalApp)}
        onClose={() => setActiveModalApp(null)}
        application={activeModalApp}
        jobTitle={currentJob?.title}
      />
    </div>
  );
};

export default RecruiterApplicantsPage;
