import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  Plus,
  X,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Textarea } from "../common/Textarea";
import { Button } from "../common/Button";
import { Card, CardContent } from "../common/Card";
import { useGetMyCompaniesQuery } from "../../store/api/companyApi";

const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title cannot exceed 100 characters"),
  companyId: z
    .string()
    .trim()
    .min(1, "Please select an authorized company"),
  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),
  salary: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Please enter a valid non-negative salary (e.g. 12 for ₹12 LPA)",
    }),
  experience: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Please enter non-negative years of experience (e.g. 0 for Fresher, 2, 4)",
    }),
  description: z
    .string()
    .trim()
    .min(10, "Job description must be at least 10 characters")
    .max(3000, "Description cannot exceed 3000 characters"),
});

export const JobForm = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitText = "Post Job",
  onCancel,
  serverError = null,
}) => {
  const navigate = useNavigate();
  const { data: companiesResponse, isLoading: isCompaniesLoading } = useGetMyCompaniesQuery();
  const companies = companiesResponse?.data || [];

  // Requirements chip state
  const [requirementsList, setRequirementsList] = useState(
    Array.isArray(initialData?.requirements) ? initialData.requirements : []
  );
  const [currentTag, setCurrentTag] = useState("");
  const [tagError, setTagError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || "",
      companyId:
        typeof initialData?.companyId === "object"
          ? initialData?.companyId?._id || ""
          : initialData?.companyId || "",
      location: initialData?.location || "",
      salary: initialData?.salary !== undefined ? String(initialData.salary) : "",
      experience:
        initialData?.experience !== undefined ? String(initialData.experience) : "",
      description: initialData?.description || "",
    },
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const cId =
        typeof initialData.companyId === "object"
          ? initialData.companyId?._id || ""
          : initialData.companyId || "";
      reset({
        title: initialData.title || "",
        companyId: cId,
        location: initialData.location || "",
        salary: initialData.salary !== undefined ? String(initialData.salary) : "",
        experience:
          initialData.experience !== undefined ? String(initialData.experience) : "",
        description: initialData.description || "",
      });
      if (Array.isArray(initialData.requirements)) {
        setRequirementsList(initialData.requirements);
      }
    }
  }, [initialData, reset]);

  // If user only has 1 company and creating, auto-select it
  useEffect(() => {
    if (companies.length === 1 && !initialData?.companyId) {
      setValue("companyId", companies[0]._id);
    }
  }, [companies, initialData, setValue]);

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const trimmed = currentTag.trim();
    setTagError("");

    if (!trimmed) {
      setTagError("Please enter a skill or requirement name.");
      return;
    }

    if (requirementsList.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      setTagError("This requirement has already been added.");
      return;
    }

    if (trimmed.length > 50) {
      setTagError("Requirement name cannot exceed 50 characters.");
      return;
    }

    setRequirementsList((prev) => [...prev, trimmed]);
    setCurrentTag("");
  };

  const handleRemoveTag = (indexToRemove) => {
    setRequirementsList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onFormSubmit = (data) => {
    if (requirementsList.length === 0) {
      setTagError("Please add at least one requirement or key skill.");
      return;
    }

    const payload = {
      title: data.title.trim(),
      companyId: data.companyId,
      location: data.location.trim(),
      salary: Number(data.salary),
      experience: Number(data.experience),
      description: data.description.trim(),
      requirements: requirementsList,
    };

    onSubmit(payload);
  };

  // If the recruiter has zero registered companies, show guide card
  if (!isCompaniesLoading && companies.length === 0) {
    return (
      <Card className="border-dashed border-amber-300 bg-amber-50/60 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-3 shadow-xs">
          <Building2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Company Profile Required
        </h3>
        <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          You need to register at least one company profile before you can post a job opening. Company details are required to establish trust with applicants.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate("/recruiter/companies/create")}
            leftIcon={Plus}
          >
            Create Company Profile
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const companyOptions = companies.map((comp) => ({
    value: comp._id,
    label: `${comp.name} — ${comp.location || "Headquarters"}`,
  }));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Server Error Banner */}
      {serverError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Failed</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <Input
          label="Job Title"
          placeholder="e.g. Senior Frontend Engineer, DevOps Specialist"
          required
          leftIcon={Briefcase}
          error={errors.title?.message}
          {...register("title")}
        />

        {/* Company & Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Hiring Company"
            required
            placeholder="Select a registered company"
            options={companyOptions}
            error={errors.companyId?.message}
            helperText="Only organizations you own are selectable"
            {...register("companyId")}
          />

          <Input
            label="Work Location"
            placeholder="e.g. Bangalore, KA / Hybrid / Remote"
            required
            leftIcon={MapPin}
            error={errors.location?.message}
            {...register("location")}
          />
        </div>

        {/* Salary & Experience Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Annual Salary (LPA / INR)"
            type="number"
            step="any"
            placeholder="e.g. 12 (for ₹12 LPA)"
            required
            leftIcon={IndianRupee}
            error={errors.salary?.message}
            helperText="Enter figure in Lakhs Per Annum (e.g. 8, 14.5)"
            {...register("salary")}
          />

          <Input
            label="Experience Required (Years)"
            type="number"
            step="1"
            min="0"
            placeholder="e.g. 2 (use 0 for Fresher)"
            required
            leftIcon={Clock}
            error={errors.experience?.message}
            helperText="Enter 0 for fresher positions"
            {...register("experience")}
          />
        </div>

        {/* Requirements Chip Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Job Requirements & Skills <span className="text-rose-500">*</span>
          </label>

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => {
                  setCurrentTag(e.target.value);
                  setTagError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter (e.g. React.js, Node.js, AWS)"
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              leftIcon={Plus}
              className="shrink-0"
            >
              Add
            </Button>
          </div>

          {tagError && (
            <p className="text-xs text-rose-600 font-medium">{tagError}</p>
          )}

          {/* Selected Requirement Pills */}
          <div className="min-h-[42px] rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
            {requirementsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                No requirements added yet. Add at least one skill or qualification.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {requirementsList.map((req, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50/80 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-2xs animate-in fade-in zoom-in-95 duration-150"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="rounded-full p-0.5 text-primary-600 hover:bg-primary-200 hover:text-primary-900 transition-colors"
                      title={`Remove ${req}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Description Textarea */}
        <Textarea
          label="Job Description"
          placeholder="Outline the core responsibilities, team structure, tech stack, and benefits..."
          rows={6}
          required
          error={errors.description?.message}
          helperText="Maximum 3000 characters"
          {...register("description")}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading || isSubmitting}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
