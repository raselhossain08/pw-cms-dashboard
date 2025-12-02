"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import {
  verifyEmail,
  verifyEmailCode,
  resendVerification,
} from "@/services/auth.service";
import { useToast } from "@/context/ToastContext";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

function ActivateAccountInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { push, remove } = useToast();
  const [isVerified, setIsVerified] = React.useState(false);
  const [codes, setCodes] = React.useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = React.useState(60);
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

  React.useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    const token = params.get("token");
    if (token) {
      (async () => {
        const loadingId = push({
          message: "Verifying your email...",
          type: "loading",
        });
        const res = await verifyEmail(token);
        remove(loadingId);
        if (res.success) {
          push({
            message: "Email verified successfully!",
            type: "success",
          });
          setIsVerified(true);
        } else {
          push({
            message: res.error || "Verification failed.",
            type: "error",
          });
        }
      })();
    }
  }, [params, push, remove]);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    const v = value.replace(/[^0-9A-Za-z]/g, "").slice(0, 1);
    const next = [...codes];
    next[index] = v;
    setCodes(next);
    if (v && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim();
    if (text.length === codes.length) {
      const arr = text.split("").slice(0, codes.length);
      setCodes(arr);
    }
  };

  const handleVerifyCode = async () => {
    const code = codes.join("");
    if (!code || code.length !== codes.length) {
      push({ message: "Please enter all 6 characters.", type: "error" });
      return;
    }
    setIsVerifying(true);
    const loadingId = push({ message: "Verifying code...", type: "loading" });
    const res = await verifyEmailCode(code);
    remove(loadingId);
    if (res.success) {
      push({ message: "Email verified successfully!", type: "success" });
      setIsVerified(true);
    } else {
      push({
        message: res.error || "Invalid or expired code.",
        type: "error",
      });
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    const token = params.get("token") || "";
    if (!token) {
      push({
        message: "Please use the verification link from your email.",
        type: "error",
      });
      return;
    }
    setIsResending(true);
    const loadingId = push({ message: "Sending new code...", type: "loading" });
    const res = await resendVerification(token);
    remove(loadingId);
    if (res.success) {
      push({ message: "New verification code sent!", type: "success" });
      setCountdown(60);
      setCodes(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } else {
      push({
        message: res.error || "Failed to resend code.",
        type: "error",
      });
    }
    setIsResending(false);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Account Activated!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in to
              your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
              size="lg"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Welcome to Personal Wings! Start your aviation journey today.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      onPaste={handlePaste}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Activate Your Account
          </CardTitle>
          <CardDescription>
            Enter the 6-character code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-center block">Verification Code</Label>
            <div className="flex justify-center gap-2">
              {codes.map((code, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={code}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Check your email inbox for the verification code
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              {countdown > 0 ? `Resend in ${countdown}s` : "Code expired?"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={countdown > 0 || isResending}
              onClick={handleResend}
            >
              Resend Code
            </Button>
          </div>

          <Button
            onClick={handleVerifyCode}
            className="w-full"
            size="lg"
            disabled={isVerifying || codes.some((c) => !c)}
          >
            <CheckCircle className="w-4 h-4" />
            Verify Email
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already verified?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={null}>
      <ActivateAccountInner />
    </Suspense>
  );
}
