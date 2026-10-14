import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_ROLE_REDIRECTS } from "../constants/roles";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  const homePath = isAuthenticated && role ? DEFAULT_ROLE_REDIRECTS[role] : "/";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-6 ring-8 ring-rose-50">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Access Restricted (403)
      </h1>
      <p className="mt-3 text-base text-slate-600 max-w-md">
        You do not have permission to view this resource with your current role (
        <span className="font-semibold text-slate-800 capitalize">{role || "Guest"}</span>
        ). Role-Based Access Control protects this route.
      </p>
      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={ArrowLeft}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(homePath)}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
