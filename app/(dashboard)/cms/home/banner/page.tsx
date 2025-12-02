"use client";

import AppLayout from "@/components/layout/AppLayout";
import { BannerEditor } from "@/components/cms/home/BannerEditor";
import { Video } from "lucide-react";

export default function BannerPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-linear-to-r from-purple-500 to-pink-600 rounded-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Home Banner Management
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Manage homepage video banners with dynamic content and SEO
              optimization
            </p>
          </div>

          {/* Banner Editor Component */}
          <BannerEditor />
        </div>
      </div>
    </AppLayout>
  );
}
