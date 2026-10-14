import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, ArrowRight, User } from "lucide-react";
import { Button } from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import { DEFAULT_ROLE_REDIRECTS } from "../../constants/roles";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useAuth();

  const dashboardPath = role ? DEFAULT_ROLE_REDIRECTS[role] : "/login";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-600/20 group-hover:bg-primary-700 transition-colors">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Recruitment<span className="text-primary-600">Hub</span>
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            to="/jobs"
            className="hover:text-primary-600 transition-colors"
          >
            Explore Jobs
          </Link>
          <a
            href="#features"
            className="hover:text-primary-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-primary-600 transition-colors"
          >
            How it Works
          </a>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(dashboardPath)}
              rightIcon={ArrowRight}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
