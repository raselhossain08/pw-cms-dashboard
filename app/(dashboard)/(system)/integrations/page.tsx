"use client";

import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import AppLayout from "@/components/layout/AppLayout";
import Integrations from "@/components/integrations/Integrations";
import { useIntegrations } from "@/hooks/useIntegrations";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
  const { refreshAll, isLoading, isLoadingStats } = useIntegrations();

  React.useEffect(() => {
    refreshAll();
  }, []);

  const handleRefresh = async () => {
    await refreshAll();
  };

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-2">
                Integrations
              </h2>
              <p className="text-gray-600">
                Connect your platform with third-party services and tools
              </p>
            </div>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleRefresh}
              disabled={isLoading || isLoadingStats}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  isLoading || isLoadingStats ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
          <Integrations />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
