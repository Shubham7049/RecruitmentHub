import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  Building2,
  Briefcase,
  User,
  ExternalLink,
  Edit2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { Avatar } from "../common/Avatar";
import { InterviewStatusBadge } from "./InterviewStatusBadge";
import { formatDateTime } from "../../utils/formatters";

export const InterviewCard = ({
  interview,
  role = "student",
  onEdit,
  onCancel,
  detailLink,
}) => {
  if (!interview) return null;

  const {
    _id,
    applicationId,
    round,
    scheduledAt,
    meetingUrl,
    interviewer,
    status,
  } = interview;

  const app = typeof applicationId === "object" ? applicationId : {};
  const candidate = typeof app.userId === "object" ? app.userId : {};
  const job = typeof app.jobId === "object" ? app.jobId : {};
  const company = typeof job.companyId === "object" ? job.companyId : {};
  const interviewerUser = typeof interviewer === "object" ? interviewer : {};

  const isRecruiter = role === "recruiter";
  const isActionable = isRecruiter && status !== "completed" && status !== "cancelled";

  const resolvedDetailLink =
    detailLink || (isRecruiter ? `/recruiter/interviews/${_id}` : `/student/interviews/${_id}`);

  return (
    <Card className="border border-slate-200/90 hover:border-primary-300 transition-all duration-200 shadow-xs hover:shadow-md bg-white">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header: Company/Job & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-md">
                {round || "Interview Session"}
              </span>
              <InterviewStatusBadge status={status} size="sm" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {job.title || "Job Position"}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{company.name || "Hiring Company"}</span>
              {job.location && (
                <>
                  <span>•</span>
                  <span>{job.location}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Schedule & People Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 border-t border-slate-100">
          {/* Time & Date */}
          <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-2.5 border border-slate-100/80">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled For</p>
              <p className="font-bold text-slate-900 truncate mt-0.5">
                {formatDateTime(scheduledAt) || "Time pending"}
              </p>
            </div>
          </div>

          {/* People: Candidate on Recruiter view, Interviewer on Candidate view */}
          <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-2.5 border border-slate-100/80">
            <Avatar
              src={isRecruiter ? candidate.avatar : interviewerUser.avatar}
              name={isRecruiter ? candidate.fullname : interviewerUser.fullname}
              size="sm"
              className="h-7 w-7 text-xs shrink-0 mt-0.5"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isRecruiter ? "Candidate" : "Interviewer"}
              </p>
              <p className="font-bold text-slate-900 truncate mt-0.5">
                {isRecruiter
                  ? candidate.fullname || "Applicant"
                  : interviewerUser.fullname || "Assigned Interviewer"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Join Meeting Action */}
          <div>
            {meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={Video}
                  rightIcon={ExternalLink}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  Join Meeting
                </Button>
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                <span>No meeting link attached</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isActionable && (
              <>
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={Edit2}
                    onClick={() => onEdit(interview)}
                    className="text-xs text-slate-700 hover:text-slate-900"
                  >
                    Reschedule
                  </Button>
                )}
                {onCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={XCircle}
                    onClick={() => onCancel(interview)}
                    className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}

            <Link to={resolvedDetailLink}>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={ArrowUpRight}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewCard;
