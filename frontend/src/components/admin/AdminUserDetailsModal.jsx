import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Shield,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { Spinner } from "../common/Spinner";
import { useGetUserByIdAdminQuery } from "../../store/api/adminApi";
import { formatDate } from "../../utils/formatters";

export const AdminUserDetailsModal = ({ userId, isOpen, onClose }) => {
  const { data, isLoading, isError, error } = useGetUserByIdAdminQuery(userId, {
    skip: !userId || !isOpen,
  });

  const userData = data?.data?.user;
  const profileData = data?.data?.profile;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account Details"
      maxWidth="max-w-2xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading user profile...</p>
        </div>
      ) : isError ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-rose-600">
            {error?.data?.message || "Failed to load user details"}
          </p>
        </div>
      ) : userData ? (
        <div className="space-y-6">
          {/* Top User Overview */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Avatar
              src={userData.avatar}
              name={userData.fullname}
              size="lg"
              className="h-16 w-16 text-lg shrink-0 ring-2 ring-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {userData.fullname}
                </h3>
                <Badge variant={getRoleBadgeVariant(userData.role)} size="sm">
                  {userData.role}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">@{userData.username}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <a
                    href={`mailto:${userData.email}`}
                    className="hover:text-primary-600 truncate"
                  >
                    {userData.email}
                  </a>
                </span>
                {userData.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{userData.phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Joined {formatDate(userData.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details if present */}
          {profileData ? (
            <div className="space-y-4">
              {profileData.bio && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Bio / Summary
                  </h4>
                  <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                    {profileData.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {Array.isArray(profileData.skills) && profileData.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Skills & Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              {profileData.resume && (
                <div className="pt-2">
                  <a
                    href={profileData.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Candidate Resume
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500">
                No extended profile document created for this account.
              </p>
            </div>
          )}

          {/* Security & Audit notice */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs text-slate-500 flex items-start gap-2">
            <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Account ID: <code className="font-mono text-slate-700">{userData._id}</code> • Passwords and authentication tokens are strictly stripped by backend authorization.
            </span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default AdminUserDetailsModal;
