import React from "react";
import { AlertTriangle, AlertCircle, Briefcase } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

export const DeleteCompanyModal = ({
  isOpen,
  onClose,
  onConfirm,
  company,
  isLoading = false,
  error = null,
}) => {
  if (!company) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={null}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete Company
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Delete {company.name}?
            </h3>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete this company profile? This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        {/* Backend Relational Integrity Rejection Alert */}
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Deletion Blocked</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-700 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-500" /> Relational Policy:
          </p>
          <p className="mt-1">
            Companies with active job openings cannot be deleted directly. All associated jobs must be removed first to preserve applicant histories.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCompanyModal;
