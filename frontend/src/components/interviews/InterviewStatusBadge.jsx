import React from "react";
import { cn } from "../../utils/cn";

export const getInterviewStatusConfig = (status) => {
  const normalized = (status || "").toLowerCase().trim();

  switch (normalized) {
    case "scheduled":
      return {
        label: "Scheduled",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
        description: "Interview session is confirmed and active",
      };
    case "rescheduled":
      return {
        label: "Rescheduled",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
        description: "Date, time, or details have been updated",
      };
    case "completed":
      return {
        label: "Completed",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
        description: "Interview has been successfully conducted",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        dotColor: "bg-rose-500",
        description: "Interview was called off or cancelled",
      };
    default:
      return {
        label: status || "Unknown",
        badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
        dotColor: "bg-slate-400",
        description: "Status unconfirmed",
      };
  }
};

export const InterviewStatusBadge = ({
  status,
  size = "md",
  className = "",
  showDot = true,
}) => {
  const config = getInterviewStatusConfig(status);

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  const isLive = status === "scheduled" || status === "rescheduled";

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border tracking-wide uppercase shadow-2xs transition-colors",
        config.badgeBg,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            dotSizes[size],
            config.dotColor,
            isLive ? "animate-pulse" : ""
          )}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default InterviewStatusBadge;
