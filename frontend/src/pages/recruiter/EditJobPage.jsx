import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Briefcase, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetJobByIdQuery,
  useUpdateJobMutation,
} from "../../store/api/jobApi";
import { useAuth } from "../../hooks/useAuth";
import { JobForm } from "../../components/jobs/JobForm";
import { Card, CardContent } from "../../components/common/Card";
import { Skeleton } from "../../components/common/Skeleton";
import { Button } from "../../components/common/Button";

export const EditJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [serverError, setServerError] = useState(null);

  const {
    data: jobResponse,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useGetJobByIdQuery(jobId);

  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const job = jobResponse?.data;

  // Ownership verification check
  const creatorId =
    typeof job?.createdBy === "object"
      ? job?.createdBy?._id
      : job?.createdBy;
  const isOwner = Boolean(user?._id && creatorId && user._id.toString() === creatorId.toString());

  const handleSubmit = async (payload) => {
    setServerError(null);

    try {
      await updateJob({ id: jobId, ...payload }).unwrap();
      toast.success("Job posting updated successfully!");
      navigate(`/recruiter/jobs/${jobId}`);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to update job posting. Please verify the information and try again.";
      setServerError(message);
      toast.error(message);
    }
  };

  if (isJobLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Card className="p-8 border-slate-200">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-rose-200 bg-rose-50/60 p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900">Job Not Found</h2>
          <p className="text-xs text-rose-700 mt-1">
            The job posting you are attempting to edit does not exist or has been removed.
          </p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/recruiter/jobs")}
              leftIcon={ArrowLeft}
            >
              Back to My Jobs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Security guard: Not owner
  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-amber-200 bg-amber-50/70 p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-amber-900">Access Denied</h2>
          <p className="text-xs text-amber-800 mt-1 max-w-sm mx-auto leading-relaxed">
            You are not authorized to modify this job posting. Only the recruiter who created this job can make updates.
          </p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/recruiter/jobs/${jobId}`)}
              leftIcon={ArrowLeft}
            >
              Return to Job Details
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div>
        <Link
          to={`/recruiter/jobs/${jobId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Job Details</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 shadow-xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Edit {job.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update role requirements, compensation package, or job responsibilities.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <JobForm
            initialData={{
              title: job.title,
              companyId: job.companyId,
              location: job.location,
              salary: job.salary,
              experience: job.experience,
              description: job.description,
              requirements: job.requirements,
            }}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            submitText="Save Changes"
            onCancel={() => navigate(`/recruiter/jobs/${jobId}`)}
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditJobPage;
