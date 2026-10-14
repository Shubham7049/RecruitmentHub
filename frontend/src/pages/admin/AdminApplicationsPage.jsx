import React, { useState } from "react";
import {
  FileText,
  Building2,
  Calendar,
  Shield,
  User,
  MapPin,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Pagination } from "../../components/common/Pagination";
import { useGetAllApplicationsAdminQuery } from "../../store/api/adminApi";
import { formatDate } from "../../utils/formatters";

export const AdminApplicationsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = {
    page: currentPage,
    limit: 15,
  };
  if (selectedStatus) queryParams.status = selectedStatus;

  const { data, isLoading, isError, error } =
    useGetAllApplicationsAdminQuery(queryParams);

  const applications = data?.data?.applications || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "hired":
        return "success";
      case "interview":
        return "primary";
      case "shortlisted":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "neutral";
    }
  };

  const statusFilters = [
    { label: "All Statuses", value: "" },
    { label: "Applied", value: "applied" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Interview", value: "interview" },
    { label: "Hired", value: "hired" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Application Audit
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive platform-wide oversight into candidate submissions, hiring pipelines, and status workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            {pagination.total} Total Applications
          </Badge>
        </div>
      </div>

      {/* Audit Banner Note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-800 flex items-start gap-2.5">
        <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Platform Pipeline Governance</p>
          <p className="mt-0.5 text-blue-700">
            Application statuses are strictly maintained by assigned recruiting authorities under Attribute-Based Access Control (ABAC). Administrative access provides audit-level visibility and compliance oversight.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusSelect(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === tab.value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Applications Table / List */}
      <Card>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Auditing platform applications...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rose-600 font-medium">
              {error?.data?.message || "Failed to load platform applications"}
            </p>
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications found"
            description="No applications match the selected pipeline status."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Candidate</th>
                    <th scope="col" className="py-3.5 px-4">Applied Position</th>
                    <th scope="col" className="py-3.5 px-4">Company</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {app.userId?.fullname || "Candidate"}
                        </div>
                        <div className="text-xs text-slate-400">{app.userId?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {app.jobId?.title || "Role Unavailable"}
                        </div>
                        {app.jobId?.location && (
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.jobId.location}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {app.jobId?.companyId?.name || "Company"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(app.status)} size="sm">
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(app.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {app.userId?.fullname || "Candidate"}
                      </p>
                      <p className="text-xs text-slate-400">{app.userId?.email}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(app.status)} size="sm">
                      {app.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="font-medium text-slate-800">
                      {app.jobId?.title || "Role"}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {app.jobId?.companyId?.name || "Company"} • {app.jobId?.location || "Location"}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 text-right pt-1">
                    Submitted {formatDate(app.createdAt)}
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
    </div>
  );
};

export default AdminApplicationsPage;
