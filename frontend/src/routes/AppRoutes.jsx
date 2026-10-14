import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import PublicRoute from "./PublicRoute";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import FindJobsPage from "../pages/student/FindJobsPage";
import JobDetailsPage from "../pages/student/JobDetailsPage";
import SavedJobsPage from "../pages/student/SavedJobsPage";
import StudentApplicationsPage from "../pages/student/StudentApplicationsPage";
import ApplicationDetailsPage from "../pages/student/ApplicationDetailsPage";
import StudentInterviewsPage from "../pages/student/StudentInterviewsPage";
import StudentInterviewDetailsPage from "../pages/student/StudentInterviewDetailsPage";
import RecruiterDashboardPage from "../pages/recruiter/RecruiterDashboardPage";
import CompaniesPage from "../pages/recruiter/CompaniesPage";
import CreateCompanyPage from "../pages/recruiter/CreateCompanyPage";
import CompanyDetailsPage from "../pages/recruiter/CompanyDetailsPage";
import EditCompanyPage from "../pages/recruiter/EditCompanyPage";
import RecruiterJobsPage from "../pages/recruiter/RecruiterJobsPage";
import CreateJobPage from "../pages/recruiter/CreateJobPage";
import JobDetailsRecruiterPage from "../pages/recruiter/JobDetailsRecruiterPage";
import EditJobPage from "../pages/recruiter/EditJobPage";
import RecruiterApplicantsPage from "../pages/recruiter/RecruiterApplicantsPage";
import RecruiterApplicationDetailsPage from "../pages/recruiter/RecruiterApplicationDetailsPage";
import RecruiterInterviewsPage from "../pages/recruiter/RecruiterInterviewsPage";
import RecruiterInterviewDetailsPage from "../pages/recruiter/RecruiterInterviewDetailsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminCompaniesPage from "../pages/admin/AdminCompaniesPage";
import AdminJobsPage from "../pages/admin/AdminJobsPage";
import AdminApplicationsPage from "../pages/admin/AdminApplicationsPage";
import AdminInterviewsPage from "../pages/admin/AdminInterviewsPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";

import { ROLES } from "../constants/roles";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with Public Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<LandingPage />} />

        {/* Guest Only Routes (Redirects authenticated users to their dashboard) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Authenticated Pages with Authenticated Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          {/* STUDENT ROUTES */}
          <Route element={<RoleRoute allowedRole={ROLES.STUDENT} />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/jobs" element={<FindJobsPage />} />
            <Route path="/student/jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/student/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/student/applications/:applicationId" element={<ApplicationDetailsPage />} />
            <Route path="/student/interviews" element={<StudentInterviewsPage />} />
            <Route path="/student/interviews/:interviewId" element={<StudentInterviewDetailsPage />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>

          {/* RECRUITER ROUTES */}
          <Route element={<RoleRoute allowedRole={ROLES.RECRUITER} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/companies" element={<CompaniesPage />} />
            <Route path="/recruiter/companies/create" element={<CreateCompanyPage />} />
            <Route path="/recruiter/companies/:companyId" element={<CompanyDetailsPage />} />
            <Route path="/recruiter/companies/:companyId/edit" element={<EditCompanyPage />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
            <Route path="/recruiter/jobs/create" element={<CreateJobPage />} />
            <Route path="/recruiter/jobs/:jobId" element={<JobDetailsRecruiterPage />} />
            <Route path="/recruiter/jobs/:jobId/edit" element={<EditJobPage />} />
            <Route path="/recruiter/applications" element={<RecruiterApplicantsPage />} />
            <Route path="/recruiter/applications/:applicationId" element={<RecruiterApplicationDetailsPage />} />
            <Route path="/recruiter/applicants" element={<RecruiterApplicantsPage />} />
            <Route path="/recruiter/applicants/:applicationId" element={<RecruiterApplicationDetailsPage />} />
            <Route path="/recruiter/interviews" element={<RecruiterInterviewsPage />} />
            <Route path="/recruiter/interviews/:interviewId" element={<RecruiterInterviewDetailsPage />} />
            <Route path="/recruiter/notifications" element={<NotificationsPage />} />
            <Route path="/recruiter/profile" element={<ProfilePage />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<RoleRoute allowedRole={ROLES.ADMIN} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/interviews" element={<AdminInterviewsPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
