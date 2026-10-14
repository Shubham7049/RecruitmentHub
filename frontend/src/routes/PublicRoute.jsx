import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_ROLE_REDIRECTS } from "../constants/roles";
import { Spinner } from "../components/common/Spinner";

export const PublicRoute = () => {
  const { isAuthenticated, role, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="md" label="Checking session..." />
      </div>
    );
  }

  if (isAuthenticated && role) {
    const target = DEFAULT_ROLE_REDIRECTS[role] || "/";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
