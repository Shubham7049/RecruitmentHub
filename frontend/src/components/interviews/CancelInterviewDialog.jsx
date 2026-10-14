import React from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, XCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useCancelInterviewMutation } from "../../store/api/interviewApi";

export const CancelInterviewDialog = ({
  isOpen,
  onClose,
  interview,
  onSuccess,
}) => {
  const [cancelInterview, { isLoading }] = useCancelInterviewMutation();

  if (!interview) return null;

  const app = typeof interview.applicationId === "object" ? interview.applicationId : {};
  const candidate = typeof app.userId === "object" ? app.userId : {};
  const job = typeof app.jobId === "object" ? app.jobId : {};

  const handleConfirmCancel = async () => {
    try {
      await cancelInterview(interview._id).unwrap();
      toast.success(
        `Interview round "${interview.round}" has been cancelled. Candidate notified.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to cancel interview:", err);
      toast.error(err?.data?.message || "Failed to cancel interview. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title="Cancel Interview Session"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Interview
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmCancel}
            isLoading={isLoading}
            disabled={isLoading}
            leftIcon={XCircle}
          >
            Confirm Cancellation
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">
              Are you sure you want to cancel this interview?
            </p>
            <p className="leading-relaxed">
              This will transition the interview session status to{" "}
              <strong>&ldquo;Cancelled&rdquo;</strong> for audit preservation. An in-app cancellation notification will be sent to the candidate immediately.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs space-y-1 text-slate-700">
          <p>
            <span className="font-semibold text-slate-500">Candidate: </span>
            <span className="font-bold text-slate-900">{candidate.fullname || "Applicant"}</span>
          </p>
          <p>
            <span className="font-semibold text-slate-500">Role: </span>
            <span className="font-bold text-slate-900">{job.title || "Job Position"}</span>
          </p>
          <p>
            <span className="font-semibold text-slate-500">Round: </span>
            <span className="font-bold text-slate-900">{interview.round}</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CancelInterviewDialog;
