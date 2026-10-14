import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useGetMyCompaniesQuery } from "../../store/api/companyApi";
import { useGetMyJobsQuery } from "../../store/api/jobApi";
import { useGetMyInterviewsQuery } from "../../store/api/interviewApi";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { CompanyCard } from "../../components/companies/CompanyCard";
import { InterviewCard } from "../../components/interviews/InterviewCard";

export const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
  } = useGetMyCompaniesQuery();

  const {
    data: jobsData,
    isLoading: isJobsLoading,
  } = useGetMyJobsQuery();

  const {
    data: interviewsData,
    isLoading: isInterviewsLoading,
  } = useGetMyInterviewsQuery();

  const companies = companiesData?.data || [];
  const jobs = jobsData?.data || [];
  const interviews = interviewsData?.data || [];

  // Map job counts per company for fast lookup
  const jobCountsByCompany = React.useMemo(() => {
    const map = {};
    jobs.forEach((job) => {
      const cId = typeof job.companyId === "object" ? job.companyId?._id : job.companyId;
      if (cId) {
        map[cId] = (map[cId] || 0) + 1;
      }
    });
    return map;
  }, [jobs]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      label: "Registered Companies",
      value: companies.length,
      icon: Building2,
      color: "text-primary-600 bg-primary-50 border-primary-100",
      href: "/recruiter/companies",
      loading: isCompaniesLoading,
    },
    {
      label: "Active Job Postings",
      value: jobs.length,
      icon: Briefcase,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      href: "/recruiter/jobs",
      loading: isJobsLoading,
    },
    {
      label: "Review Applicants",
      value: jobs.length > 0 ? "Active" : "0",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      href: "/recruiter/applications",
      loading: isJobsLoading,
    },
    {
      label: "Scheduled Interviews",
      value: interviews.length,
      icon: Calendar,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      href: "/recruiter/interviews",
      loading: isInterviewsLoading,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recruiter Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {getTimeGreeting()}, {user?.fullname || "Recruiter"} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Manage your hiring pipeline from one place. Register your company profiles, manage job postings, and review candidates.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              onClick={() => navigate("/recruiter/companies/create")}
              leftIcon={Plus}
              className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
            >
              Create Company
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/recruiter/jobs")}
              leftIcon={Briefcase}
              className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              Post a Job
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/recruiter/applications")}
              leftIcon={Users}
              className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              View Applicants
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 h-52 w-52 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.href} className="group block">
              <Card className="border-slate-200 transition-all duration-200 group-hover:border-primary-300 group-hover:shadow-md">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    {stat.loading ? (
                      <Skeleton className="h-8 w-14 mt-1.5" />
                    ) : (
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border ${stat.color} transition-transform group-hover:scale-105`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* My Companies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              My Companies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organizations you have registered and are authorized to manage
            </p>
          </div>
          {companies.length > 0 && (
            <Link
              to="/recruiter/companies"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              <span>View All Companies ({companies.length})</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {isCompaniesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="p-6 space-y-4 border-slate-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          /* Empty State Guiding Next Action */
          <Card className="border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-sm">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No companies registered yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Create your company profile before posting jobs. Your company details will be attached to every job posting and visible to applicants.
            </p>
            <div className="mt-5">
              <Button
                variant="primary"
                onClick={() => navigate("/recruiter/companies/create")}
                leftIcon={Plus}
                size="sm"
              >
                Create Company
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.slice(0, 3).map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                jobCount={jobCountsByCompany[company._id] || 0}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Job Postings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              Recent Job Postings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active roles published under your authorized organizations
            </p>
          </div>
          {jobs.length > 0 && (
            <Link
              to="/recruiter/jobs"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              <span>View All Jobs ({jobs.length})</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {isJobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="p-6 space-y-4 border-slate-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
            <Briefcase className="h-7 w-7 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No jobs posted yet</p>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
              Publish your first opening to attract qualified candidates across technical domains.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/recruiter/jobs/create")}
                leftIcon={Plus}
              >
                Post a Job
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.slice(0, 3).map((job) => (
              <RecruiterJobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Interview Sessions Section */}
      {interviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <span>Upcoming Candidate Interviews</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Scheduled technical evaluations and discussion rounds
              </p>
            </div>

            <Link
              to="/recruiter/interviews"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span>View All ({interviews.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.slice(0, 2).map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                role="recruiter"
              />
            ))}
          </div>
        </div>
      )}

      {/* Recruiter Workflow Helper Card */}
      <Card className="border-slate-200/80 bg-gradient-to-br from-slate-50 to-primary-50/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Hiring Workflow Guide
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="rounded-lg bg-white border border-slate-200/80 p-3.5 shadow-2xs">
              <p className="font-semibold text-slate-900 mb-1">1. Register Company</p>
              <p>Add your company details, logo, and website to establish credibility with candidates.</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-3.5 shadow-2xs">
              <p className="font-semibold text-slate-900 mb-1">2. Post Job Openings</p>
              <p>Publish job descriptions under your company with salary, experience, and skill criteria.</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-3.5 shadow-2xs">
              <p className="font-semibold text-slate-900 mb-1">3. Screen & Interview</p>
              <p>Review candidate profiles, shortlist applications, and coordinate interview rounds.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterDashboardPage;
