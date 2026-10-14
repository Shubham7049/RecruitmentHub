import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateCompanyMutation } from "../../store/api/companyApi";
import { CompanyForm } from "../../components/companies/CompanyForm";
import { Card, CardContent } from "../../components/common/Card";

export const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const [createCompany, { isLoading }] = useCreateCompanyMutation();
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (formData) => {
    setServerError(null);

    // Clean empty optional strings
    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      about: formData.about?.trim() || "",
      website: formData.website?.trim() || "",
      logo: formData.logo?.trim() || "",
    };

    try {
      const response = await createCompany(payload).unwrap();
      toast.success("Company registered successfully!");
      const newId = response.data?._id || response._id;
      if (newId) {
        navigate(`/recruiter/companies/${newId}`);
      } else {
        navigate("/recruiter/companies");
      }
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to register company. Please verify the details and try again.";
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/recruiter/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Companies</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 shadow-xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Register New Company
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a verified organizational profile to post job opportunities and attract candidates.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <CompanyForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitText="Register Company"
            onCancel={() => navigate("/recruiter/companies")}
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCompanyPage;
