"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OTPPage() {
  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""));
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [countdownLeft, setCountdownLeft] = React.useState(600);
  const [resendLeft, setResendLeft] = React.useState(60);
  const [notification, setNotification] = React.useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    const countdown = setInterval(() => {
      setCountdownLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          clearInterval(countdown);
          return 0;
        }
        return next;
      });
    }, 1000);
    const resend = setInterval(() => {
      setResendLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          clearInterval(resend);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(countdown);
      clearInterval(resend);
    };
  }, []);

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const text = e.clipboardData.getData("text").trim();
    if (text.length === digits.length) {
      setDigits(text.split("").slice(0, digits.length));
    }
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setNotification({ message: "Enter all 6 digits.", type: "error" });
      return;
    }
    setNotification({ message: "Verified successfully.", type: "success" });
  }

  const minutes = Math.floor(countdownLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (countdownLeft % 60).toString().padStart(2, "0");

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 relative"
      onPaste={onPaste}
    >
      <div className="rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden bg-white/95 backdrop-blur-md border border-white/30">
        <div className="bg-gradient-to-r from-primary to-purple-600 p-8 text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Personal Wings</h1>
          </div>
          <p className="text-white/80 text-sm">Verify Your Identity</p>
        </div>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Enter Code</h2>
            <p className="text-gray-600">
              Code sent to your email. Use 123456 for testing.
            </p>
          </div>
          <form onSubmit={onVerify} className="space-y-6">
            <div className="flex justify-center space-x-3 mb-4">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
                    setDigits((prev) => {
                      const next = [...prev];
                      next[i] = val;
                      return next;
                    });
                    if (val && i < 5) inputRefs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[i] && i > 0) {
                      inputRefs.current[i - 1]?.focus();
                    }
                  }}
                  inputMode="numeric"
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Expires in {minutes}:{seconds}</div>
              <Button variant="outline" className="border-gray-300" disabled>
                Resend in 60s
              </Button>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 text-white">
              Verify Code
            </Button>
            <div className="text-center text-sm text-gray-600">
              <Mail className="w-4 h-4 inline mr-1" /> Didn&apos;t get a code? Check your spam folder.
            </div>
            <div className="text-center text-sm text-gray-600">
              Back to <Link href="/login" className="text-primary font-semibold">Login</Link>
            </div>
          </form>
        </div>
      </div>

      {notification && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-md ${
            notification.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </main>
  );
}
