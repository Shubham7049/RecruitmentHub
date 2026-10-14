import React, { useState } from "react";
import {
  Users,
  Search,
  Trash2,
  Eye,
  Shield,
  Filter,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Pagination } from "../../components/common/Pagination";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { AdminUserDetailsModal } from "../../components/admin/AdminUserDetailsModal";
import {
  useGetAllUsersAdminQuery,
  useDeleteUserAdminMutation,
} from "../../store/api/adminApi";
import { formatDate } from "../../utils/formatters";

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Deletion state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserAdminMutation();

  const queryParams = {
    page: currentPage,
    limit: 15,
  };
  if (searchTerm.trim()) queryParams.search = searchTerm.trim();
  if (selectedRole) queryParams.role = selectedRole;

  const { data, isLoading, isError, error, isFetching } =
    useGetAllUsersAdminQuery(queryParams);

  const users = data?.data?.users || [];
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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleOpenDetails = (userId) => {
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };

  const handlePromptDelete = (targetUser) => {
    if (targetUser._id === currentUser?._id) {
      toast.error("Security Restriction: Administrators cannot delete their own account.");
      return;
    }
    setUserToDelete(targetUser);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete._id).unwrap();
      toast.success(`User account "${userToDelete.fullname}" successfully removed.`);
      setIsConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove user account");
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "danger";
      case "recruiter":
        return "primary";
      default:
        return "success";
    }
  };

  const roleFilters = [
    { label: "All Roles", value: "" },
    { label: "Students", value: "student" },
    { label: "Recruiters", value: "recruiter" },
    { label: "Admins", value: "admin" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit registered student, recruiter, and administrator accounts across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            {pagination.total} Total Users
          </Badge>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={handleSearchChange}
                leftIcon={Search}
                size="sm"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {roleFilters.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleRoleSelect(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedRole === tab.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area: Table / Cards */}
      <Card>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Loading user roster...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rose-600 font-medium">
              {error?.data?.message || "Failed to load platform users"}
            </p>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search query or role filter."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">User</th>
                    <th scope="col" className="py-3.5 px-4">Contact</th>
                    <th scope="col" className="py-3.5 px-4">Role</th>
                    <th scope="col" className="py-3.5 px-4">Joined Date</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={u.avatar} name={u.fullname} size="sm" />
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                {u.fullname}
                                {isSelf && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-900 text-xs font-medium">{u.email}</div>
                          <div className="text-slate-400 text-xs">{u.phone || "No phone"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetails(u._id)}
                              title="Inspect user details"
                            >
                              <Eye className="h-4 w-4 mr-1 text-slate-500" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf}
                              onClick={() => handlePromptDelete(u)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isSelf ? "Self-deletion disabled" : "Delete account"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <div key={u._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar} name={u.fullname} size="md" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            {u.fullname}
                            {isSelf && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                      <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                        {u.role}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p><span className="text-slate-400">Email:</span> {u.email}</p>
                      <p><span className="text-slate-400">Joined:</span> {formatDate(u.createdAt)}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(u._id)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => handlePromptDelete(u)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      <AdminUserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
      />

      {/* Destructive Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Permanently Delete User Account?`}
        message={`Are you sure you want to permanently remove "${userToDelete?.fullname}" (@${userToDelete?.username})? This operation deletes the user account and associated profile. This action cannot be undone.`}
        confirmText="Yes, Delete User"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminUsersPage;
