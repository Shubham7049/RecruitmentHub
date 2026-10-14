import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Filter,
  Briefcase,
  X,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useGetJobsQuery } from "../../store/api/jobApi";
import { JobCard } from "../../components/jobs/JobCard";
import { JobFilters } from "../../components/jobs/JobFilters";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";

export const FindJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial query params
  const initialKeyword = searchParams.get("keyword") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialExperience = searchParams.get("experience") || "";
  const initialMinSalary = searchParams.get("minSalary") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Local filter states
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [filters, setFilters] = useState({
    keyword: initialKeyword,
    location: initialLocation,
    experience: initialExperience,
    minSalary: initialMinSalary,
  });
  const [page, setPage] = useState(initialPage);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state to URL params whenever filters or page changes
  useEffect(() => {
    const params = {};
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.location) params.location = filters.location;
    if (filters.experience) params.experience = filters.experience;
    if (filters.minSalary) params.minSalary = filters.minSalary;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  // Construct query parameters for RTK Query
  const queryParams = {
    page,
    limit: 10,
    ...(filters.keyword ? { keyword: filters.keyword } : {}),
    ...(filters.location ? { location: filters.location } : {}),
    ...(filters.experience !== "" ? { experience: filters.experience } : {}),
    ...(filters.minSalary !== "" ? { minSalary: filters.minSalary } : {}),
  };

  const {
    data: jobsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetJobsQuery(queryParams);

  const jobs = jobsResponse?.data?.jobs || [];
  const pagination = jobsResponse?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Count active filters (excluding default page)
  const activeFilterCount = [
    filters.keyword,
    filters.location,
    filters.experience,
    filters.minSalary,
  ].filter(Boolean).length;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    handleFilterChange("keyword", searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({
      keyword: "",
      location: "",
      experience: "",
      minSalary: "",
    });
    setPage(1);
  };

  const removeFilterPill = (key) => {
    if (key === "keyword") setSearchInput("");
    handleFilterChange(key, "");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Find Your Next Opportunity
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore curated technical and business roles from verified companies.
        </p>
      </div>

      {/* 2. Top Search Bar & Mobile Filter Trigger */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex-1 relative">
            <Input
              placeholder="Search by role, keywords, tech stack, or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={Search}
              className="pr-10 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  handleFilterChange("keyword", "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1 sm:flex-initial"
            >
              Search
            </Button>

            {/* Mobile Filter Drawer Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Active Filter Pills Bar */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400">Active:</span>

            {filters.keyword && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200 font-medium">
                Role: "{filters.keyword}"
                <button
                  type="button"
                  onClick={() => removeFilterPill("keyword")}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200 font-medium">
                Location: {filters.location}
                <button
                  type="button"
                  onClick={() => removeFilterPill("location")}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.experience !== "" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200 font-medium">
                Exp: &le; {filters.experience} yr{filters.experience === "1" ? "" : "s"}
                <button
                  type="button"
                  onClick={() => removeFilterPill("experience")}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.minSalary !== "" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200 font-medium">
                Salary &ge; ₹{Number(filters.minSalary) / 100000} LPA
                <button
                  type="button"
                  onClick={() => removeFilterPill("minSalary")}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* 3. Main Body: 2-Column Desktop Grid (Filters on Left, Jobs on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Mobile Filters Modal */}
        <Modal
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          title="Filter Jobs"
        >
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            activeFilterCount={activeFilterCount}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
            className="border-0 shadow-none p-0"
          />
        </Modal>

        {/* Jobs List / Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Row: Count & Status */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs sm:text-sm font-medium text-slate-600">
              {isLoading ? (
                <span>Loading available openings...</span>
              ) : (
                <span>
                  Showing <strong className="text-slate-900">{jobs.length}</strong> of{" "}
                  <strong className="text-slate-900">{pagination.total}</strong> position
                  {pagination.total === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {isFetching && !isLoading && (
              <span className="text-xs font-medium text-primary-600 animate-pulse">
                Updating...
              </span>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <Card key={n} className="p-6 space-y-4 border border-slate-200 bg-white">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load jobs"
              message="There was an error communicating with the job search service. Please try again."
              onRetry={refetch}
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found matching your criteria"
              description="Try adjusting your keyword, expanding your location, or loosening the salary and experience requirements."
              action={
                activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    leftIcon={RotateCcw}
                  >
                    Reset All Filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindJobsPage;
