"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAboutSection } from "@/hooks/useAboutSection";
import { useBanners } from "@/hooks/useBanner";
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
} from "lucide-react";

function getScore(seo?: {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}) {
  const titleLen = seo?.title?.length || 0;
  const descLen = seo?.description?.length || 0;
  const hasKeywords = !!seo?.keywords && seo?.keywords.trim().length > 0;
  const hasCanonical = !!seo?.canonicalUrl && seo?.canonicalUrl.startsWith("http");
  const hasOgTitle = !!seo?.ogTitle || !!seo?.title;
  const hasOgDesc = !!seo?.ogDescription || !!seo?.description;
  const hasOgImage = !!seo?.ogImage;

  const titleScore = titleLen >= 30 && titleLen <= 65 ? 100 : titleLen > 10 ? 60 : 0;
  const descScore = descLen >= 120 && descLen <= 160 ? 100 : descLen >= 80 ? 70 : 0;
  const kwScore = hasKeywords ? 100 : 0;
  const canonicalScore = hasCanonical ? 100 : 0;
  const ogTitleScore = hasOgTitle ? 100 : 0;
  const ogDescScore = hasOgDesc ? 100 : 0;
  const ogImageScore = hasOgImage ? 100 : 0;

  const checks = [
    { label: "Title length", value: titleLen, score: titleScore, pass: titleScore === 100 },
    { label: "Meta description length", value: descLen, score: descScore, pass: descScore === 100 },
    { label: "Keywords", value: hasKeywords ? "present" : "missing", score: kwScore, pass: !!hasKeywords },
    { label: "Canonical URL", value: hasCanonical ? "present" : "missing", score: canonicalScore, pass: !!hasCanonical },
    { label: "OG title", value: hasOgTitle ? "present" : "missing", score: ogTitleScore, pass: !!hasOgTitle },
    { label: "OG description", value: hasOgDesc ? "present" : "missing", score: ogDescScore, pass: !!hasOgDesc },
    { label: "OG image", value: hasOgImage ? "present" : "missing", score: ogImageScore, pass: !!hasOgImage },
  ];

  const total = Math.round(
    (titleScore + descScore + kwScore + canonicalScore + ogTitleScore + ogDescScore + ogImageScore) / 7
  );

  return { total, checks };
}

export function HomeSEOOverview() {
  const { aboutSection } = useAboutSection();
  const { banners, loading: bannersLoading } = useBanners();
  const [activeTab, setActiveTab] = useState("overview");
  
  const primarySeo = banners?.[0]?.seo || aboutSection?.seo;
  const { total, checks } = getScore(primarySeo);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://personalwings.com";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homepage SEO Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and optimize your homepage SEO settings
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cms/home/banner">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Edit Banner SEO
            </Button>
          </Link>
          <Link href="/cms/home/about-section">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Edit About SEO
            </Button>
          </Link>
        </div>
      </div>

      {bannersLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading SEO data...</p>
          </CardContent>
        </Card>
      ) : !primarySeo ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No SEO data found. Please add SEO information to your Banner or About Section.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Gauge className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="technical">
              <Code className="w-4 h-4 mr-2" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <TrendingUp className="w-4 h-4 mr-2" />
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  SEO Score Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-full">
                    <Progress value={total} className="h-3" />
                  </div>
                  <Badge
                    variant={
                      total >= 85
                        ? "default"
                        : total >= 60
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-lg px-4 py-2"
                  >
                    {total}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {total >= 85
                    ? "Excellent! Your SEO is well optimized."
                    : total >= 60
                    ? "Good! Consider improving a few areas for better SEO."
                    : "Needs improvement. Follow the recommendations below."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {checks.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {c.pass ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">{c.label}</span>
                      </div>
                      <Badge variant={c.pass ? "default" : "destructive"}>
                        {String(c.value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current SEO Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground">Title</p>
                    <p className="text-sm font-medium">{primarySeo?.title || "Not set"}</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground">Meta Description</p>
                    <p className="text-sm">{primarySeo?.description || "Not set"}</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground">Keywords</p>
                    <p className="text-sm">{primarySeo?.keywords || "Not set"}</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground">Canonical URL</p>
                    <p className="text-sm break-all">{primarySeo?.canonicalUrl || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div className="text-xl text-blue-600 mb-1 font-normal">
                    {primarySeo?.title || "Your Page Title"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {primarySeo?.description || "Your meta description goes here"}
                  </div>
                </div>
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
                <div className="border rounded-lg overflow-hidden bg-white">
                  {primarySeo?.ogImage && (
                    <img
                      src={primarySeo.ogImage}
                      alt="OG Preview"
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 uppercase mb-1">{siteUrl}</div>
                    <div className="text-lg font-semibold mb-1">
                      {primarySeo?.ogTitle || primarySeo?.title || "Your Page Title"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {primarySeo?.ogDescription || primarySeo?.description || "Your description"}
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
                      {primarySeo?.ogTitle || primarySeo?.title || "Your Page Title"}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {primarySeo?.ogDescription || primarySeo?.description || "Description"}
                    </div>
                    <div className="text-xs text-gray-400">{siteUrl}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Open Graph Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`<meta property="og:type" content="website" />
<meta property="og:url" content="${primarySeo?.canonicalUrl || siteUrl}" />
<meta property="og:title" content="${primarySeo?.ogTitle || primarySeo?.title || ''}" />
<meta property="og:description" content="${primarySeo?.ogDescription || primarySeo?.description || ''}" />
<meta property="og:image" content="${primarySeo?.ogImage || ''}" />
<meta property="og:site_name" content="Personal Wings" />`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Twitter Card Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@personalwings" />
<meta name="twitter:title" content="${primarySeo?.ogTitle || primarySeo?.title || ''}" />
<meta name="twitter:description" content="${primarySeo?.ogDescription || primarySeo?.description || ''}" />
<meta name="twitter:image" content="${primarySeo?.ogImage || ''}" />`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Structured Data (JSON-LD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Personal Wings",
  "url": "${siteUrl}",
  "description": "${primarySeo?.description || ''}",
  "sameAs": [
    "https://twitter.com/personalwings",
    "https://facebook.com/personalwings"
  ]
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  SEO Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">✓ Title Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep titles between 30-65 characters. Include primary keywords near the beginning.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">✓ Meta Description</h4>
                    <p className="text-sm text-muted-foreground">
                      Write compelling descriptions (120-160 chars) that encourage clicks. Include a call-to-action.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">✓ Keywords</h4>
                    <p className="text-sm text-muted-foreground">
                      Use 5-10 relevant keywords. Focus on long-tail keywords for better targeting.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">✓ Images</h4>
                    <p className="text-sm text-muted-foreground">
                      Use high-quality OG images (1200x630px). Optimize file size for fast loading.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">✓ Mobile Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensure your site is mobile-friendly. Google prioritizes mobile-first indexing.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">✓ Page Speed</h4>
                    <p className="text-sm text-muted-foreground">
                      Optimize images, minify CSS/JS, and use caching for faster load times.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Google Search Console
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://developers.google.com/speed/pagespeed/insights/" target="_blank" rel="noopener">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Check PageSpeed Insights
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.opengraph.xyz/" target="_blank" rel="noopener">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview Open Graph Tags
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

