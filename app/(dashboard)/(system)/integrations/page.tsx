"use client";

import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import AppLayout from "@/components/layout/AppLayout";
import Integrations from "@/components/integrations/Integrations";
import { useIntegrations } from "@/hooks/useIntegrations";
import {
  RefreshCw,
  Plug,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";

export default function IntegrationsPage() {
  const {
    refreshAll,
    isLoading,
    isLoadingStats,
    stats,
    integrations,
  } = useIntegrations();
  const { push } = useToast();

  React.useEffect(() => {
    refreshAll();
  }, []);

  const handleRefresh = async () => {
    await refreshAll();
    push({
      message: "Integrations refreshed successfully",
      type: "success",
    });
  };

  const statsData = [
    {
      label: "Total Integrations",
      value: stats?.total || 0,
      icon: Plug,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      status: `${integrations.length} active`,
      trend: "+2 this month",
    },
    {
      label: "Connected",
      value: stats?.connected || 0,
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      status: "Working properly",
      indicator: "success",
    },
    {
      label: "Disconnected",
      value: stats?.disconnected || 0,
      icon: XCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      status: stats?.disconnected ? "Needs attention" : "All connected",
      indicator: stats?.disconnected ? "warning" : "success",
    },
    {
      label: "Pending Setup",
      value: stats?.pending || 0,
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      status: stats?.pending ? "Configuration required" : "Up to date",
      indicator: stats?.pending ? "pending" : "success",
    },
  ];

  const quickActions = [
    {
      label: "API Documentation",
      icon: Globe,
      action: () => {},
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Security Settings",
      icon: Shield,
      action: () => {},
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "System Health",
      icon: Activity,
      action: () => {},
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <main className="pt-6">
          <div className="p-6">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
                  <Plug className="w-8 h-8 text-primary" />
                  Integrations
                </h2>
                <p className="text-gray-600 text-lg">
                  Connect your platform with third-party services and tools
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4" />
                    <span>Real-time sync enabled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Secure connections</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleRefresh}
                  disabled={isLoading || isLoadingStats}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isLoading || isLoadingStats ? "animate-spin" : ""
                    }`}
                  />
                  Refresh Data
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Setup
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium mb-1">
                        {stat.label}
                      </p>
                      {isLoadingStats ? (
                        <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-secondary">
                              {stat.value}
                            </p>
                            {stat.trend && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {stat.trend}
                              </span>
                            )}
                            {stat.indicator === "success" && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            )}
                            {stat.indicator === "warning" && (
                              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            )}
                            {stat.indicator === "pending" && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-accent text-xs mt-2 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {stat.status}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center transition-transform hover:scale-110`}
                    >
                      <stat.icon className={`${stat.iconColor} w-7 h-7`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 mb-8 border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-secondary">
                    Quick Actions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`flex items-center gap-2 px-4 py-2 ${action.bgColor} ${action.color} rounded-lg hover:scale-105 transition-transform font-medium text-sm`}
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Integrations Component */}
            <Integrations />
          </div>
        </main>
      </AppLayout>
    </RequireAuth>
  );
}
