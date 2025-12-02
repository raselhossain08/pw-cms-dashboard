"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { push, remove } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation(
      {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      {
        firstName: {
          required: "First name is required",
          minLength: {
            value: 2,
            message: "First name must be at least 2 characters",
          },
          pattern: {
            value: /^[a-zA-Z\s]+$/,
            message: "First name can only contain letters",
          },
        },
        lastName: {
          required: "Last name is required",
          minLength: {
            value: 2,
            message: "Last name must be at least 2 characters",
          },
          pattern: {
            value: /^[a-zA-Z\s]+$/,
            message: "Last name can only contain letters",
          },
        },
        email: {
          required: "Email is required",
          email: "Please enter a valid email address",
        },
        password: {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: "Password must contain uppercase, lowercase, and number",
          },
        },
        confirmPassword: {
          required: "Please confirm your password",
          match: { field: "password", message: "Passwords do not match" },
        },
      }
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll(values)) {
      push({ type: "error", message: "Please fix the errors in the form" });
      return;
    }

    setLoading(true);
    const toastId = push({
      type: "loading",
      message: "Creating your account...",
    });
    try {
      const { confirmPassword: _confirmPassword, ...registerData } = values;
      const result = await register(registerData);

      if (result.success) {
        remove(toastId);
        const msg =
          (result as { data?: { message?: string } })?.data?.message ||
          "Account created. Check your email to verify your account.";
        push({ type: "success", message: msg });
        router.push("/login");
      } else {
        remove(toastId);
        push({
          type: "error",
          message: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (err) {
      remove(toastId);
      const message =
        typeof err === "string"
          ? err
          : ((err as { message?: unknown }).message as string) ||
            "An unexpected error occurred";
      push({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
            <UserPlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to start your learning journey with Personal Wings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={values.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  aria-invalid={touched.firstName && !!errors.firstName}
                  disabled={loading}
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={values.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  aria-invalid={touched.lastName && !!errors.lastName}
                  disabled={loading}
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={touched.email && !!errors.email}
                disabled={loading}
              />
              {touched.email && errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={values.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  aria-invalid={touched.password && !!errors.password}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              {!errors.password && (
                <p className="text-xs text-muted-foreground">
                  Must contain uppercase, lowercase, and number
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={values.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  aria-invalid={
                    touched.confirmPassword && !!errors.confirmPassword
                  }
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <UserPlus className="w-4 h-4" />
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
