"use client";

import React, { useState } from "react";
import { useFooterEditor } from "@/hooks/use-footer-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Save,
  Palette,
  Image,
  Navigation,
  Settings,
  User,
  Zap,
  Globe,
  Layout,
  Sparkles,
  Loader2,
  MessageSquare,
  Folder,
  Mail,
  Building,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FooterLogoEditor } from "@/components/dashboard/footer/logo-editor";
import { SectionsEditor } from "@/components/dashboard/footer/sections-editor";
import { ContactEditor } from "@/components/dashboard/footer/contact-editor";
import { SocialMediaEditor } from "@/components/dashboard/footer/social-media-editor";
import { NewsletterEditor } from "@/components/dashboard/footer/newsletter-editor";
import { FooterSEOEditor } from "@/components/dashboard/footer/seo-editor";

export default function FooterEditorPage() {
  const { footer, loading, error, isDirty, isSaving, saveAll, clearError } =
    useFooterEditor();
  const [activeTab, setActiveTab] = useState("logo");

  if (loading && !footer) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert variant="destructive" className="border-l-4 border-l-red-500">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!footer) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert className="border-l-4 border-l-blue-500 bg-blue-50">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              No footer configuration found. Please run the seed command.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-linear-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-linear-to-l from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative p-4 sm:p-6 lg:p-8">
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-l-4 border-l-red-500 shadow-lg"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-700 hover:text-red-800 hover:bg-red-100"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header Stats and Status */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Footer Configuration
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
                Customize every aspect of your website footer - from branding
                and navigation to contact information and social media links.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {isDirty && (
                <Badge
                  variant="secondary"
                  className="gap-2 px-3 py-2 bg-orange-50 text-orange-700 border-orange-200 shadow-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  Unsaved Changes
                </Badge>
              )}

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-2 rounded-lg border">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                <span className="hidden sm:inline">Live Preview Available</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          {/* Card Background Gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Enhanced Tabs Header */}
            <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 bg-linear-to-r from-white to-gray-50/50 overflow-x-auto">
              <TabsList className="w-full min-w-max sm:min-w-full justify-start bg-transparent p-0 gap-1 flex-nowrap sm:flex-wrap">
                <TabsTrigger
                  value="logo"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logo & Description</span>
                  <span className="sm:hidden">Logo</span>
                </TabsTrigger>

                <TabsTrigger
                  value="sections"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Folder className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Navigation</span>
                  <span className="sm:hidden">Nav</span>
                </TabsTrigger>

                <TabsTrigger
                  value="contact"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Contact Info</span>
                  <span className="sm:hidden">Contact</span>
                </TabsTrigger>

                <TabsTrigger
                  value="social"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Social Media</span>
                  <span className="sm:hidden">Social</span>
                </TabsTrigger>

                <TabsTrigger
                  value="newsletter"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Newsletter</span>
                  <span className="sm:hidden">Newsletter</span>
                </TabsTrigger>

                <TabsTrigger
                  value="seo"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">SEO & Accessibility</span>
                  <span className="sm:hidden">SEO</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content Area */}
            <div className="p-4 sm:p-6 lg:p-8 bg-linear-to-br from-white via-gray-50/30 to-blue-50/20 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              <TabsContent
                value="logo"
                className="mt-0 space-y-6 animate-in fade-in duration-300"
              >
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                    Logo & Description
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Configure your footer logo and description text to enhance
                    your brand presence.
                  </p>
                </div>
                <FooterLogoEditor footer={footer} />
              </TabsContent>

              <TabsContent
                value="sections"
                className="mt-0 space-y-6 animate-in fade-in duration-300"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
                    Navigation Sections
                  </h3>
                  <p className="text-gray-600">
                    Organize your footer links into sections for easy navigation
                    and better user experience.
                  </p>
                </div>
                <SectionsEditor footer={footer} />
              </TabsContent>

              <TabsContent
                value="contact"
                className="mt-0 space-y-6 animate-in fade-in duration-300"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                    Contact Information
                  </h3>
                  <p className="text-gray-600">
                    Add your business contact details including phone, email,
                    address, and business hours.
                  </p>
                </div>
                <ContactEditor footer={footer} />
              </TabsContent>

              <TabsContent
                value="social"
                className="mt-0 space-y-6 animate-in fade-in duration-300"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
                    Social Media Links
                  </h3>
                  <p className="text-gray-600">
                    Connect your social media profiles to increase engagement
                    and build your online presence.
                  </p>
                </div>
                <SocialMediaEditor footer={footer} />
              </TabsContent>

              <TabsContent
                value="newsletter"
                className="mt-0 space-y-6 animate-in fade-in duration-300"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent mb-2">
                    Newsletter Subscription
                  </h3>
                  <p className="text-gray-600">
                    Set up a newsletter subscription form to capture leads and
                    keep visitors engaged with your content.
                  </p>
                </div>
                <NewsletterEditor footer={footer} />
              </TabsContent>

              <TabsContent
                value="seo"
                className="mt-0 space-y-6 animate-in fade-in duration-300"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-linear-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent mb-2">
                    SEO & Accessibility
                  </h3>
                  <p className="text-gray-600">
                    Configure SEO structured data and accessibility settings to improve search rankings and user experience.
                  </p>
                </div>
                <FooterSEOEditor footer={footer} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Floating Action Button */}
          {isDirty && (
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
              <Button
                onClick={saveAll}
                disabled={isSaving}
                className="gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Save All Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
