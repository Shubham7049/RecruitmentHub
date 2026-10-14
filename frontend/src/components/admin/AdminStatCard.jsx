import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { cn } from "../../utils/cn";

export const AdminStatCard = ({
  label,
  value,
  icon: Icon,
  subtitle,
  colorScheme = "primary",
  linkTo,
}) => {
  const colorStyles = {
    primary: "bg-primary-50 text-primary-600 border-primary-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const activeColor = colorStyles[colorScheme] || colorStyles.primary;

  const content = (
    <Card className="hover:border-slate-300 transition-all duration-150 h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {typeof value === "number" ? value.toLocaleString() : value ?? 0}
            </p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              activeColor
            )}
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>
        </div>

        {(subtitle || linkTo) && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{subtitle}</span>
            {linkTo && (
              <span className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700">
                View <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block transition-transform active:scale-[0.99]">
        {content}
      </Link>
    );
  }

  return content;
};

export default AdminStatCard;
