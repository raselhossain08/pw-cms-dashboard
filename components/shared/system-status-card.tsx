"use client";

import { useSystemStatus } from "@/hooks/use-system-status";
import { SystemStatus } from "@/lib/api/system-status.api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemStatusCardProps {
  className?: string;
}

export const SystemStatusCard = ({ className }: SystemStatusCardProps) => {
  const { data: status, isLoading, isError, error } = useSystemStatus();

  // Type assertion to help TypeScript understand the type
  const typedStatus = status as SystemStatus | undefined;

  if (isLoading) {
    return (
      <div
        className={cn(
          "mt-8 mx-3 p-4 rounded-xl bg-linear-to-r from-slate-50 to-blue-50/30 border border-slate-200/40 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-full h-1.5 rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          "mt-8 mx-3 p-4 rounded-xl bg-linear-to-r from-red-50 to-orange-50/30 border border-red-200/40 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-red-700">
            System Status
          </span>
        </div>
        <div className="text-xs text-red-600">
          {(error as Error)?.message || "Failed to load system status"}
        </div>
      </div>
    );
  }

  if (!typedStatus) {
    return null;
  }

  const getStatusColor = () => {
    switch (typedStatus?.performance?.status) {
      case "Excellent":
        return "text-green-600";
      case "Good":
        return "text-blue-600";
      case "Fair":
        return "text-yellow-600";
      case "Poor":
        return "text-red-600";
      default:
        return "text-green-600";
    }
  };

  const getHealthIndicatorColor = () => {
    switch (typedStatus?.health?.status) {
      case "healthy":
        return "bg-green-400";
      case "warning":
        return "bg-yellow-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-green-400";
    }
  };

  return (
    <div
      className={cn(
        "mt-8 mx-3 p-4 rounded-xl bg-linear-to-r from-slate-50 to-blue-50/30 border border-slate-200/40 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            getHealthIndicatorColor()
          )}
        ></div>
        <span className="text-sm font-semibold text-slate-700">
          System Status
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Storage</span>
          <span className="font-medium text-slate-700">
            {typedStatus?.storage?.used} / {typedStatus?.storage?.total}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-linear-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(typedStatus?.storage?.percentage || 0, 100)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Performance</span>
          <span className={cn("font-medium", getStatusColor())}>
            {typedStatus?.performance?.status}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Uptime</span>
          <span className="font-medium text-slate-700">
            {typedStatus?.performance?.uptime}
          </span>
        </div>
      </div>
    </div>
  );
};
