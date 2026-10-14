import React from "react";
import { cn } from "../../utils/cn";

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-sm transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-5 pb-4 border-b border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn(
        "text-base sm:text-lg font-semibold leading-tight tracking-tight text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-xs sm:text-sm text-slate-500", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-5 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
