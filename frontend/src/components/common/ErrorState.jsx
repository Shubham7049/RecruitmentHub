import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export const ErrorState = ({
  title = "Something went wrong",
  message = "An error occurred while fetching data. Please try again.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200/80 bg-rose-50/50",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4 ring-8 ring-rose-50">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="text-sm text-rose-700/80 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={RefreshCw}
          className="border-rose-300 text-rose-800 hover:bg-rose-100/60"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
