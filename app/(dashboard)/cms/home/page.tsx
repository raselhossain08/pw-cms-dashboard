"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { CompleteSEOManager } from "@/components/cms/home/CompleteSEOManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  Video,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  LayoutDashboard,
} from "lucide-react";

export default function CMSHomePage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            Homepage CMS Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all homepage sections and SEO optimization from one place
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="seo" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="seo">
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="banner">
              <Video className="w-4 h-4 mr-2" />
              Banner
            </TabsTrigger>
            <TabsTrigger value="about">
              <FileText className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="blog">
              <FileText className="w-4 h-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="testimonials">
              <MessageSquare className="w-4 h-4 mr-2" />
              Testimonials
            </TabsTrigger>
          </TabsList>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <CompleteSEOManager />
          </TabsContent>

          {/* Banner Tab */}
          <TabsContent value="banner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Hero Banner Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create and manage hero banners for your homepage. Each banner
                  can have custom titles, descriptions, CTAs, and background
                  images.
                </p>
                <Link href="/cms/home/banner">
                  <Button className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Banners
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About Section Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Configure the about section that introduces your organization,
                  mission, and values to visitors.
                </p>
                <Link href="/cms/home/about-section">
                  <Button className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage About Section
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Blog Section Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage your blog section settings, featured posts, and display
                  options for the homepage.
                </p>
                <Link href="/cms/home/blog">
                  <Button className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Blog Section
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Events Section Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Configure how upcoming events are displayed on your homepage,
                  including featured events and layouts.
                </p>
                <Link href="/cms/home/events">
                  <Button className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Events Section
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Testimonials Section Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage student testimonials and feedback display settings for
                  the homepage.
                </p>
                <Link href="/cms/home/testimonials">
                  <Button className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Testimonials
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
