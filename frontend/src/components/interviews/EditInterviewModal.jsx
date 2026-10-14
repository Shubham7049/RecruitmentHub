import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Calendar, Clock, Video, FileText, AlertCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useUpdateInterviewMutation } from "../../store/api/interviewApi";

const editSchema = z.object({
  round: z
    .string()
    .min(2, "Interview round name must be at least 2 characters")
    .max(100, "Interview round name cannot exceed 100 characters"),
  scheduledAt: z
    .string()
    .min(1, "Scheduled date and time is required")
    .refine((val) => {
      const parsed = new Date(val);
      return !isNaN(parsed.getTime()) && parsed > new Date();
    }, "Interview scheduled date and time must be set to a future date"),
  meetingUrl: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Please provide a valid URL starting with http:// or https://"),
  status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]),
});

export const EditInterviewModal = ({
  isOpen,
  onClose,
  interview,
  onSuccess,
}) => {
  const [updateInterview, { isLoading }] = useUpdateInterviewMutation();
  const [apiError, setApiError] = useState(null);

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      round: "",
      scheduledAt: "",
      meetingUrl: "",
      status: "scheduled",
    },
  });

  useEffect(() => {
    if (interview) {
      let localDateTime = "";
      if (interview.scheduledAt) {
        const d = new Date(interview.scheduledAt);
        // Format to YYYY-MM-DDTHH:mm
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset)
          .toISOString()
          .slice(0, 16);
        localDateTime = localISOTime;
      }

      reset({
        round: interview.round || "",
        scheduledAt: localDateTime,
        meetingUrl: interview.meetingUrl || "",
        status: interview.status || "scheduled",
      });
    }
  }, [interview, reset]);

  if (!interview) return null;

  const app = typeof interview.applicationId === "object" ? interview.applicationId : {};
  const candidate = typeof app.userId === "object" ? app.userId : {};
  const job = typeof app.jobId === "object" ? app.jobId : {};

  const onSubmit = async (values) => {
    try {
      setApiError(null);
      const payload = {
        id: interview._id,
        round: values.round.trim(),
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        meetingUrl: values.meetingUrl?.trim() || "",
        status: values.status,
      };

      const res = await updateInterview(payload).unwrap();
      toast.success("Interview details updated successfully! Candidate has been notified.");
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      console.error("Failed to update interview:", err);
      const errMsg =
        err?.data?.message || "Failed to update interview details.";
      setApiError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleModalClose = () => {
    setApiError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidth="max-w-lg"
      title="Reschedule / Edit Interview"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleModalClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Context Summary */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Candidate:</span>
            <span className="font-bold text-slate-900">{candidate.fullname || "Applicant"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Applied Role:</span>
            <span className="font-bold text-slate-900">{job.title || "Job Position"}</span>
          </div>
        </div>

        {apiError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Round Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Interview Round Name *
          </label>
          <Input
            placeholder="e.g. Technical Round 2, HR Discussion"
            {...register("round")}
            error={errors.round?.message}
          />
        </div>

        {/* Scheduled Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Scheduled Date & Time * (Local Time)
          </label>
          <input
            type="datetime-local"
            min={minDateTime}
            {...register("scheduledAt")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {errors.scheduledAt && (
            <p className="text-xs text-rose-600 font-medium mt-1">
              {errors.scheduledAt.message}
            </p>
          )}
        </div>

        {/* Meeting URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Meeting Link / URL (Optional)
          </label>
          <Input
            type="url"
            placeholder="https://meet.google.com/xyz-abcd-efg"
            {...register("meetingUrl")}
            error={errors.meetingUrl?.message}
          />
        </div>

        {/* Interview Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Interview Status *
          </label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option value="scheduled">Scheduled</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="text-xs text-rose-600 font-medium mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-[11px] text-slate-500 leading-relaxed">
          ℹ️ Updating the scheduled time or round details will automatically notify the candidate with the updated information.
        </div>
      </form>
    </Modal>
  );
};

export default EditInterviewModal;
