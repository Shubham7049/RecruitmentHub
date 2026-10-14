import React from "react";
import { getApplicationStatusConfig } from "../../utils/formatters";
import { cn } from "../../utils/cn";

export const ApplicationStatusBadge = ({
  status,
  size = "md",
  className = "",
  showDot = true,
}) => {
  const config = getApplicationStatusConfig(status);

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
            config.label === "Interview Scheduled" ? "animate-pulse" : ""
          )}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default ApplicationStatusBadge;
