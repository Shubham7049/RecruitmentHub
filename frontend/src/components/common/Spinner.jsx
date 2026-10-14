import React from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

export const Spinner = ({ size = "md", className, label }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn(
          "animate-spin text-primary-600",
          sizes[size],
          className
        )}
      />
      {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
    </div>
  );
};
