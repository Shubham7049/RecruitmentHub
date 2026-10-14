import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Calendar, Clock, Video, FileText, User, AlertCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useScheduleInterviewMutation } from "../../store/api/interviewApi";

const scheduleSchema = z.object({
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
});

export const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  applicationId,
  candidateName = "Candidate",
  jobTitle = "Applied Role",
  onSuccess,
}) => {
  const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
  const [apiError, setApiError] = useState(null);

  // Minimum allowed date/time: 5 minutes from now
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      round: "Technical Round 1",
      scheduledAt: "",
      meetingUrl: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setApiError(null);
      const payload = {
        applicationId,
        round: values.round.trim(),
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        meetingUrl: values.meetingUrl?.trim() || "",
      };

      const res = await scheduleInterview(payload).unwrap();
      toast.success(
        `Interview "${payload.round}" scheduled successfully! Candidate has been notified.`
      );
      reset();
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      console.error("Failed to schedule interview:", err);
      const errMsg =
        err?.data?.message || "Failed to schedule interview. Please try again.";
      setApiError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleModalClose = () => {
    setApiError(null);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidth="max-w-lg"
      title="Schedule Candidate Interview"
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
            Confirm & Schedule
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Context Information Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Candidate:</span>
            <span className="font-bold text-slate-900">{candidateName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Applied Role:</span>
            <span className="font-bold text-slate-900">{jobTitle}</span>
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
            placeholder="e.g. Technical Round 1, System Design, HR Discussion"
            {...register("round")}
            error={errors.round?.message}
          />
        </div>

        {/* Date & Time */}
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
            placeholder="https://meet.google.com/xyz-abcd-efg or Zoom link"
            {...register("meetingUrl")}
            error={errors.meetingUrl?.message}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Google Meet, Zoom, Microsoft Teams, or custom video platform URL.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-[11px] text-blue-800 leading-relaxed">
          💡 <strong>Automatic Notification:</strong> Upon confirmation, the application status will automatically advance to <strong>&ldquo;Interview&rdquo;</strong> and an in-app notification will be delivered to the candidate.
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleInterviewModal;
