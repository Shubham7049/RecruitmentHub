import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-6 ring-8 ring-slate-50">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Page Not Found (404)
      </h1>
      <p className="mt-3 text-base text-slate-600 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
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
          onClick={() => navigate("/")}
          leftIcon={Home}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
