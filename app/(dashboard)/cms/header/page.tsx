"use client";

import { HeaderEditor } from "@/components/cms/header/Navbar";
import { TopBarEditor } from "@/components/cms/header/TopBar";
import AppLayout from "@/components/layout/AppLayout";
import { Menu, Megaphone } from "lucide-react";
import React, { useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"header" | "topbar">("header");

  return (
    <AppLayout>
      <div className="min-h-screen  p-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Header & Top Bar Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Configure your website header navigation and top bar settings
            </p>
          </div>

          {/* Segmented Control */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center p-1 bg-white rounded-xl shadow-md border border-gray-200">
              <button
                onClick={() => setActiveTab("header")}
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[140px] sm:min-w-[180px]
                  ${
                    activeTab === "header"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Header Navigation</span>
              </button>
              <button
                onClick={() => setActiveTab("topbar")}
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[140px] sm:min-w-[180px]
                  ${
                    activeTab === "topbar"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Top Bar</span>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "header" && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <HeaderEditor />
              </div>
            )}
            {activeTab === "topbar" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <TopBarEditor />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
