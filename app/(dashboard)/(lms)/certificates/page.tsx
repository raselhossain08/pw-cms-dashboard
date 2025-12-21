"use client";

import AppLayout from "@/components/layout/AppLayout";
import Certificates from "@/components/certificates/Certificates";
import AdminCertificateGenerator from "@/components/certificates/AdminCertificateGenerator";
import SimpleCertificateEditor from "@/components/certificates/CertificateEditor";
import CertificateAnalytics from "@/components/certificates/CertificateAnalytics";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Settings, ShieldCheck, Edit, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CertificatesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <RequireAuth>
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary flex items-center gap-2 sm:gap-3">
                  <Award className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
                  Certificates
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                  {isAdmin
                    ? "Manage and generate certificates for students"
                    : "View and download your earned certificates"}
                </p>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setEditorOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit Template</span>
                  </Button>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-primary">
                      Admin Access
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {isAdmin ? (
            <Tabs defaultValue="my-certificates" className="w-full">
              <div className="mb-6 sm:mb-8">
                <TabsList className="inline-flex h-auto items-center justify-start gap-2 p-0  bg-white">
                  <TabsTrigger
                    value="my-certificates"
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:bg-white  data-[state=active]:shadow-none"
                  >
                    <Award className="w-4 h-4" />
                    <span>My Certificates</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:bg-white  data-[state=active]:shadow-none"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin Generator</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:bg-white  data-[state=active]:shadow-none"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="my-certificates"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <Certificates />
              </TabsContent>

              <TabsContent
                value="admin"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <AdminCertificateGenerator />
              </TabsContent>

              <TabsContent
                value="analytics"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <CertificateAnalytics />
              </TabsContent>
            </Tabs>
          ) : (
            <Certificates />
          )}
        </div>

        {/* Certificate Template Editor */}
        <SimpleCertificateEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
        />
      </AppLayout>
    </RequireAuth>
  );
}
