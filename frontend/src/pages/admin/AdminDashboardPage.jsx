import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Avatar } from "../../components/common/Avatar";
import { Spinner } from "../../components/common/Spinner";
import { ErrorState } from "../../components/common/ErrorState";
import { AdminStatCard } from "../../components/admin/AdminStatCard";
import {
  useGetPlatformStatsQuery,
  useGetAllUsersAdminQuery,
  useGetAllApplicationsAdminQuery,
  useGetAllInterviewsAdminQuery,
} from "../../store/api/adminApi";
import { formatDate } from "../../utils/formatters";

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetPlatformStatsQuery();

  const { data: recentUsersData, isLoading: usersLoading } =
    useGetAllUsersAdminQuery({ page: 1, limit: 5 });

  const { data: recentAppsData, isLoading: appsLoading } =
    useGetAllApplicationsAdminQuery({ page: 1, limit: 5 });

  const { data: recentIntsData, isLoading: intsLoading } =
    useGetAllInterviewsAdminQuery({ page: 1, limit: 5 });

  const stats = statsData?.data || {
    users: { total: 0, students: 0, recruiters: 0 },
    companies: 0,
    jobs: 0,
    applications: 0,
    interviews: 0,
  };

  const recentUsers = recentUsersData?.data?.users || [];
  const recentApplications = recentAppsData?.data?.applications || [];
  const recentInterviews = recentIntsData?.data?.interviews || [];

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

  const getAppStatusBadgeVariant = (status) => {
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

  return (
    <div className="space-y-8">
      {/* Admin Top Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="danger"
                size="sm"
                className="bg-rose-500/20 text-rose-200 border-rose-500/30"
              >
                Platform Administration
              </Badge>
              <span className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{user?.fullname || "Admin"}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Admin Moderation & Telemetry Center 🛡️
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Real-time platform metrics, user management, company verification, and system oversight.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/admin/users">
              <Button variant="outline" size="sm" className="border-slate-700 text-white hover:bg-slate-800">
                <Users className="h-4 w-4 mr-1.5" />
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/jobs">
              <Button variant="outline" size="sm" className="border-slate-700 text-white hover:bg-slate-800">
                <Briefcase className="h-4 w-4 mr-1.5" />
                Manage Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Telemetry Metrics */}
      {statsLoading ? (
        <div className="p-12 flex justify-center">
          <Spinner size="lg" label="Loading platform telemetry..." />
        </div>
      ) : statsError ? (
        <ErrorState
          title="Failed to load platform analytics"
          message="Could not retrieve real-time statistics from /api/v1/admin/stats."
          onRetry={refetchStats}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AdminStatCard
            label="Total Platform Users"
            value={stats.users?.total ?? 0}
            subtitle={`${stats.users?.students ?? 0} Students • ${stats.users?.recruiters ?? 0} Recruiters`}
            icon={Users}
            colorScheme="blue"
            linkTo="/admin/users"
          />
          <AdminStatCard
            label="Registered Companies"
            value={stats.companies ?? 0}
            subtitle="Verified employers"
            icon={Building2}
            colorScheme="indigo"
            linkTo="/admin/companies"
          />
          <AdminStatCard
            label="Active Jobs"
            value={stats.jobs ?? 0}
            subtitle="Posted listings"
            icon={Briefcase}
            colorScheme="emerald"
            linkTo="/admin/jobs"
          />
          <AdminStatCard
            label="Total Applications"
            value={stats.applications ?? 0}
            subtitle="Candidate submissions"
            icon={FileText}
            colorScheme="amber"
            linkTo="/admin/applications"
          />
          <AdminStatCard
            label="Scheduled Interviews"
            value={stats.interviews ?? 0}
            subtitle="Hiring rounds"
            icon={Calendar}
            colorScheme="purple"
            linkTo="/admin/interviews"
          />
        </div>
      )}

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          to="/admin/users"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group flex flex-col items-center text-center"
        >
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">Manage Users</span>
          <span className="text-xs text-slate-500 mt-0.5">Filter & Moderation</span>
        </Link>

        <Link
          to="/admin/companies"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group flex flex-col items-center text-center"
        >
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">Companies</span>
          <span className="text-xs text-slate-500 mt-0.5">Employer Directory</span>
        </Link>

        <Link
          to="/admin/jobs"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all group flex flex-col items-center text-center"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">Manage Jobs</span>
          <span className="text-xs text-slate-500 mt-0.5">Audit Listings</span>
        </Link>

        <Link
          to="/admin/applications"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group flex flex-col items-center text-center"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">Applications</span>
          <span className="text-xs text-slate-500 mt-0.5">Pipeline Audit</span>
        </Link>

        <Link
          to="/admin/interviews"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm transition-all group flex flex-col items-center text-center col-span-2 sm:col-span-1"
        >
          <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">Interviews</span>
          <span className="text-xs text-slate-500 mt-0.5">Schedules & Rooms</span>
        </Link>
      </div>

      {/* Two Column Section: Recent Users & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Recent Platform Users
            </CardTitle>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-8 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No users found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <div key={u._id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} name={u.fullname} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {u.fullname}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                        {u.role}
                      </Badge>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Platform Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600" />
              Recent Candidate Applications
            </CardTitle>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {appsLoading ? (
              <div className="p-8 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : recentApplications.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No applications found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <div key={app._id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {app.userId?.fullname || "Unknown Candidate"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Applied for: <span className="font-medium text-slate-700">{app.jobId?.title || "Job Listing"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={getAppStatusBadgeVariant(app.status)} size="sm">
                        {app.status}
                      </Badge>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming / Recent Platform Interviews Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            Platform Interview Rounds
          </CardTitle>
          <Link
            to="/admin/interviews"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {intsLoading ? (
            <div className="p-8 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : recentInterviews.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No interviews scheduled on the platform.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentInterviews.map((intItem) => (
                <div key={intItem._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {intItem.round || "Interview Session"}
                      </span>
                      <Badge
                        variant={
                          intItem.status === "scheduled"
                            ? "primary"
                            : intItem.status === "completed"
                            ? "success"
                            : intItem.status === "rescheduled"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {intItem.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Candidate: <span className="font-medium text-slate-700">{intItem.applicationId?.userId?.fullname || "Candidate"}</span> • Job: <span className="font-medium text-slate-700">{intItem.applicationId?.jobId?.title || "Role"}</span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 shrink-0">
                    <span className="font-medium">{formatDate(intItem.scheduledAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
