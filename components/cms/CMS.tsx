"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Heart,
  Calendar,
  MessageSquare,
  Newspaper,
  Image as ImageIcon,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import { useBanners } from "@/hooks/useBanner";
import { useAboutSection } from "@/hooks/useAboutSection";
import { useEvents } from "@/hooks/useEvents";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useBlog } from "@/hooks/useBlog";

export default function CMS() {
  const { banners, loading: bannersLoading } = useBanners();
  const { aboutSection, loading: aboutLoading } = useAboutSection();
  const { events, loading: eventsLoading } = useEvents();
  const { testimonials, loading: testimonialsLoading } = useTestimonials();
  const { blog, loading: blogLoading } = useBlog();

  const statCards = [
    {
      label: "Banners",
      value: banners?.length || 0,
      iconBg: "bg-primary/10",
      icon: <PlayCircle className="text-primary w-6 h-6" />,
    },
    {
      label: "Events",
      value: events?.events?.length || 0,
      iconBg: "bg-green-100",
      icon: <Calendar className="text-green-600 w-6 h-6" />,
    },
    {
      label: "Testimonials",
      value: testimonials?.testimonials?.length || 0,
      iconBg: "bg-purple-100",
      icon: <MessageSquare className="text-purple-600 w-6 h-6" />,
    },
    {
      label: "Blog Posts",
      value: blog?.blogs?.length || 0,
      iconBg: "bg-orange-100",
      icon: <Newspaper className="text-orange-600 w-6 h-6" />,
    },
  ];

  const sections = [
    {
      label: "Home Banner",
      href: "/cms/home/banner",
      icon: <PlayCircle className="w-6 h-6" />,
      status: bannersLoading
        ? "Loading"
        : banners && banners.length > 0
        ? "Configured"
        : "Empty",
    },
    {
      label: "About Section",
      href: "/cms/home/about-section",
      icon: <Heart className="w-6 h-6" />,
      status: aboutLoading
        ? "Loading"
        : aboutSection?.isActive
        ? "Active"
        : "Inactive",
    },
    {
      label: "Events",
      href: "/cms/home/events",
      icon: <Calendar className="w-6 h-6" />,
      status: eventsLoading
        ? "Loading"
        : events?.isActive
        ? "Active"
        : "Inactive",
    },
    {
      label: "Testimonials",
      href: "/cms/home/testimonials",
      icon: <MessageSquare className="w-6 h-6" />,
      status: testimonialsLoading
        ? "Loading"
        : testimonials?.isActive
        ? "Active"
        : "Inactive",
    },
    {
      label: "Blog",
      href: "/cms/home/blog",
      icon: <Newspaper className="w-6 h-6" />,
      status: blogLoading ? "Loading" : blog?.isActive ? "Active" : "Inactive",
    },
    {
      label: "Header",
      href: "/cms/header",
      icon: <ImageIcon className="w-6 h-6" />,
      status: "Manage",
    },
    {
      label: "Footer",
      href: "/cms/footer",
      icon: <ImageIcon className="w-6 h-6" />,
      status: "Manage",
    },
    {
      label: "Contact Page",
      href: "/cms/contact",
      icon: <MessageSquare className="w-6 h-6" />,
      status: "Manage",
    },
    {
      label: "FAQs",
      href: "/cms/faqs",
      icon: <CircleHelp className="w-6 h-6" />,
      status: "Manage",
    },
    {
      label: "Privacy Policy",
      href: "/cms/privacy-policy",
      icon: <ShieldCheck className="w-6 h-6" />,
      status: "Manage",
    },
    {
      label: "Refund Policy",
      href: "/cms/refund-policy",
      icon: <ShieldCheck className="w-6 h-6" />,
      status: "Manage",
    },
    {
      label: "Terms & Conditions",
      href: "/cms/terms-conditions",
      icon: <ShieldCheck className="w-6 h-6" />,
      status: "Manage",
    },
  ];

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">CMS</h2>
          <p className="text-gray-600">
            Manage homepage sections and content pages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {s.value}
                </p>
                <p className="text-accent text-sm mt-1">Status</p>
              </div>
              <div
                className={`w-12 h-12 ${s.iconBg} rounded-lg flex items-center justify-center`}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <Card key={sec.href} className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {sec.icon}
                </div>
                <Badge variant="secondary">{sec.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{sec.label}</h3>
              <div className="flex justify-end">
                <Link href={sec.href} className="inline-flex">
                  <Button>Manage</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
