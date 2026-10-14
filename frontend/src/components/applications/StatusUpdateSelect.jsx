import React, { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUpdateApplicationStatusMutation } from "../../store/api/applicationApi";
import { cn } from "../../utils/cn";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied (Under Review)", bg: "bg-blue-50 text-blue-700" },
  { value: "shortlisted", label: "Shortlisted", bg: "bg-amber-50 text-amber-700" },
  { value: "interview", label: "Interview Scheduled", bg: "bg-purple-50 text-purple-700" },
  { value: "hired", label: "Hired / Offer", bg: "bg-emerald-50 text-emerald-700" },
  { value: "rejected", label: "Not Selected", bg: "bg-rose-50 text-rose-700" },
];

export const StatusUpdateSelect = ({
  applicationId,
  currentStatus = "applied",
  onSuccess,
  className = "",
  disabled = false,
  size = "sm",
}) => {
  const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();
  const [status, setStatus] = useState(currentStatus);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === status) return;

    try {
      setStatus(newStatus);
      await updateStatus({ id: applicationId, status: newStatus }).unwrap();
      toast.success(`Status updated to '${newStatus}'`);
      if (onSuccess) onSuccess(newStatus);
    } catch (err) {
      setStatus(currentStatus); // revert on failure
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to update application status. Please try again.";
      toast.error(errorMsg);
    }
  };

  const sizeClasses = {
    sm: "py-1 pl-2.5 pr-7 text-xs",
    md: "py-1.5 pl-3 pr-8 text-sm",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={status}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className={cn(
          "appearance-none rounded-lg font-semibold border border-slate-300 bg-white text-slate-800 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60",
          sizeClasses[size]
        )}
        title="Update candidate application status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-600" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </div>
    </div>
  );
};

export default StatusUpdateSelect;
