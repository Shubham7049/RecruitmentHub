import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Bookmark,
  Calendar,
  Bell,
  ArrowRight,
  UserCheck,
  Sparkles,
  FileText,
  Search,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useGetJobsQuery } from "../../store/api/jobApi";
import { useGetMyApplicationsQuery } from "../../store/api/applicationApi";
import { useGetMySavedJobsQuery } from "../../store/api/savedJobApi";
import { useGetMyInterviewsQuery } from "../../store/api/interviewApi";
import { useGetMyNotificationsQuery } from "../../store/api/notificationApi";
import { useGetMyProfileQuery } from "../../store/api/profileApi";
import { JobCard } from "../../components/jobs/JobCard";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { InterviewCard } from "../../components/interviews/InterviewCard";
import { Card, CardContent } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { getGreeting } from "../../utils/formatters";

export const StudentDashboardPage = () => {
  const { user } = useAuth();

  // Queries for live metrics
  const {
    data: applicationsData,
    isLoading: isAppsLoading,
  } = useGetMyApplicationsQuery();

  const {
    data: savedJobsData,
    isLoading: isSavedLoading,
  } = useGetMySavedJobsQuery();

  const {
    data: interviewsData,
    isLoading: isInterviewsLoading,
  } = useGetMyInterviewsQuery();

  const {
    data: notificationsData,
    isLoading: isNotifsLoading,
  } = useGetMyNotificationsQuery();

  const {
    data: profileData,
  } = useGetMyProfileQuery();

  // Fetch recent opportunities (latest 4)
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError,
    refetch: refetchJobs,
  } = useGetJobsQuery({ page: 1, limit: 4 });

  // Compute profile completion percentage
  const profile = profileData?.data;
  let profileCompletion = 20; // Default 20% for registered account details (name, email)
  if (profile) {
    if (profile.dob) profileCompletion += 15;
    if (profile.skills && profile.skills.length > 0) profileCompletion += 25;
    if (profile.education && profile.education.length > 0) profileCompletion += 20;
    if (profile.resumeUrl) profileCompletion += 20;
  }

  const applicationsCount = applicationsData?.data?.length || 0;
  const savedJobsCount = savedJobsData?.data?.length || 0;
  const interviewsCount = interviewsData?.data?.length || 0;
  const unreadNotifsCount = notificationsData?.data?.unreadCount || 0;
  const recentJobs = jobsData?.data?.jobs || [];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header with dynamic greeting and profile completion card */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {getGreeting()}, {user?.fullname || "Candidate"}!
            </h1>
            <p className="text-sm sm:text-base text-primary-100 max-w-xl">
              Track your job applications, discover verified tech roles, and prepare for upcoming interviews.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/15 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-primary-200">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                Profile Strength
              </span>
              <span className="text-white font-bold">{profileCompletion}%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  profileCompletion === 100
                    ? "bg-emerald-400"
                    : profileCompletion >= 60
                    ? "bg-primary-400"
                    : "bg-amber-400"
                }`}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-primary-200">
                {profileCompletion === 100
                  ? "All sections up to date"
                  : "Add skills & resume"}
              </span>
              <Link
                to="/student/profile"
                className="text-xs font-semibold text-white hover:text-primary-200 underline decoration-primary-300 underline-offset-2 transition-colors"
              >
                {profileCompletion === 100 ? "View Profile" : "Complete Profile"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Applications */}
        <Link to="/student/applications" className="group">
          <Card className="h-full border border-slate-200/90 hover:border-primary-300 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Submitted Applications</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {isAppsLoading ? <Skeleton className="h-7 w-12" /> : applicationsCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Saved Jobs */}
        <Link to="/student/saved-jobs" className="group">
          <Card className="h-full border border-slate-200/90 hover:border-primary-300 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                <Bookmark className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Saved Jobs</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {isSavedLoading ? <Skeleton className="h-7 w-12" /> : savedJobsCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Scheduled Interviews */}
        <Link to="/student/interviews" className="group">
          <Card className="h-full border border-slate-200/90 hover:border-primary-300 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Upcoming Interviews</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {isInterviewsLoading ? <Skeleton className="h-7 w-12" /> : interviewsCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Unread Notifications */}
        <Link to="/student/notifications" className="group">
          <Card className="h-full border border-slate-200/90 hover:border-primary-300 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Unread Updates</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {isNotifsLoading ? <Skeleton className="h-7 w-12" /> : unreadNotifsCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Interviews Section */}
      {interviewsCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <span>Upcoming Interviews</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Confirmed sessions and online meeting links
              </p>
            </div>

            <Link
              to="/student/interviews"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span>View All Interviews</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewsData.data.slice(0, 2).map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                role="student"
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Recent Applications Section */}
      {applicationsCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Recent Applications
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Track your active submissions and stage progression
              </p>
            </div>

            <Link
              to="/student/applications"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span>View All Applications</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(applicationsData?.data || []).slice(0, 3).map((app) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Latest Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Latest Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Fresh openings posted by verified recruiters
            </p>
          </div>

          <Link
            to="/student/jobs"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Jobs Grid or Loading / Error State */}
        {isJobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="p-6 space-y-4 border border-slate-200 bg-white">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : isJobsError ? (
          <ErrorState
            title="Unable to load recent jobs"
            message="Could not connect to the job repository. Please check your connection and retry."
            onRetry={refetchJobs}
          />
        ) : recentJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No job openings available"
            description="Recruiters are currently preparing new positions. Check back soon!"
            action={
              <Button variant="outline" size="sm" onClick={() => refetchJobs()}>
                Refresh Feed
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {recentJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Discovery Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Looking for a specific role?</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Filter positions by keyword, preferred location, required experience, and salary brackets.
            </p>
          </div>
        </div>
        <Link to="/student/jobs" className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            Find Jobs Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
