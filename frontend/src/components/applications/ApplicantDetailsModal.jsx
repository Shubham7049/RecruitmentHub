import React, { useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { StatusUpdateSelect } from "./StatusUpdateSelect";
import { ScheduleInterviewModal } from "../interviews/ScheduleInterviewModal";
import { formatDate } from "../../utils/formatters";

export const ApplicantDetailsModal = ({
  isOpen,
  onClose,
  application,
  jobTitle,
}) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  if (!application) return null;

  const { _id, userId, status, createdAt, updatedAt, jobId } = application;
  const applicant = typeof userId === "object" ? userId : {};
  const fullname = applicant.fullname || "Anonymous Candidate";
  const email = applicant.email || "";
  const phone = applicant.phone || "";
  const avatar = applicant.avatar || "";

  const job = typeof jobId === "object" ? jobId : null;
  const resolvedJobTitle = jobTitle || job?.title || "Job Position";
  const companyName = job?.companyId?.name || "Registered Organization";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="Candidate Application Review"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="primary"
            size="sm"
            leftIcon={Calendar}
            onClick={() => setIsScheduleModalOpen(true)}
            className="text-xs"
          >
            Schedule Interview
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Review
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pt-1">
        {/* Candidate Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <Avatar src={avatar} name={fullname} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {fullname}
            </h3>
            <div className="mt-1 space-y-1 text-xs text-slate-600">
              {email && (
                <div className="flex items-center gap-1.5 truncate">
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
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:underline">
                    {phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applied Role & Metadata */}
        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Application Context
          </p>

          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Position:</span>
              <span className="font-semibold text-slate-900 text-right">{resolvedJobTitle}</span>
            </div>

            {companyName && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">Company:</span>
                <span className="text-xs text-slate-700 text-right">{companyName}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Applied Date:</span>
              <span className="text-xs text-slate-700 text-right">
                {createdAt ? formatDate(createdAt) : "Recently"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Current Status:</span>
              <ApplicationStatusBadge status={status} size="sm" />
            </div>
          </div>
        </div>

        {/* Status Transition Control */}
        <div className="rounded-xl border border-primary-200/80 bg-primary-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary-950 uppercase tracking-wider">
                Manage Pipeline Stage
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Update candidate status to reflect their progress in screening.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <StatusUpdateSelect
              applicationId={_id}
              currentStatus={status}
              size="md"
              className="w-full"
            />
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <Bell className="h-3.5 w-3.5 text-primary-600 shrink-0" />
            <span>Changing status sends an automatic in-app notification to the candidate.</span>
          </p>
        </div>
      </div>

      {isScheduleModalOpen && (
        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          applicationId={_id}
          candidateName={fullname}
          jobTitle={resolvedJobTitle}
        />
      )}
    </Modal>
  );
};

export default ApplicantDetailsModal;
