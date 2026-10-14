import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Card, CardContent } from "../../components/common/Card";
import { useRegisterMutation } from "../../store/api/authApi";
import { ROLES } from "../../constants/roles";
import { cn } from "../../utils/cn";

const registerSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    password: z
      .string()
      .min(3, "Password must be at least 3 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
    phone: z.string().trim().optional(),
    role: z.enum([ROLES.STUDENT, ROLES.RECRUITER], {
      errorMap: () => ({ message: "Role must be student or recruiter" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerApi, { isLoading }] = useRegisterMutation();

  const queryRole = searchParams.get("role");
  const defaultRole =
    queryRole === ROLES.RECRUITER ? ROLES.RECRUITER : ROLES.STUDENT;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: defaultRole,
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (queryRole === ROLES.RECRUITER || queryRole === ROLES.STUDENT) {
      setValue("role", queryRole);
    }
  }, [queryRole, setValue]);

  const onSubmit = async (data) => {
    try {
      // Backend expects: { fullname, email, username, password, role, phone }
      // We strip client-only confirmPassword
      const { confirmPassword, ...payload } = data;

      const response = await registerApi(payload).unwrap();

      toast.success(
        response?.message || "Account registered successfully! Please sign in."
      );

      navigate("/login");
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Registration failed. Please check your inputs.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Recruitment<span className="text-primary-600">Hub</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h2>
          <p className="text-sm text-slate-500">
            Join thousands of professionals and hiring companies
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-8">
            {/* Role Selection Toggle */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Select Your Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("role", ROLES.STUDENT)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all text-center",
                    selectedRole === ROLES.STUDENT
                      ? "border-primary-600 bg-primary-50/50 text-primary-900 font-semibold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <GraduationCap className="h-5 w-5 mb-1 text-primary-600" />
                  <span className="text-sm">Candidate / Student</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Apply for jobs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("role", ROLES.RECRUITER)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all text-center",
                    selectedRole === ROLES.RECRUITER
                      ? "border-primary-600 bg-primary-50/50 text-primary-900 font-semibold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Building2 className="h-5 w-5 mb-1 text-primary-600" />
                  <span className="text-sm">Hiring Recruiter</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Post jobs & hire
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                leftIcon={User}
                required
                error={errors.fullname?.message}
                {...register("fullname")}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  leftIcon={Mail}
                  required
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Input
                  label="Username"
                  placeholder="johndoe_99"
                  leftIcon={User}
                  required
                  error={errors.username?.message}
                  {...register("username")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={Lock}
                  required
                  error={errors.password?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  {...register("password")}
                />

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={Lock}
                  required
                  error={errors.confirmPassword?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  {...register("confirmPassword")}
                />
              </div>

              <Input
                label="Phone (Optional)"
                placeholder="1234567890"
                leftIcon={Phone}
                error={errors.phone?.message}
                {...register("phone")}
              />

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="md"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
