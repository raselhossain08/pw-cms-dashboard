"use client";

import * as React from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntegrations } from "@/hooks/useIntegrations";

interface HealthStatus {
  integration: string;
  status: "healthy" | "degraded" | "down" | "checking";
  responseTime?: number;
  lastChecked?: string;
  uptime?: number;
  message?: string;
}

export function IntegrationHealthMonitor() {
  const { integrations, testConnection, actionLoading } = useIntegrations();
  const [healthStatuses, setHealthStatuses] = React.useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkAllHealth = async () => {
    setIsChecking(true);
    const statuses: HealthStatus[] = [];

    for (const integration of integrations) {
      if (integration.status === "connected") {
        setHealthStatuses((prev) => [
          ...prev.filter((s) => s.integration !== integration.name),
          {
            integration: integration.name,
            status: "checking",
            lastChecked: new Date().toISOString(),
          },
        ]);

        try {
          const startTime = Date.now();
          const result = await testConnection(integration.id);
          const responseTime = Date.now() - startTime;

          statuses.push({
            integration: integration.name,
            status: result.success ? "healthy" : "degraded",
            responseTime,
            lastChecked: new Date().toISOString(),
            uptime: result.success ? 100 : 0,
            message: result.message,
          });
        } catch (error) {
          statuses.push({
            integration: integration.name,
            status: "down",
            lastChecked: new Date().toISOString(),
            uptime: 0,
            message: "Connection failed",
          });
        }
      }
    }

    setHealthStatuses(statuses);
    setIsChecking(false);
  };

  React.useEffect(() => {
    if (integrations.length > 0) {
      checkAllHealth();
    }
  }, [integrations.length]);

  const getStatusIcon = (status: HealthStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "down":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "checking":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: HealthStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "border-green-200 bg-green-50";
      case "degraded":
        return "border-amber-200 bg-amber-50";
      case "down":
        return "border-red-200 bg-red-50";
      case "checking":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getResponseTimeColor = (time?: number) => {
    if (!time) return "text-gray-500";
    if (time < 200) return "text-green-600";
    if (time < 500) return "text-amber-600";
    return "text-red-600";
  };

  const getResponseTimeIcon = (time?: number) => {
    if (!time) return null;
    if (time < 200) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (time < 500) return <Minus className="w-3 h-3 text-amber-600" />;
    return <TrendingDown className="w-3 h-3 text-red-600" />;
  };

  const overallHealth = React.useMemo(() => {
    if (healthStatuses.length === 0) return "unknown";
    const healthy = healthStatuses.filter((s) => s.status === "healthy").length;
    const total = healthStatuses.length;
    const percentage = (healthy / total) * 100;

    if (percentage === 100) return "excellent";
    if (percentage >= 80) return "good";
    if (percentage >= 50) return "fair";
    return "poor";
  }, [healthStatuses]);

  const getOverallHealthColor = () => {
    switch (overallHealth) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "fair":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "poor":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Integration Health Monitor
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Real-time status of all connected integrations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkAllHealth}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check All
            </>
          )}
        </Button>
      </div>

      {/* Overall Health Status */}
      <div
        className={`mb-6 p-4 rounded-lg border ${getOverallHealthColor()} transition-colors`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Overall System Health</div>
            <div className="text-2xl font-bold capitalize mt-1">
              {overallHealth}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Active Integrations</div>
            <div className="text-2xl font-bold">
              {healthStatuses.filter((s) => s.status === "healthy").length}/
              {healthStatuses.length}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Health Statuses */}
      <div className="space-y-3">
        {healthStatuses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No connected integrations to monitor</p>
            <p className="text-sm mt-1">
              Connect integrations to see their health status
            </p>
          </div>
        ) : (
          healthStatuses.map((health) => (
            <div
              key={health.integration}
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${getStatusColor(
                health.status
              )}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(health.status)}
                <div className="flex-1">
                  <div className="font-medium text-sm text-secondary">
                    {health.integration}
                  </div>
                  {health.message && (
                    <div className="text-xs text-gray-600 mt-0.5">
                      {health.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                {health.responseTime && (
                  <div
                    className={`flex items-center gap-1 ${getResponseTimeColor(
                      health.responseTime
                    )}`}
                  >
                    {getResponseTimeIcon(health.responseTime)}
                    <span className="font-medium">{health.responseTime}ms</span>
                  </div>
                )}

                {health.uptime !== undefined && (
                  <div className="text-gray-600">
                    <span className="font-medium">{health.uptime}%</span>
                    <span className="text-xs ml-1">uptime</span>
                  </div>
                )}

                {health.lastChecked && (
                  <div className="text-xs text-gray-500">
                    {new Date(health.lastChecked).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Health Check Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>Auto-refresh every 5 minutes</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Down</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

