import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetMyCompaniesQuery,
  useDeleteCompanyMutation,
} from "../../store/api/companyApi";
import { useGetMyJobsQuery } from "../../store/api/jobApi";
import { CompanyCard } from "../../components/companies/CompanyCard";
import { DeleteCompanyModal } from "../../components/companies/DeleteCompanyModal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Skeleton } from "../../components/common/Skeleton";
import { Card } from "../../components/common/Card";

export const CompaniesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    refetch,
  } = useGetMyCompaniesQuery();

  const { data: jobsData } = useGetMyJobsQuery();

  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();

  const companies = companiesData?.data || [];
  const jobs = jobsData?.data || [];

  // Compute job count map per company
  const jobCountsByCompany = useMemo(() => {
    const map = {};
    jobs.forEach((job) => {
      const cId = typeof job.companyId === "object" ? job.companyId?._id : job.companyId;
      if (cId) {
        map[cId] = (map[cId] || 0) + 1;
      }
    });
    return map;
  }, [jobs]);

  // Filter companies by search term
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const term = searchTerm.toLowerCase().trim();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term) ||
        c.about?.toLowerCase().includes(term)
    );
  }, [companies, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;
    setDeleteError(null);

    try {
      await deleteCompany(companyToDelete._id).unwrap();
      toast.success(`${companyToDelete.name} was deleted successfully`);
      setCompanyToDelete(null);
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to delete company. Please check associated jobs and try again.";
      setDeleteError(errorMsg);
    }
  };

  const handleOpenDelete = (company) => {
    setDeleteError(null);
    setCompanyToDelete(company);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-primary-600" />
            Company Profiles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your registered organizations, branding assets, and view active job postings.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/recruiter/companies/create")}
          leftIcon={Plus}
          className="shrink-0"
        >
          Create Company
        </Button>
      </div>

      {/* Filter / Search Bar */}
      {companies.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search companies by name or location..."
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
            {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"}
          </span>
        </div>
      )}

      {/* Content Area */}
      {isCompaniesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="p-6 space-y-4 border-slate-200">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
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
      ) : isCompaniesError ? (
        <Card className="border-rose-200 bg-rose-50/50 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-rose-900">Failed to load companies</h3>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
            An unexpected error occurred while communicating with the server.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : companies.length === 0 ? (
        /* Global Empty State */
        <Card className="border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-sm">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No companies yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Register your first company before posting job openings. Candidates will see this company profile when applying for your positions.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate("/recruiter/companies/create")}
              leftIcon={Plus}
            >
              Create Company
            </Button>
          </div>
        </Card>
      ) : filteredCompanies.length === 0 ? (
        /* Search Empty State */
        <Card className="border-slate-200 bg-slate-50 p-8 text-center">
          <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No matching companies found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No company profiles match &ldquo;{searchTerm}&rdquo;. Try adjusting your keywords.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
              Clear Filter
            </Button>
          </div>
        </Card>
      ) : (
        /* Companies Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              jobCount={jobCountsByCompany[company._id] || 0}
              onDelete={handleOpenDelete}
              isOwner={true}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal with Relational Guard */}
      <DeleteCompanyModal
        isOpen={Boolean(companyToDelete)}
        onClose={() => {
          setCompanyToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        company={companyToDelete}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default CompaniesPage;
