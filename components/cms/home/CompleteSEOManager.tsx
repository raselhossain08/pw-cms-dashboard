"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { useAboutSection } from "@/hooks/useAboutSection";
import { useBanners } from "@/hooks/useBanner";
import { useBlog } from "@/hooks/useBlog";
import { useEvents } from "@/hooks/useEvents";
import { useTestimonials } from "@/hooks/useTestimonials";
import { AutoSEOGenerator } from "@/components/seo/AutoSEOGenerator";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Gauge,
  Eye,
  Code,
  Globe,
  AlertCircle,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Calendar,
  Award,
  RefreshCw,
  Settings,
  BarChart3,
  ChevronDown,
} from "lucide-react";

interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

interface SeoScore {
  total: number;
  checks: Array<{
    label: string;
    value: string | number;
    score: number;
    pass: boolean;
    recommendation?: string;
  }>;
}

function calculateSeoScore(seo?: SeoData): SeoScore {
  const titleLen = seo?.title?.length || 0;
  const descLen = seo?.description?.length || 0;
  const hasKeywords = !!seo?.keywords && seo?.keywords.trim().length > 0;
  const hasCanonical =
    !!seo?.canonicalUrl && seo?.canonicalUrl.startsWith("http");
  const hasOgTitle = !!seo?.ogTitle || !!seo?.title;
  const hasOgDesc = !!seo?.ogDescription || !!seo?.description;
  const hasOgImage = !!seo?.ogImage;

  const titleScore =
    titleLen >= 30 && titleLen <= 65 ? 100 : titleLen > 10 ? 60 : 0;
  const descScore =
    descLen >= 120 && descLen <= 160 ? 100 : descLen >= 80 ? 70 : 0;
  const kwScore = hasKeywords ? 100 : 0;
  const canonicalScore = hasCanonical ? 100 : 0;
  const ogTitleScore = hasOgTitle ? 100 : 0;
  const ogDescScore = hasOgDesc ? 100 : 0;
  const ogImageScore = hasOgImage ? 100 : 0;

  const checks = [
    {
      label: "Title Length (30-65 chars)",
      value: titleLen,
      score: titleScore,
      pass: titleScore === 100,
      recommendation:
        titleLen < 30
          ? "Title is too short. Aim for 30-65 characters."
          : titleLen > 65
          ? "Title is too long. Keep it under 65 characters."
          : "Perfect title length!",
    },
    {
      label: "Meta Description (120-160 chars)",
      value: descLen,
      score: descScore,
      pass: descScore === 100,
      recommendation:
        descLen < 120
          ? "Description is too short. Aim for 120-160 characters."
          : descLen > 160
          ? "Description is too long. Keep it under 160 characters."
          : "Perfect description length!",
    },
    {
      label: "Meta Keywords",
      value: hasKeywords ? "Present" : "Missing",
      score: kwScore,
      pass: hasKeywords,
      recommendation: hasKeywords
        ? "Keywords are properly set."
        : "Add relevant keywords for better SEO.",
    },
    {
      label: "Canonical URL",
      value: hasCanonical ? "Present" : "Missing",
      score: canonicalScore,
      pass: hasCanonical,
      recommendation: hasCanonical
        ? "Canonical URL is set correctly."
        : "Add a canonical URL to prevent duplicate content issues.",
    },
    {
      label: "Open Graph Title",
      value: hasOgTitle ? "Present" : "Missing",
      score: ogTitleScore,
      pass: hasOgTitle,
      recommendation: hasOgTitle
        ? "OG title is set for social sharing."
        : "Add an Open Graph title for better social media previews.",
    },
    {
      label: "Open Graph Description",
      value: hasOgDesc ? "Present" : "Missing",
      score: ogDescScore,
      pass: hasOgDesc,
      recommendation: hasOgDesc
        ? "OG description is set for social sharing."
        : "Add an Open Graph description for social media.",
    },
    {
      label: "Open Graph Image",
      value: hasOgImage ? "Present" : "Missing",
      score: ogImageScore,
      pass: hasOgImage,
      recommendation: hasOgImage
        ? "OG image is set for social sharing."
        : "Add an Open Graph image (1200x630px recommended).",
    },
  ];

  const total = Math.round(
    (titleScore +
      descScore +
      kwScore +
      canonicalScore +
      ogTitleScore +
      ogDescScore +
      ogImageScore) /
      7
  );

  return { total, checks };
}

interface SectionSeoCardProps {
  title: string;
  icon: React.ReactNode;
  seo?: SeoData;
  editLink: string;
  isActive?: boolean;
}

function SectionSeoCard({
  title,
  icon,
  seo,
  editLink,
  isActive = true,
}: SectionSeoCardProps) {
  const { total, checks } = calculateSeoScore(seo);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={!isActive ? "opacity-50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                total >= 85
                  ? "default"
                  : total >= 60
                  ? "secondary"
                  : "destructive"
              }
            >
              {total}%
            </Badge>
            {!isActive && (
              <Badge variant="outline" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={total} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {seo
              ? total >= 85
                ? "Excellent SEO configuration"
                : total >= 60
                ? "Good, but could be improved"
                : "Needs optimization"
              : "No SEO data configured"}
          </p>
        </div>

        {seo && (
          <Collapsible>
            <CollapsibleTrigger className="text-sm py-2 hover:underline flex items-center gap-1 w-full">
              View Details
              <ChevronDown className="w-3 h-3" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-2">
                {checks.slice(0, 3).map((check, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1">
                      {check.pass ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span>{check.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {String(check.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Link href={editLink}>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Settings className="w-3 h-3" />
            {seo ? "Edit SEO Settings" : "Configure SEO"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function CompleteSEOManager() {
  const { aboutSection, loading: aboutLoading } = useAboutSection();
  const { banners, loading: bannersLoading } = useBanners();
  const { blog, loading: blogLoading } = useBlog();
  const { events, loading: eventsLoading } = useEvents();
  const { testimonials, loading: testimonialsLoading } = useTestimonials();

  const [refreshing, setRefreshing] = useState(false);

  const primarySeo = banners?.[0]?.seo || aboutSection?.seo;
  const overallScore = calculateSeoScore(primarySeo);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://personalwings.com";

  const isLoading =
    aboutLoading ||
    bannersLoading ||
    blogLoading ||
    eventsLoading ||
    testimonialsLoading;

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  // Calculate overall page score
  const calculateOverallPageScore = () => {
    const scores = [
      calculateSeoScore(banners?.[0]?.seo).total,
      calculateSeoScore(aboutSection?.seo).total,
      calculateSeoScore(blog?.seo).total,
      calculateSeoScore(events?.seo).total,
      calculateSeoScore(testimonials?.seo).total,
    ].filter((score) => score > 0);

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const pageScore = calculateOverallPageScore();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Complete Homepage SEO Manager
            <Badge variant="secondary" className="text-xs">
              AI-Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive SEO optimization for all homepage sections with
            automatic 100% score generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading SEO data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Score */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Overall Homepage SEO Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <Progress value={pageScore} className="h-4" />
                </div>
                <Badge
                  variant={
                    pageScore >= 85
                      ? "default"
                      : pageScore >= 60
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xl px-6 py-2"
                >
                  {pageScore}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {pageScore >= 85
                  ? "🎉 Excellent! Your homepage is well-optimized for search engines."
                  : pageScore >= 60
                  ? "⚡ Good progress! A few improvements will boost your SEO."
                  : "🚀 Let's optimize! Configure SEO settings for better rankings."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {banners?.filter((b) => b.seo).length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Banners with SEO
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {aboutSection?.seo ? "1" : "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    About Section
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {blog?.seo ? "1" : "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Blog SEO</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {events?.seo ? "1" : "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Events SEO
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {testimonials?.seo ? "1" : "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Testimonials
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Gauge className="w-4 h-4 mr-2" />
                All Sections
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Code className="w-4 h-4 mr-2" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="tips">
                <TrendingUp className="w-4 h-4 mr-2" />
                Best Practices
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - All Sections */}
            <TabsContent value="overview" className="space-y-6">
              {/* Hero/Banner Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Hero Banner Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banners && banners.length > 0 ? (
                    banners
                      .slice(0, 3)
                      .map((banner, idx) => (
                        <SectionSeoCard
                          key={banner._id}
                          title={`Banner ${idx + 1}: ${banner.title.substring(
                            0,
                            20
                          )}...`}
                          icon={<Video className="w-4 h-4" />}
                          seo={banner.seo}
                          editLink="/cms/home/banner"
                          isActive={banner.isActive}
                        />
                      ))
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No banners found. Create a banner to add SEO settings.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              {/* About Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aboutSection ? (
                    <SectionSeoCard
                      title="About Personal Wings"
                      icon={<FileText className="w-4 h-4" />}
                      seo={aboutSection.seo}
                      editLink="/cms/home/about-section"
                      isActive={aboutSection.isActive}
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No about section found. Configure it to add SEO.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              {/* Blog Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Blog Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blog ? (
                    <SectionSeoCard
                      title={`Blog: ${blog.title || "Latest Articles"}`}
                      icon={<FileText className="w-4 h-4" />}
                      seo={blog.seo}
                      editLink="/cms/home/blog"
                      isActive={blog.isActive}
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No blog configuration found. Set up blog to add SEO.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              {/* Events Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Events Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events ? (
                    <SectionSeoCard
                      title={`Events: ${events.title || "Upcoming Events"}`}
                      icon={<Calendar className="w-4 h-4" />}
                      seo={events.seo}
                      editLink="/cms/home/events"
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No events configuration found. Set up events to add SEO.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              {/* Testimonials Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Student Feedback / Testimonials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testimonials ? (
                    <SectionSeoCard
                      title={`Testimonials: ${
                        testimonials.title || "Student Reviews"
                      }`}
                      icon={<MessageSquare className="w-4 h-4" />}
                      seo={testimonials.seo}
                      editLink="/cms/home/testimonials"
                      isActive={testimonials.isActive}
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No testimonials found. Configure testimonials to add
                        SEO.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Quick Action Cards */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/cms/home/banner">
                      <Button variant="outline" size="sm" className="w-full">
                        <Video className="w-4 h-4 mr-2" />
                        Banners
                      </Button>
                    </Link>
                    <Link href="/cms/home/about-section">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        About
                      </Button>
                    </Link>
                    <Link href="/cms/home/blog">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Blog
                      </Button>
                    </Link>
                    <Link href="/cms/home/events">
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Events
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Google Search Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-xs text-green-700 mb-1">{siteUrl}</div>
                    <div className="text-xl text-blue-600 mb-1 font-normal hover:underline cursor-pointer">
                      {primarySeo?.title ||
                        "Personal Wings: Flight Training & Aviation Excellence"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {primarySeo?.description ||
                        "We empower you to soar beyond limitations with online training designed to boost safety, proficiency, and aircraft familiarization."}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is how your homepage appears in Google search results
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Media Preview (Facebook/LinkedIn)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white max-w-2xl">
                    {primarySeo?.ogImage && (
                      <img
                        src={primarySeo.ogImage}
                        alt="OG Preview"
                        className="w-full h-64 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        {siteUrl.replace(/^https?:\/\//, "")}
                      </div>
                      <div className="text-lg font-semibold mb-1">
                        {primarySeo?.ogTitle ||
                          primarySeo?.title ||
                          "Personal Wings"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {primarySeo?.ogDescription ||
                          primarySeo?.description ||
                          "Professional aviation training and flight instruction"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Twitter Card Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-hidden bg-white max-w-lg">
                    {primarySeo?.ogImage && (
                      <img
                        src={primarySeo.ogImage}
                        alt="Twitter Preview"
                        className="w-full h-56 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <div className="text-sm font-semibold mb-0.5">
                        {primarySeo?.ogTitle ||
                          primarySeo?.title ||
                          "Personal Wings"}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {primarySeo?.ogDescription ||
                          primarySeo?.description ||
                          "Professional aviation training"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {siteUrl.replace(/^https?:\/\//, "")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Meta Tags Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Basic Meta Tags
                    </h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {`<title>${primarySeo?.title || "Your Page Title"}</title>
<meta name="description" content="${
                        primarySeo?.description || "Your meta description"
                      }" />
<meta name="keywords" content="${
                        primarySeo?.keywords || "keyword1, keyword2, keyword3"
                      }" />
<link rel="canonical" href="${primarySeo?.canonicalUrl || siteUrl}" />`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Open Graph Tags
                    </h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {`<meta property="og:type" content="website" />
<meta property="og:url" content="${primarySeo?.canonicalUrl || siteUrl}" />
<meta property="og:title" content="${
                        primarySeo?.ogTitle || primarySeo?.title || ""
                      }" />
<meta property="og:description" content="${
                        primarySeo?.ogDescription ||
                        primarySeo?.description ||
                        ""
                      }" />
<meta property="og:image" content="${primarySeo?.ogImage || ""}" />
<meta property="og:site_name" content="Personal Wings" />`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Twitter Card Tags
                    </h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {`<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@personalwings" />
<meta name="twitter:title" content="${
                        primarySeo?.ogTitle || primarySeo?.title || ""
                      }" />
<meta name="twitter:description" content="${
                        primarySeo?.ogDescription ||
                        primarySeo?.description ||
                        ""
                      }" />
<meta name="twitter:image" content="${primarySeo?.ogImage || ""}" />`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      JSON-LD Structured Data
                    </h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Personal Wings",
  "url": "${siteUrl}",
  "description": "${primarySeo?.description || ""}",
  "logo": "${siteUrl}/logo.png"
}
</script>`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Robots & Indexing</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="googlebot" content="index, follow" />`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Best Practices Tab */}
            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    SEO Best Practices & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">
                        ✓ Title Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        • Keep titles between 30-65 characters
                        <br />
                        • Include primary keywords near the beginning
                        <br />
                        • Make it unique and compelling
                        <br />• Avoid keyword stuffing
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">
                        ✓ Meta Description Best Practices
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        • Write 120-160 characters for optimal display
                        <br />
                        • Include a clear call-to-action
                        <br />
                        • Highlight your unique value proposition
                        <br />• Use natural, engaging language
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">
                        ✓ Keyword Strategy
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        • Use 5-10 relevant keywords
                        <br />
                        • Focus on long-tail keywords
                        <br />
                        • Match user search intent
                        <br />• Update based on search trends
                      </p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">
                        ✓ Image Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        • Use 1200x630px for social media (OG) images
                        <br />
                        • Optimize file size (keep under 1MB)
                        <br />
                        • Use descriptive alt text
                        <br />• Choose high-quality, relevant images
                      </p>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">
                        ✓ Mobile Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        • Ensure responsive design
                        <br />
                        • Test on multiple devices
                        <br />
                        • Optimize for mobile page speed
                        <br />• Use mobile-friendly meta tags
                      </p>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">
                        ✓ Performance Tips
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        • Minimize CSS and JavaScript
                        <br />
                        • Enable browser caching
                        <br />
                        • Use CDN for assets
                        <br />• Aim for load time under 3 seconds
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>External SEO Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Google Search Console - Monitor Performance
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://developers.google.com/speed/pagespeed/insights/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      PageSpeed Insights - Test Speed
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://www.opengraph.xyz/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Graph Preview Tool
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://cards-dev.twitter.com/validator"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Twitter Card Validator
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://developers.facebook.com/tools/debug/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Facebook Sharing Debugger
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
