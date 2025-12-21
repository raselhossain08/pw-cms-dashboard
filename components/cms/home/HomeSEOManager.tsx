"use client";

import React, { useState, useEffect } from "react";
import { useHomeSEO, type HomeSEOData } from "@/hooks/useHomeSEO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  RefreshCw,
  Search,
  Globe,
  Twitter,
  Code,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Eye,
  PlusCircle,
  X,
} from "lucide-react";

export function HomeSEOManager() {
  const { seoData, loading, saving, updateSEO, resetToDefaults, refreshSEO } =
    useHomeSEO();

  const [formData, setFormData] = useState<Partial<HomeSEOData>>({
    title: "",
    description: "",
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    canonical: "",
    robots: "index, follow",
    author: "",
    locale: "en_US",
    siteName: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (seoData) {
      setFormData({
        title: seoData.title || "",
        description: seoData.description || "",
        keywords: seoData.keywords || [],
        ogTitle: seoData.ogTitle || seoData.title || "",
        ogDescription: seoData.ogDescription || seoData.description || "",
        ogImage: seoData.ogImage || "",
        twitterCard: seoData.twitterCard || "summary_large_image",
        twitterTitle: seoData.twitterTitle || seoData.title || "",
        twitterDescription:
          seoData.twitterDescription || seoData.description || "",
        twitterImage: seoData.twitterImage || seoData.ogImage || "",
        canonical: seoData.canonical || "",
        robots: seoData.robots || "index, follow",
        author: seoData.author || "",
        locale: seoData.locale || "en_US",
        siteName: seoData.siteName || "",
      });
    }
  }, [seoData]);

  const handleInputChange = (field: keyof HomeSEOData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords?.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords?.filter((k) => k !== keyword) || [],
    }));
  };

  const handleSave = async () => {
    await updateSEO(formData);
  };

  const handleReset = async () => {
    if (
      confirm(
        "Are you sure you want to reset all SEO data to defaults? This action cannot be undone."
      )
    ) {
      const defaults = await resetToDefaults();
      if (defaults) {
        setFormData(defaults);
      }
    }
  };

  const handleAutoFill = () => {
    setFormData((prev) => ({
      ...prev,
      ogTitle: prev.ogTitle || prev.title,
      ogDescription: prev.ogDescription || prev.description,
      twitterTitle: prev.twitterTitle || prev.title,
      twitterDescription: prev.twitterDescription || prev.description,
      twitterImage: prev.twitterImage || prev.ogImage,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Homepage SEO Configuration
              </CardTitle>
              <CardDescription>
                Optimize your homepage for search engines and social media
                platforms
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAutoFill}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-fill Social
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SEO Quality Check */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>SEO Quality Score:</span>
            <Badge
              variant={
                formData.title &&
                formData.description &&
                formData.keywords &&
                formData.keywords.length >= 3
                  ? "default"
                  : "secondary"
              }
            >
              {formData.title &&
              formData.description &&
              formData.keywords &&
              formData.keywords.length >= 3
                ? "Good"
                : "Needs Improvement"}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Tabbed Content */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <Search className="w-4 h-4 mr-2" />
            Basic SEO
          </TabsTrigger>
          <TabsTrigger value="opengraph">
            <Globe className="w-4 h-4 mr-2" />
            Open Graph
          </TabsTrigger>
          <TabsTrigger value="twitter">
            <Twitter className="w-4 h-4 mr-2" />
            Twitter Cards
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Code className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Basic SEO Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic SEO Settings</CardTitle>
              <CardDescription>
                Essential meta tags for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  placeholder="Home - Your Amazing Website"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title?.length || 0}/60 characters (recommended:
                  50-60)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Meta Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your homepage in 150-160 characters..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description?.length || 0}/160 characters
                  (recommended: 150-160)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a keyword and press Enter"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddKeyword}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords?.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.keywords?.length || 0} keywords (recommended: 5-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your Company Name"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Open Graph Tab */}
        <TabsContent value="opengraph" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Graph Meta Tags</CardTitle>
              <CardDescription>
                Optimize how your page appears when shared on Facebook,
                LinkedIn, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  placeholder={formData.title || "Auto-filled from page title"}
                  value={formData.ogTitle}
                  onChange={(e) => handleInputChange("ogTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  placeholder={
                    formData.description || "Auto-filled from meta description"
                  }
                  value={formData.ogDescription}
                  onChange={(e) =>
                    handleInputChange("ogDescription", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  type="url"
                  placeholder="https://yoursite.com/og-image.jpg"
                  value={formData.ogImage}
                  onChange={(e) => handleInputChange("ogImage", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630px
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  placeholder="Your Website Name"
                  value={formData.siteName}
                  onChange={(e) =>
                    handleInputChange("siteName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locale">Locale</Label>
                <Input
                  id="locale"
                  placeholder="en_US"
                  value={formData.locale}
                  onChange={(e) => handleInputChange("locale", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Twitter Cards Tab */}
        <TabsContent value="twitter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Twitter Card Meta Tags</CardTitle>
              <CardDescription>
                Optimize how your page appears when shared on Twitter/X
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitterCard">Twitter Card Type</Label>
                <select
                  id="twitterCard"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.twitterCard}
                  onChange={(e) =>
                    handleInputChange("twitterCard", e.target.value)
                  }
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">
                    Summary Large Image
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterTitle">Twitter Title</Label>
                <Input
                  id="twitterTitle"
                  placeholder={formData.title || "Auto-filled from page title"}
                  value={formData.twitterTitle}
                  onChange={(e) =>
                    handleInputChange("twitterTitle", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterDescription">Twitter Description</Label>
                <Textarea
                  id="twitterDescription"
                  placeholder={
                    formData.description || "Auto-filled from meta description"
                  }
                  value={formData.twitterDescription}
                  onChange={(e) =>
                    handleInputChange("twitterDescription", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterImage">Twitter Image URL</Label>
                <Input
                  id="twitterImage"
                  type="url"
                  placeholder={
                    formData.ogImage || "https://yoursite.com/twitter-image.jpg"
                  }
                  value={formData.twitterImage}
                  onChange={(e) =>
                    handleInputChange("twitterImage", e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x675px for large image, 120x120px for
                  summary
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEO Settings</CardTitle>
              <CardDescription>Technical SEO configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  type="url"
                  placeholder="https://yoursite.com/"
                  value={formData.canonical}
                  onChange={(e) =>
                    handleInputChange("canonical", e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Specify the preferred URL for this page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots">Robots Meta Tag</Label>
                <select
                  id="robots"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.robots}
                  onChange={(e) => handleInputChange("robots", e.target.value)}
                >
                  <option value="index, follow">
                    Index, Follow (Recommended)
                  </option>
                  <option value="noindex, follow">No Index, Follow</option>
                  <option value="index, nofollow">Index, No Follow</option>
                  <option value="noindex, nofollow">No Index, No Follow</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Control how search engines crawl and index this page
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Preview</CardTitle>
            <CardDescription>
              How your page might appear in search results and social media
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Search Preview */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Google Search Result
              </h4>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                  {formData.title || "Page Title"}
                </div>
                <div className="text-sm text-green-700 mt-1">
                  {formData.canonical || "https://yoursite.com"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.description ||
                    "Meta description will appear here..."}
                </div>
              </div>
            </div>

            {/* Facebook/OG Preview */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Facebook / Open Graph
              </h4>
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {formData.ogImage && (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <img
                      src={formData.ogImage}
                      alt="OG Preview"
                      className="max-w-full max-h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-sm font-semibold">
                    {formData.ogTitle || formData.title || "Page Title"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.ogDescription ||
                      formData.description ||
                      "Description"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.siteName || "yoursite.com"}
                  </div>
                </div>
              </div>
            </div>

            {/* Twitter Preview */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Twitter Card</h4>
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {formData.twitterImage &&
                  formData.twitterCard === "summary_large_image" && (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <img
                        src={formData.twitterImage}
                        alt="Twitter Preview"
                        className="max-w-full max-h-full object-cover"
                      />
                    </div>
                  )}
                <div className="p-4">
                  <div className="text-sm font-semibold">
                    {formData.twitterTitle || formData.title || "Page Title"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.twitterDescription ||
                      formData.description ||
                      "Description"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
