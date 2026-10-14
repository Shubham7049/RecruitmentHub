import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const RoleRoute = ({ allowedRole, allowedRoles = [] }) => {
  const { role, isAuthenticated } = useAuth();

  const validRoles = allowedRole ? [allowedRole] : allowedRoles;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!validRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
