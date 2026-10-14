import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ArrowRight,
  User,
} from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { Avatar } from "../common/Avatar";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { StatusUpdateSelect } from "./StatusUpdateSelect";
import { Button } from "../common/Button";
import { formatDate } from "../../utils/formatters";

export const ApplicantCard = ({ application, jobTitle, onViewDetails }) => {
  if (!application) return null;

  const { _id, userId, status, createdAt, jobId } = application;
  const applicant = typeof userId === "object" ? userId : {};
  const fullname = applicant.fullname || "Anonymous Candidate";
  const email = applicant.email || "";
  const phone = applicant.phone || "";
  const avatar = applicant.avatar || "";

  const resolvedJobTitle =
    jobTitle ||
    (typeof jobId === "object" ? jobId?.title : "Software Opening");

  return (
    <Card className="border-slate-200/90 hover:border-primary-300/80 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-5">
        {/* Top Row: Avatar, Name & Current Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={avatar} name={fullname} size="md" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {fullname}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{resolvedJobTitle}</span>
              </p>
            </div>
          </div>

          <ApplicationStatusBadge status={status} size="sm" />
        </div>

        {/* Contact Details */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
          {email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="text-primary-600 hover:underline truncate"
              >
                {email}
              </a>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <a
                href={`tel:${phone}`}
                className="text-slate-700 hover:underline"
              >
                {phone}
              </a>
            </div>
          )}

          {createdAt && (
            <div className="flex items-center gap-2 text-slate-400 pt-0.5 text-[11px]">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>Applied on {formatDate(createdAt)}</span>
            </div>
          )}
        </div>

        {/* Action Row: Status Selector & View Button */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Update:
            </span>
            <StatusUpdateSelect
              applicationId={_id}
              currentStatus={status}
              size="sm"
            />
          </div>

          {onViewDetails ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(application)}
              rightIcon={ArrowRight}
              className="text-xs font-semibold text-primary-700 hover:bg-primary-50 px-2"
            >
              Details
            </Button>
          ) : (
            <Link
              to={`/recruiter/applications/${_id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
            >
              <span>Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantCard;
