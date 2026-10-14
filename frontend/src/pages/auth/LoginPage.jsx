import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, Lock, Mail, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Card, CardContent } from "../../components/common/Card";
import { useLoginMutation } from "../../store/api/authApi";
import { DEFAULT_ROLE_REDIRECTS } from "../../constants/roles";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username or Email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      // The backend accepts identifier as either "email" or "username"
      const payload = data.identifier.includes("@")
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };

      const response = await login(payload).unwrap();
      const user = response?.data?.user;

      toast.success(
        response?.message || `Welcome back, ${user?.fullname || "User"}!`
      );

      // Determine redirect path
      const targetPath =
        location.state?.from?.pathname ||
        (user?.role ? DEFAULT_ROLE_REDIRECTS[user.role] : "/");

      navigate(targetPath, { replace: true });
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Invalid username/email or password";
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
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
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500">
            Access your applications, company dashboard, or interviews
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email or Username"
                placeholder="name@example.com or username"
                leftIcon={Mail}
                required
                error={errors.identifier?.message}
                {...register("identifier")}
              />

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

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    {...register("rememberMe")}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="md"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-500"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
