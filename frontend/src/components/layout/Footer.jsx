import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Globe, Mail, Code2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">
                Recruitment<span className="text-primary-600">Hub</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enterprise-grade recruitment portal connecting top talent with industry-leading organizations.
            </p>
            <div className="flex items-center space-x-4 text-slate-400">
              <a href="#" className="hover:text-slate-600 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-slate-600 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-slate-600 transition-colors">
                <Code2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              For Candidates
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/jobs" className="hover:text-primary-600 transition-colors">
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-600 transition-colors">
                  Create Candidate Profile
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary-600 transition-colors">
                  Interview Preparation
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              For Employers
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/register" className="hover:text-primary-600 transition-colors">
                  Post Open Roles
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-600 transition-colors">
                  Register Company
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-primary-600 transition-colors">
                  Candidate Pipeline
                </a>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <span className="text-slate-500">Node.js / Express</span>
              </li>
              <li>
                <span className="text-slate-500">MongoDB / Mongoose</span>
              </li>
              <li>
                <span className="text-slate-500">React / Redux Toolkit / RTK Query</span>
              </li>
              <li>
                <span className="text-slate-500">Role-Based Access Control (RBAC)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Recruitment Hub. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Production Hardened & Fully Audited Architecture.</p>
        </div>
      </div>
    </footer>
  );
};
