"use client";

import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import {
  Save,
  RotateCcw,
  Settings,
  Palette,
  CreditCard,
  Search as SearchIcon,
  Bell,
  Database,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import MySettings from "@/components/settings/MySettings";
import { useToast } from "@/context/ToastContext";

export default function MySettingsPage() {
  const {
    configs,
    groupedConfigs,
    isLoading,
    isSaving,
    fetchAllConfigs,
    fetchGroupedConfigs,
    bulkUpdateConfigs,
  } = useSystemSettings();

  const { push } = useToast();
  const [activeTab, setActiveTab] = React.useState("General");
  const [hasChanges, setHasChanges] = React.useState(false);
  const [localChanges, setLocalChanges] = React.useState<
    Record<string, string>
  >({});
  const [lastUpdated, setLastUpdated] = React.useState<string>("Just now");

  React.useEffect(() => {
    fetchAllConfigs();
    fetchGroupedConfigs();
  }, []);

  // Update last updated timestamp
  React.useEffect(() => {
    if (!isLoading && configs.length > 0) {
      setLastUpdated(new Date().toLocaleString());
    }
  }, [configs, isLoading]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleConfigChange = (key: string, value: string) => {
    if (key === "refresh") {
      setLocalChanges({});
      setHasChanges(false);
      fetchAllConfigs();
      fetchGroupedConfigs();
      push({
        message: "Settings refreshed successfully",
        type: "success",
      });
      return;
    }

    setLocalChanges((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (Object.keys(localChanges).length === 0) {
      push({
        message: "No changes to save",
        type: "info",
      });
      return;
    }

    const updates = Object.entries(localChanges).map(([key, value]) => ({
      key,
      value,
    }));

    try {
      await bulkUpdateConfigs(updates);
      setLocalChanges({});
      setHasChanges(false);
      setLastUpdated(new Date().toLocaleString());
      push({
        message: `Successfully updated ${updates.length} setting${updates.length > 1 ? 's' : ''}`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save changes:", error);
      push({
        message: "Failed to save changes. Please try again.",
        type: "error",
      });
    }
  };

  const handleResetToDefault = () => {
    if (Object.keys(localChanges).length > 0) {
      push({
        message: `Discarded ${Object.keys(localChanges).length} unsaved change${Object.keys(localChanges).length > 1 ? 's' : ''}`,
        type: "info",
      });
    }
    setLocalChanges({});
    setHasChanges(false);
    fetchAllConfigs();
    fetchGroupedConfigs();
  };

  const statsData = [
    {
      label: "Active Configs",
      value: configs.length || 0,
      icon: Settings,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      status: hasChanges ? `${Object.keys(localChanges).length} unsaved` : "All systems operational",
      trend: "+2.5%",
    },
    {
      label: "Last Updated",
      value: lastUpdated.includes(":") ? lastUpdated.split(" ")[1] : lastUpdated,
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      status: "Synced successfully",
      subtitle: lastUpdated.includes(":") ? lastUpdated.split(" ")[0] : "",
    },
    {
      label: "Categories",
      value: Object.keys(groupedConfigs).length || 0,
      icon: Database,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      status: "Organized & Grouped",
      trend: "6 groups",
    },
    {
      label: "Security Status",
      value: "Active",
      icon: Shield,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      status: "All secure & encrypted",
      indicator: "secure",
    },
  ];

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <main className="pt-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-2">
                  System Settings
                </h2>
                <p className="text-gray-600">
                  Configure your platform preferences, integrations, and system
                  settings.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {hasChanges && (
                  <div className="mr-2 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-sm text-amber-700 font-medium">
                      {Object.keys(localChanges).length} unsaved change
                      {Object.keys(localChanges).length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleResetToDefault}
                  disabled={!hasChanges || isSaving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Changes
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    fetchAllConfigs();
                    fetchGroupedConfigs();
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh Data
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

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
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-secondary">
                              {stat.value}
                            </p>
                            {stat.trend && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {stat.trend}
                              </span>
                            )}
                            {stat.indicator === "secure" && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          {stat.subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {stat.subtitle}
                            </p>
                          )}
                          <p className="text-accent text-xs mt-2 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> {stat.status}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center transition-transform hover:scale-110`}
                    >
                      <stat.icon className={`${stat.iconColor} text-lg`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
              <nav className="flex space-x-8 min-w-max">
                {[
                  { name: "General", icon: Settings },
                  { name: "Branding", icon: Palette },
                  { name: "Payments", icon: CreditCard },
                  { name: "SEO", icon: Globe },
                  { name: "Notifications", icon: Bell },
                  { name: "Backups", icon: Database },
                  { name: "Security", icon: Shield },
                  { name: "Integrations", icon: Zap },
                  { name: "Advanced", icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => handleTabChange(tab.name)}
                    className={`py-4 px-1 font-medium text-sm transition-all relative group ${
                      activeTab === tab.name
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                    </div>
                    {activeTab === tab.name && (
                      <div className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-transparent"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <MySettings
                activeTab={activeTab}
                configs={configs}
                groupedConfigs={groupedConfigs}
                onConfigChange={handleConfigChange}
              />
            )}
          </div>
        </main>
      </AppLayout>
    </RequireAuth>
  );
}
