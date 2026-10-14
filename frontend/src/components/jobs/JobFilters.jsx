import React from "react";
import {
  Filter,
  RotateCcw,
  MapPin,
  Briefcase,
  Banknote,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Badge } from "../common/Badge";

const POPULAR_LOCATIONS = [
  "Remote",
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Hyderabad",
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any Experience" },
  { value: "0", label: "Fresher / 0 years" },
  { value: "1", label: "Up to 1 year" },
  { value: "2", label: "Up to 2 years" },
  { value: "3", label: "Up to 3 years" },
  { value: "5", label: "Up to 5 years" },
];

const SALARY_OPTIONS = [
  { value: "", label: "Any Salary" },
  { value: "300000", label: "₹3 LPA and above" },
  { value: "500000", label: "₹5 LPA and above" },
  { value: "800000", label: "₹8 LPA and above" },
  { value: "1200000", label: "₹12 LPA and above" },
  { value: "1500000", label: "₹15 LPA and above" },
  { value: "2000000", label: "₹20 LPA and above" },
];

export const JobFilters = ({
  filters,
  onFilterChange,
  onReset,
  activeFilterCount = 0,
  onCloseMobile,
  className = "",
}) => {
  const handleLocationChipClick = (loc) => {
    if (filters.location?.toLowerCase() === loc.toLowerCase()) {
      onFilterChange("location", "");
    } else {
      onFilterChange("location", loc);
    }
  };

  return (
    <Card className={`border border-slate-200 shadow-sm bg-white ${className}`}>
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary-600" />
          <CardTitle className="text-base font-semibold text-slate-900">
            Filters
          </CardTitle>
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-slate-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}

          {/* Close button for mobile drawer mode */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-6">
        {/* Location Filter */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Location
          </label>
          <Input
            placeholder="e.g. Bangalore, Remote"
            value={filters.location || ""}
            onChange={(e) => onFilterChange("location", e.target.value)}
            leftIcon={MapPin}
            className="text-sm"
          />

          {/* Location Quick Select Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected =
                filters.location?.toLowerCase() === loc.toLowerCase();
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocationChipClick(loc)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-primary-50 text-primary-700 border-primary-300 font-medium"
                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Filter */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Experience Required
          </label>
          <Select
            value={filters.experience || ""}
            onChange={(e) => onFilterChange("experience", e.target.value)}
            options={EXPERIENCE_OPTIONS}
            className="text-sm"
          />
          <p className="text-[11px] text-slate-400">
            Shows jobs requiring up to this level of experience.
          </p>
        </div>

        {/* Minimum Salary Filter */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Minimum Annual Salary
          </label>
          <Select
            value={filters.minSalary || ""}
            onChange={(e) => onFilterChange("minSalary", e.target.value)}
            options={SALARY_OPTIONS}
            className="text-sm"
          />
        </div>

        {/* Mobile Apply Button */}
        {onCloseMobile && (
          <div className="pt-2 sm:hidden">
            <Button
              variant="primary"
              className="w-full"
              onClick={onCloseMobile}
            >
              Show Results
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobFilters;
