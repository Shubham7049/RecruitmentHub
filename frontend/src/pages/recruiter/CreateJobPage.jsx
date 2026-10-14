import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateJobMutation } from "../../store/api/jobApi";
import { JobForm } from "../../components/jobs/JobForm";
import { Card, CardContent } from "../../components/common/Card";

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (payload) => {
    setServerError(null);

    try {
      const response = await createJob(payload).unwrap();
      toast.success("Job posted successfully!");
      const newId = response.data?._id || response._id;
      if (newId) {
        navigate(`/recruiter/jobs/${newId}`);
      } else {
        navigate("/recruiter/jobs");
      }
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to post job. Please check all fields and try again.";
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Jobs</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 shadow-xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Post a New Job
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish a new opening under your organization to receive and screen candidate applications.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <JobForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitText="Publish Job"
            onCancel={() => navigate("/recruiter/jobs")}
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJobPage;
