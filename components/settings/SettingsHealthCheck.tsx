"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface HealthStatus {
  service: string;
  status: "healthy" | "unhealthy" | "checking" | "unknown";
  message?: string;
  responseTime?: number;
}

export function SettingsHealthCheck() {
  const [healthStatus, setHealthStatus] = React.useState<HealthStatus[]>([
    { service: "System Config API", status: "unknown" },
    { service: "User API", status: "unknown" },
    { service: "Auth Service", status: "unknown" },
    { service: "Database Connection", status: "unknown" },
  ]);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    
    // System Config API
    setHealthStatus((prev) =>
      prev.map((s) =>
        s.service === "System Config API" ? { ...s, status: "checking" } : s
      )
    );
    
    const startTime = Date.now();
    
    try {
      // Test System Config API
      const systemConfigStart = Date.now();
      await apiClient.get("/system-config");
      const systemConfigTime = Date.now() - systemConfigStart;
      
      setHealthStatus((prev) =>
        prev.map((s) =>
          s.service === "System Config API"
            ? {
                ...s,
                status: "healthy",
                message: "Responding normally",
                responseTime: systemConfigTime,
              }
            : s
        )
      );
    } catch (error) {
      setHealthStatus((prev) =>
        prev.map((s) =>
          s.service === "System Config API"
            ? { ...s, status: "unhealthy", message: "Connection failed" }
            : s
        )
      );
    }

    // User API
    setHealthStatus((prev) =>
      prev.map((s) => (s.service === "User API" ? { ...s, status: "checking" } : s))
    );
    
    try {
      const userStart = Date.now();
      await apiClient.get("/users/me");
      const userTime = Date.now() - userStart;
      
      setHealthStatus((prev) =>
        prev.map((s) =>
          s.service === "User API"
            ? {
                ...s,
                status: "healthy",
                message: "Responding normally",
                responseTime: userTime,
              }
            : s
        )
      );
    } catch (error) {
      setHealthStatus((prev) =>
        prev.map((s) =>
          s.service === "User API"
            ? { ...s, status: "unhealthy", message: "Connection failed" }
            : s
        )
      );
    }

    // Auth Service
    setHealthStatus((prev) =>
      prev.map((s) =>
        s.service === "Auth Service" ? { ...s, status: "checking" } : s
      )
    );
    
    try {
      const authStart = Date.now();
      await apiClient.get("/auth/profile");
      const authTime = Date.now() - authStart;
      
      setHealthStatus((prev) =>
        prev.map((s) =>
          s.service === "Auth Service"
            ? {
                ...s,
                status: "healthy",
                message: "Responding normally",
                responseTime: authTime,
              }
            : s
        )
      );
    } catch (error) {
      setHealthStatus((prev) =>
        prev.map((s) =>
          s.service === "Auth Service"
            ? { ...s, status: "unhealthy", message: "Connection failed" }
            : s
        )
      );
    }

    // Database (inferred from other services)
    const allHealthy = healthStatus.filter((s) => s.status === "healthy").length >= 2;
    setHealthStatus((prev) =>
      prev.map((s) =>
        s.service === "Database Connection"
          ? {
              ...s,
              status: allHealthy ? "healthy" : "unhealthy",
              message: allHealthy ? "Connected" : "Check connection",
            }
          : s
      )
    );

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status: HealthStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "checking":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: HealthStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "border-green-200 bg-green-50";
      case "unhealthy":
        return "border-red-200 bg-red-50";
      case "checking":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-secondary">
          System Health Check
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Run Check"
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {healthStatus.map((item) => (
          <div
            key={item.service}
            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${getStatusColor(
              item.status
            )}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div>
                <div className="font-medium text-sm text-secondary">
                  {item.service}
                </div>
                {item.message && (
                  <div className="text-xs text-gray-600">{item.message}</div>
                )}
              </div>
            </div>
            {item.responseTime && (
              <div className="text-xs text-gray-500">
                {item.responseTime}ms
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Status:</span>
          <span
            className={`font-semibold ${
              healthStatus.filter((s) => s.status === "healthy").length ===
              healthStatus.length
                ? "text-green-600"
                : healthStatus.some((s) => s.status === "unhealthy")
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {healthStatus.filter((s) => s.status === "healthy").length ===
            healthStatus.length
              ? "All Systems Operational"
              : healthStatus.some((s) => s.status === "unhealthy")
              ? "Some Services Down"
              : "Checking..."}
          </span>
        </div>
      </div>
    </div>
  );
}

