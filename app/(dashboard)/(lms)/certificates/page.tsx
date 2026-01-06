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
        <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-secondary flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary shrink-0" />
                  <span className="wrap-break-word">Certificates</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">
                  {isAdmin
                    ? "Manage and generate certificates for students"
                    : "View and download your earned certificates"}
                </p>
              </div>
              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => setEditorOpen(true)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
                    size="sm"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">Edit Template</span>
                    <span className="xs:hidden">Template</span>
                  </Button>
                  <div className="flex items-center justify-center gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
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
              <div className="mb-4 sm:mb-6 md:mb-8 overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
                <TabsList className="inline-flex h-auto items-center justify-start gap-1 sm:gap-2 p-0.5 sm:p-1 bg-white border border-border rounded-lg w-full sm:w-auto min-w-max">
                  <TabsTrigger
                    value="my-certificates"
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="hidden xs:inline">My Certificates</span>
                    <span className="xs:hidden">My Certs</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="hidden xs:inline">Admin Generator</span>
                    <span className="xs:hidden">Generator</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
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
