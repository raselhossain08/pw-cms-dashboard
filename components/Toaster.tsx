"use client";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, XCircle, X, Info, Loader2 } from "lucide-react";

export default function Toaster() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50 max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm
            border animate-in slide-in-from-right-full duration-300
            ${
              t.type === "error"
                ? "bg-destructive/95 text-white border-destructive"
                : t.type === "loading"
                ? "bg-gray-900 text-white border-gray-700"
                : t.type === "info"
                ? "bg-primary/95 text-white border-primary"
                : "bg-accent/95 text-white border-accent"
            }
          `}
          role="alert"
        >
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {t.type === "error" ? (
              <XCircle className="w-5 h-5" />
            ) : t.type === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : t.type === "info" ? (
              <Info className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {t.message}
          </div>

          {/* Close Button */}
          <button
            onClick={() => remove(t.id)}
            className="shrink-0 text-white/80 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
