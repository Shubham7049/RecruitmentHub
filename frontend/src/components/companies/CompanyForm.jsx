import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  MapPin,
  Globe,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "../common/Input";
import { Textarea } from "../common/Textarea";
import { Button } from "../common/Button";
import { Card, CardContent } from "../common/Card";

const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name cannot exceed 100 characters"),
  location: z
    .string()
    .trim()
    .min(1, "Company location is required")
    .max(100, "Location cannot exceed 100 characters"),
  website: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      "Please enter a valid URL including protocol (e.g. https://example.com)"
    )
    .optional()
    .or(z.literal("")),
  logo: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "Please enter a valid image URL starting with http:// or https://"
    )
    .optional()
    .or(z.literal("")),
  about: z
    .string()
    .trim()
    .max(1500, "About section cannot exceed 1500 characters")
    .optional()
    .or(z.literal("")),
});

export const CompanyForm = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitText = "Save Company",
  onCancel,
  serverError = null,
}) => {
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      website: initialData?.website || "",
      logo: initialData?.logo || "",
      about: initialData?.about || "",
    },
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        name: initialData.name || "",
        location: initialData.location || "",
        website: initialData.website || "",
        logo: initialData.logo || "",
        about: initialData.about || "",
      });
    }
  }, [initialData, reset]);

  const watchedLogo = watch("logo");
  const watchedName = watch("name");

  // Reset logo error whenever the URL changes
  useEffect(() => {
    setLogoPreviewError(false);
  }, [watchedLogo]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Failed</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-5">
        <Input
          label="Company Name"
          placeholder="e.g. Acme Innovations, TechCorp"
          required
          leftIcon={Building2}
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Location / Headquarters"
            placeholder="e.g. Bangalore, KA, India or Remote"
            required
            leftIcon={MapPin}
            error={errors.location?.message}
            {...register("location")}
          />

          <Input
            label="Official Website"
            placeholder="https://example.com"
            leftIcon={Globe}
            error={errors.website?.message}
            helperText="Include http:// or https://"
            {...register("website")}
          />
        </div>

        {/* Company Logo with Live Preview */}
        <div className="space-y-2">
          <Input
            label="Company Logo URL"
            placeholder="https://example.com/images/logo.png"
            leftIcon={ImageIcon}
            error={errors.logo?.message}
            helperText="Direct public image link (PNG, JPG, SVG, or Cloudinary URL)"
            {...register("logo")}
          />

          {watchedLogo && (
            <Card className="border-slate-200 bg-slate-50/50 p-4 mt-2">
              <CardContent className="p-0 flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
                  {!logoPreviewError ? (
                    <img
                      src={watchedLogo}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                      onError={() => setLogoPreviewError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-rose-500 text-[10px] text-center">
                      <AlertCircle className="h-5 w-5 mb-0.5" />
                      Failed
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    {!logoPreviewError ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Logo Preview Valid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <span>Unable to load image from this URL</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-500 truncate mt-0.5">
                    {watchedLogo}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* About Textarea */}
        <Textarea
          label="About the Company"
          placeholder="Describe your company's mission, industry, team size, work culture, and what makes working here exciting..."
          rows={5}
          error={errors.about?.message}
          helperText="Maximum 1500 characters"
          {...register("about")}
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

export default CompanyForm;
