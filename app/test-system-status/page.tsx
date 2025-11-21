"use client";

import { SystemStatusCard } from "@/components/shared/system-status-card";
import { StorageConfiguration } from "@/components/shared/storage-configuration";

export default function SystemStatusTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Status & Configuration</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          <SystemStatusCard />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Storage Configuration</h2>
          <StorageConfiguration />
        </div>
      </div>
    </div>
  );
}
