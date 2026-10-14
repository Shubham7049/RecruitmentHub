import React from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Banknote,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { formatSalary } from "../../utils/formatters";

export const ApplyConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  job,
  isApplying = false,
}) => {
  if (!job) return null;

  const company = typeof job.companyId === "object" ? job.companyId : null;
  const companyName = company?.name || "Verified Organization";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Job Application"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isApplying}
            leftIcon={FileCheck}
          >
            Confirm & Submit
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">
        {/* Job Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-primary-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                {job.title}
              </h4>
              <p className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{companyName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60 text-xs font-medium text-slate-600">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{job.location}</span>
              </div>
            )}
            {job.salary !== undefined && (
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Banknote className="h-3.5 w-3.5" />
                <span>{formatSalary(job.salary)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Disclosure Note */}
        <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-900 uppercase tracking-wide">
            <FileCheck className="h-4 w-4 text-primary-600" />
            Candidate Credentials Disclosure
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            By submitting this application, your verified candidate profile (including contact info, technical skills, education history, and attached resume) will be transmitted directly to the hiring recruiter.
          </p>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Applications cannot be retracted once reviewed by the employer.
        </p>
      </div>
    </Modal>
  );
};

export default ApplyConfirmModal;
