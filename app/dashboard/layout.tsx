"use client";

import React, { useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/layouts/sidebar";
import { DashboardHeader } from "@/components/layouts/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/30">
      <DashboardSidebar
        isMobileOpen={sidebarOpen}
        onMobileToggle={handleMenuToggle}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onMenuToggle={handleMenuToggle}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
