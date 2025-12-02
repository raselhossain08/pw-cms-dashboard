"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { forgotPassword, resetPassword } from "@/services/auth.service";
import { useToast } from "@/context/ToastContext";
import { useSearchParams } from "next/navigation";
import { resetSchema } from "@/lib/validate";
import { Mail, Eye, EyeOff, KeyRound } from "lucide-react";
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

type Step = "forgot" | "otp" | "reset";

function ForgotPasswordInner() {
  const { push } = useToast();
  const params = useSearchParams();
  const [step, setStep] = React.useState<Step>("forgot");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [otpDigits, setOtpDigits] = React.useState<string[]>(Array(6).fill(""));
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [countdownLeft, setCountdownLeft] = React.useState(600);
  const [resendLeft, setResendLeft] = React.useState(60);
  const countdownTimer = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const resendTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const strength = React.useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  }, [password]);
  const match = React.useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );

  React.useEffect(() => {
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (resendTimer.current) clearInterval(resendTimer.current);
    };
  }, []);

  function startOtpTimers() {
    setCountdownLeft(600);
    setResendLeft(60);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (resendTimer.current) clearInterval(resendTimer.current);
    countdownTimer.current = setInterval(() => {
      setCountdownLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          return 0;
        }
        return next;
      });
    }, 1000);
    resendTimer.current = setInterval(() => {
      setResendLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          if (resendTimer.current) clearInterval(resendTimer.current);
          return 0;
        }
        return next;
      });
    }, 1000);
  }

  async function onForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      push({ message: "Please enter your email address.", type: "error" });
      return;
    }
    setLoading(true);
    const res = await forgotPassword({ email });
    setLoading(false);
    if (!res.success) {
      push({ message: res.error || "Request failed.", type: "error" });
      return;
    }
    setStep("otp");
    startOtpTimers();
    push({
      message: `Password reset instructions sent to ${email}`,
      type: "success",
    });
  }

  function onOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      push({
        message: "Please enter the complete 6-digit code.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp === "123456") {
        setStep("reset");
        if (countdownTimer.current) clearInterval(countdownTimer.current);
        if (resendTimer.current) clearInterval(resendTimer.current);
        push({
          message: "Identity verified. Please create a new password.",
          type: "success",
        });
      } else {
        push({
          message: "Invalid verification code. Please try again.",
          type: "error",
        });
        setOtpDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    }, 1200);
  }

  async function onResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword) {
      push({
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }
    if (password !== confirmPassword) {
      push({ message: "Passwords do not match.", type: "error" });
      return;
    }
    if (password.length < 8) {
      push({
        message: "Password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    const token = params.get("token") || otpDigits.join("");
    const parsed = resetSchema.safeParse({ token: token || "", password });
    if (!parsed.success) {
      setLoading(false);
      push({ message: "Please check your input.", type: "error" });
      return;
    }
    const res = await resetPassword({ token: token || "", password });
    setLoading(false);
    if (!res.success) {
      push({ message: res.error || "Reset failed.", type: "error" });
      return;
    }
    push({ message: "Password updated. Please login.", type: "success" });
  }

  function renderForgot() {
    return (
      <form onSubmit={onForgotSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          <Mail className="w-4 h-4" />
          Send Reset Link
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    );
  }

  function renderOtp() {
    const minutes = Math.floor(countdownLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (countdownLeft % 60).toString().padStart(2, "0");
    return (
      <form onSubmit={onOtpVerify} className="space-y-4">
        <div className="text-center text-sm text-muted-foreground mb-4">
          Code sent to {email || "your email"}
        </div>
        <div className="space-y-2">
          <Label className="text-center block">
            Enter 6-digit verification code
          </Label>
          <div className="flex justify-center gap-2 mb-2">
            {otpDigits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={d}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
                  setOtpDigits((prev) => {
                    const next = [...prev];
                    next[i] = val;
                    return next;
                  });
                  if (val && i < 5) inputRefs.current[i + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otpDigits[i] && i > 0) {
                    inputRefs.current[i - 1]?.focus();
                  }
                }}
                inputMode="numeric"
                disabled={loading}
                className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Use code <span className="font-mono font-semibold">123456</span> for testing
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Expires in {minutes}:{seconds}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={resendLeft > 0 || loading}
            onClick={() => setResendLeft(60)}
          >
            {resendLeft > 0 ? `Resend in ${resendLeft}s` : "Resend Code"}
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          Verify Code
        </Button>
      </form>
    );
  }

  function renderReset() {
    return (
      <form onSubmit={onResetSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
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
            <div className="space-y-1">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    strength < 50
                      ? "bg-red-500"
                      : strength < 75
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${strength}%` }}
                />
              </div>
              <div
                className={`text-xs ${
                  strength < 50
                    ? "text-red-500"
                    : strength < 75
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword && (
              <div
                className={`text-xs ${
                  match ? "text-green-600" : "text-destructive"
                }`}
              >
                {match ? " Passwords match" : " Passwords do not match"}
              </div>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          <KeyRound className="w-4 h-4" />
          Reset Password
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </div>
      </form>
    );
  }

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
            <KeyRound className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "forgot" && "Forgot Password"}
            {step === "otp" && "Verify Identity"}
            {step === "reset" && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === "forgot" && "Enter your email to receive a reset code"}
            {step === "otp" &&
              `We sent a verification code to ${email || "your email"}`}
            {step === "reset" && "Create a strong password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "forgot" && renderForgot()}
          {step === "otp" && renderOtp()}
          {step === "reset" && renderReset()}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
