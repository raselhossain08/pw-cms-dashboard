import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const statusConfig: Record<
    string,
    { icon: LucideIcon; class: string; label: string }
  > = {
    completed: {
      icon: CheckCircle2,
      class: "bg-green-100 text-green-800",
      label: "Completed",
    },
    pending: {
      icon: Clock,
      class: "bg-yellow-100 text-yellow-800",
      label: "Pending",
    },
    failed: {
      icon: XCircle,
      class: "bg-red-100 text-red-800",
      label: "Failed",
    },
    refunded: {
      icon: RotateCcw,
      class: "bg-blue-100 text-blue-800",
      label: "Refunded",
    },
    scheduled: {
      icon: Clock,
      class: "bg-blue-100 text-blue-800",
      label: "Scheduled",
    },
    processing: {
      icon: Loader2,
      class: "bg-yellow-100 text-yellow-800",
      label: "Processing",
    },
    paid: {
      icon: CheckCircle2,
      class: "bg-green-100 text-green-800",
      label: "Paid",
    },
  };

  const config =
    statusConfig[status?.toLowerCase() || "pending"] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1",
        config.class,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
