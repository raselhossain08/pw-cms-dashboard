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
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { push, remove } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation(
      { email: "", password: "" },
      {
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
    const toastId = push({ type: "loading", message: "Signing you in..." });
    try {
      const result = await login(values);

      if (result.success) {
        remove(toastId);
        push({
          type: "success",
          message: "Signed in successfully.",
        });
        router.push("/");
      } else {
        remove(toastId);
        push({
          type: "error",
          message: result.error || "Login failed. Please try again.",
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
            <LogIn className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Personal Wings account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>

            {/* Register Link */}
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Create account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
