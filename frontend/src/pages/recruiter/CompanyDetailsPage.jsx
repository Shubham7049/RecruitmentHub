import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  Edit2,
  Trash2,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetCompanyByIdQuery,
  useDeleteCompanyMutation,
} from "../../store/api/companyApi";
import { useGetJobsQuery } from "../../store/api/jobApi";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { DeleteCompanyModal } from "../../components/companies/DeleteCompanyModal";
import { formatDate, formatSalary } from "../../utils/formatters";

export const CompanyDetailsPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch target company details
  const {
    data: companyResponse,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyApiError,
  } = useGetCompanyByIdQuery(companyId);

  // Fetch jobs associated with this company
  const {
    data: jobsResponse,
    isLoading: isJobsLoading,
  } = useGetJobsQuery({ companyId });

  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();

  const company = companyResponse?.data;
  const jobs = jobsResponse?.data?.jobs || [];

  // Ownership verification check: Recruiter must be the creator
  const creatorId =
    typeof company?.createdBy === "object"
      ? company?.createdBy?._id
      : company?.createdBy;
  const isOwner = Boolean(user?._id && creatorId && user._id.toString() === creatorId.toString());

  const handleDeleteConfirm = async () => {
    if (!company) return;
    setDeleteError(null);

    try {
      await deleteCompany(company._id).unwrap();
      toast.success(`${company.name} was deleted successfully`);
      setIsDeleteModalOpen(false);
      navigate("/recruiter/companies");
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to delete company. Please check associated jobs and try again.";
      setDeleteError(errorMsg);
    }
  };

  if (isCompanyLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Card className="p-8 border-slate-200">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </Card>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isCompanyError || !company) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-rose-200 bg-rose-50/60 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900">Company Not Found</h2>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
            {companyApiError?.data?.message ||
              "The requested company profile could not be found or you do not have permission to view it."}
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/recruiter/companies")}
              leftIcon={ArrowLeft}
            >
              Back to Companies
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { name, location, website, about, logo, createdAt } = company;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <Link
        to="/recruiter/companies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Companies</span>
      </Link>

      {/* Header Profile Card */}
      <Card className="border-slate-200/90 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Logo / Avatar fallback */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-xs overflow-hidden">
                {logo && !imageError ? (
                  <img
                    src={logo}
                    alt={`${name} logo`}
                    className="h-full w-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-700 font-bold text-2xl rounded-xl">
                    {name ? name.slice(0, 2).toUpperCase() : <Building2 className="h-10 w-10 text-primary-500" />}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {name}
                  </h1>
                  {isOwner ? (
                    <Badge variant="success" size="sm">
                      Managed by you
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Registered Organization
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{location || "Location not specified"}</span>
                  </span>

                  {website && (
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-600 hover:underline font-medium"
                    >
                      <Globe className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      <span>{website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  )}

                  {createdAt && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Registered on {formatDate(createdAt)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-2.5 shrink-0 self-start">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Edit2}
                  onClick={() => navigate(`/recruiter/companies/${companyId}/edit`)}
                >
                  Edit Company
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Trash2}
                  onClick={() => {
                    setDeleteError(null);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* About Company Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            About the Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          {about ? (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {about}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No description added for this company yet. Click &ldquo;Edit Company&rdquo; to add details.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Associated Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              Active Job Postings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Positions currently accepting applications under {name}
            </p>
          </div>

          <Badge variant="primary" size="sm">
            {jobs.length} {jobs.length === 1 ? "Opening" : "Openings"}
          </Badge>
        </div>

        {isJobsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <Card key={n} className="p-5 border-slate-200">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
            <Briefcase className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No active job openings</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No positions have been posted under {name} yet.
            </p>
            {isOwner && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/recruiter/jobs")}
                  leftIcon={Plus}
                >
                  Post a Job
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-3.5">
            {jobs.map((job) => (
              <Card
                key={job._id}
                className="border-slate-200/90 hover:border-primary-300 transition-colors"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-emerald-600">
                        {formatSalary(job.salary)}
                      </span>
                      <span>•</span>
                      <span>{job.experience} Yrs Experience</span>
                      {job.createdAt && (
                        <>
                          <span>•</span>
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </>
                      )}
                    </div>

                    {/* Requirements pills */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.slice(0, 4).map((req, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="text-[11px] text-slate-400 self-center">
                            +{job.requirements.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/student/jobs/${job._id}`)}
                      rightIcon={ArrowUpRight}
                      className="text-xs"
                    >
                      View Posting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCompanyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        company={company}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default CompanyDetailsPage;
