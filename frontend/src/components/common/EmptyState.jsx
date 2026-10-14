import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../utils/cn";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No data available",
  description = "There are currently no items to display.",
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-200 bg-white",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 ring-8 ring-slate-50/50">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
