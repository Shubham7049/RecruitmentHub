import React, { useState } from "react";
import {
  Building2,
  Search,
  Trash2,
  ExternalLink,
  MapPin,
  Globe,
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
import { useGetCompaniesQuery } from "../../store/api/companyApi";
import { useDeleteCompanyAdminMutation } from "../../store/api/adminApi";
import { formatDate } from "../../utils/formatters";

export const AdminCompaniesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion state
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyAdminMutation();

  const queryParams = {
    page: currentPage,
    limit: 15,
  };
  if (searchTerm.trim()) queryParams.search = searchTerm.trim();

  const { data, isLoading, isError, error } = useGetCompaniesQuery(queryParams);

  const companies = data?.data?.companies || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePromptDelete = (comp) => {
    setCompanyToDelete(comp);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompany(companyToDelete._id).unwrap();
      toast.success(`Company "${companyToDelete.name}" was successfully removed.`);
      setIsConfirmOpen(false);
      setCompanyToDelete(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove company");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Company Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit registered employer entities, verify websites, and moderate listings platform-wide.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            {pagination.total} Registered Companies
          </Badge>
        </div>
      </div>

      {/* Search Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search companies by name or location..."
              value={searchTerm}
              onChange={handleSearchChange}
              leftIcon={Search}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies List / Table */}
      <Card>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Loading companies directory...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rose-600 font-medium">
              {error?.data?.message || "Failed to load companies"}
            </p>
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies found"
            description="Try searching with a different name or location keyword."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Company</th>
                    <th scope="col" className="py-3.5 px-4">Location</th>
                    <th scope="col" className="py-3.5 px-4">Website</th>
                    <th scope="col" className="py-3.5 px-4">Registered Date</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((comp) => (
                    <tr key={comp._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {comp.logo ? (
                            <img
                              src={comp.logo}
                              alt={comp.name}
                              className="h-10 w-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {comp.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {comp.name}
                            </p>
                            {comp.about && (
                              <p className="text-xs text-slate-400 truncate max-w-xs">
                                {comp.about}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {comp.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {comp.website ? (
                          <a
                            href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(comp.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDelete(comp)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete company from platform"
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
              {companies.map((comp) => (
                <div key={comp._id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {comp.logo ? (
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="h-10 w-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {comp.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{comp.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {comp.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Registered: {formatDate(comp.createdAt)}</span>
                    {comp.website && (
                      <a
                        href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 font-medium inline-flex items-center gap-1"
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptDelete(comp)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove Company
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
          setCompanyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Company Platform-Wide?"
        message={`Are you sure you want to permanently delete "${companyToDelete?.name}"? This moderation action removes the company listing from the platform.`}
        confirmText="Yes, Remove Company"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCompaniesPage;
