import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatDate, formatSalary } from "../../utils/formatters";

export const RecruiterJobCard = ({ job, onDelete }) => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  if (!job) return null;

  const {
    _id,
    title,
    location,
    salary,
    experience,
    requirements = [],
    companyId,
    createdAt,
  } = job;

  const company = typeof companyId === "object" ? companyId : null;
  const companyName = company?.name || "Registered Company";
  const companyLogo = company?.logo;

  return (
    <Card className="flex flex-col justify-between border-slate-200/90 hover:border-primary-300/80 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-5 sm:p-6">
        {/* Top Company Info & Job Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Company Avatar / Logo */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-700 shadow-2xs overflow-hidden">
              {companyLogo && !logoError ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className="h-full w-full object-contain p-1"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-700 font-bold text-sm">
                  {companyName ? companyName.slice(0, 2).toUpperCase() : <Building2 className="h-5 w-5" />}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/recruiter/jobs/${_id}`}
                className="text-base font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate block"
                title={title}
              >
                {title}
              </Link>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {companyName}
              </p>
            </div>
          </div>

          <Badge variant="primary" size="sm" className="shrink-0 font-medium">
            Active
          </Badge>
        </div>

        {/* Metadata Chips / Key Details */}
        <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </span>
          <span>•</span>
          <span className="font-semibold text-emerald-600">
            {formatSalary(salary)}
          </span>
          <span>•</span>
          <span>
            {experience === 0 ? "Fresher / 0 yrs" : `${experience} yrs exp`}
          </span>
        </div>

        {/* Requirements Pills */}
        {requirements.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {requirements.slice(0, 3).map((req, i) => (
              <span
                key={i}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 truncate max-w-[150px]"
              >
                {req}
              </span>
            ))}
            {requirements.length > 3 && (
              <span className="text-[11px] text-slate-400 self-center">
                +{requirements.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Posted Date */}
        {createdAt && (
          <p className="mt-3.5 text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Posted on {formatDate(createdAt)}
          </p>
        )}
      </CardContent>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 rounded-b-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/recruiter/jobs/${_id}`)}
          rightIcon={ArrowRight}
          className="text-xs font-semibold text-primary-700 hover:bg-primary-50 px-2.5"
        >
          View Job
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/recruiter/jobs/${_id}/edit`)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-primary-600 hover:bg-slate-100"
            title="Edit job"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              title="Delete job"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RecruiterJobCard;
