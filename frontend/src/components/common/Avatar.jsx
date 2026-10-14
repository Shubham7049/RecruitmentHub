import React, { useState } from "react";
import { cn } from "../../utils/cn";

export const Avatar = ({
  src,
  alt = "User Avatar",
  name = "User",
  size = "md",
  className,
  ...props
}) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name || "User"
  )}`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full bg-slate-100 font-semibold text-slate-700 overflow-hidden ring-2 ring-white select-none",
        sizes[size],
        className
      )}
      {...props}
    >
      {!imgError && (src || fallbackUrl) ? (
        <img
          src={src || fallbackUrl}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
