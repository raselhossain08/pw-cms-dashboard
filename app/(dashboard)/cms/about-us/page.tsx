"use client";

import AppLayout from "@/components/layout/AppLayout";
import { AboutUsEditor } from "@/components/cms/AboutUsEditor";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  About Us Page Management
                </h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-14">
              Manage About Us page content with WordPress-like rich text editor
            </p>
          </div>

          {/* About Us Editor Component with Error Boundary */}
          <ErrorBoundary
            fallback={
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <CardTitle>Failed to Load About Us Editor</CardTitle>
                      <CardDescription>
                        There was an error loading the About Us page editor. Please try refreshing the page.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </CardContent>
              </Card>
            }
            onError={(error, errorInfo) => {
              console.error("About Us Editor Error:", error, errorInfo);
              // TODO: Send to error tracking service
            }}
          >
            <AboutUsEditor />
          </ErrorBoundary>
        </div>
      </div>
    </AppLayout>
  );
}
