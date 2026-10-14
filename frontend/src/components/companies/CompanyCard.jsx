import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  Edit2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatDate } from "../../utils/formatters";

export const CompanyCard = ({
  company,
  jobCount = 0,
  onDelete,
  isOwner = true,
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  if (!company) return null;

  const { _id, name, location, website, about, logo, createdAt } = company;

  return (
    <Card className="flex flex-col justify-between border-slate-200/90 hover:border-primary-300/80 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Logo / Avatar fallback */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-700 shadow-sm overflow-hidden group-hover:border-primary-100 transition-colors">
              {logo && !imageError ? (
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="h-full w-full object-contain p-1"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-700 font-bold text-base">
                  {name ? name.slice(0, 2).toUpperCase() : <Building2 className="h-6 w-6 text-primary-500" />}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/recruiter/companies/${_id}`}
                className="text-base font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate block"
                title={name}
              >
                {name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{location || "Location not specified"}</span>
              </div>
            </div>
          </div>

          {/* Job Count Pill */}
          <Badge
            variant={jobCount > 0 ? "primary" : "neutral"}
            size="sm"
            className="shrink-0 font-medium"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            {jobCount} {jobCount === 1 ? "Job" : "Jobs"}
          </Badge>
        </div>

        {/* Website link */}
        {website && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-primary-600">
            <Globe className="h-3.5 w-3.5 shrink-0 text-primary-500" />
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline truncate inline-flex items-center gap-1"
              title={website}
            >
              <span className="truncate">{website.replace(/^https?:\/\/(www\.)?/, "")}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}

        {/* About Snippet */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {about || "No company description provided yet."}
        </p>

        {/* Registered Date */}
        {createdAt && (
          <p className="mt-3 text-[11px] text-slate-400">
            Added on {formatDate(createdAt)}
          </p>
        )}
      </CardContent>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3 rounded-b-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/recruiter/companies/${_id}`)}
          rightIcon={ArrowRight}
          className="text-xs font-semibold text-primary-700 hover:bg-primary-50 px-2.5"
        >
          View Details
        </Button>

        {isOwner && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/recruiter/companies/${_id}/edit`)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-primary-600 hover:bg-slate-100"
              title="Edit company"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(company)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                title="Delete company"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CompanyCard;
