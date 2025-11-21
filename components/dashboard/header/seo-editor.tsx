"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useHeaderStore } from "@/lib/store/header-store";
import { toast } from "sonner";
import {
  Save,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Globe,
  Image as ImageIcon,
  FileJson,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { Header } from "@/types/header";

interface SEOEditorProps {
  header: Header;
}

export function SEOEditor({ header }: SEOEditorProps) {
  const { updateSEO, loading, error } = useHeaderStore();

  const [seoData, setSeoData] = useState({
    metaTitle: header.seo?.metaTitle || "",
    metaDescription: header.seo?.metaDescription || "",
    keywords: header.seo?.keywords || [],
    ogImage: header.seo?.ogImage || "",
    ogType: header.seo?.ogType || "website",
    twitterCard: header.seo?.twitterCard || "summary_large_image",
    canonicalUrl: header.seo?.canonicalUrl || "",
    structuredData: header.seo?.structuredData || null,
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [structuredDataInput, setStructuredDataInput] = useState(
    JSON.stringify(seoData.structuredData, null, 2)
  );
  const [jsonError, setJsonError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local state when header changes
  useEffect(() => {
    if (header.seo) {
      setSeoData({
        metaTitle: header.seo.metaTitle || "",
        metaDescription: header.seo.metaDescription || "",
        keywords: header.seo.keywords || [],
        ogImage: header.seo.ogImage || "",
        ogType: header.seo.ogType || "website",
        twitterCard: header.seo.twitterCard || "summary_large_image",
        canonicalUrl: header.seo.canonicalUrl || "",
        structuredData: header.seo.structuredData || null,
      });
      setStructuredDataInput(
        JSON.stringify(header.seo.structuredData, null, 2)
      );
    }
  }, [header.seo]);

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !seoData.keywords.includes(keywordInput.trim())
    ) {
      setSeoData({
        ...seoData,
        keywords: [...seoData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeoData({
      ...seoData,
      keywords: seoData.keywords.filter((k) => k !== keyword),
    });
  };

  const handleStructuredDataChange = (value: string) => {
    setStructuredDataInput(value);
    setJsonError("");

    try {
      if (value.trim()) {
        const parsed = JSON.parse(value);
        setSeoData({ ...seoData, structuredData: parsed });
      } else {
        setSeoData({ ...seoData, structuredData: null });
      }
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleSave = async () => {
    if (jsonError) {
      toast.error("Invalid JSON format", {
        description: "Please fix the JSON syntax errors before saving.",
        duration: 4000,
      });
      return;
    }

    try {
      toast.loading("Saving SEO configuration...", {
        id: "save-seo",
        description: "Updating your website's SEO settings.",
      });

      await updateSEO(seoData);

      toast.success("SEO configuration saved successfully! 🚀", {
        id: "save-seo",
        description: "Your SEO settings have been updated and are now live.",
        duration: 4000,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save SEO data:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast.error("Failed to save SEO configuration", {
        id: "save-seo",
        description: errorMessage.includes("Network")
          ? "Please check your internet connection and try again."
          : "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    }
  };

  const handleReset = () => {
    try {
      if (header.seo) {
        setSeoData({
          metaTitle: header.seo.metaTitle || "",
          metaDescription: header.seo.metaDescription || "",
          keywords: header.seo.keywords || [],
          ogImage: header.seo.ogImage || "",
          ogType: header.seo.ogType || "website",
          twitterCard: header.seo.twitterCard || "summary_large_image",
          canonicalUrl: header.seo.canonicalUrl || "",
          structuredData: header.seo.structuredData || null,
        });
        setStructuredDataInput(
          JSON.stringify(header.seo.structuredData, null, 2)
        );
        setJsonError("");

        toast.info("Changes discarded", {
          description: "All unsaved changes have been reverted.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("Failed to reset changes", {
        description: "Please refresh the page to start over.",
        duration: 4000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Manage meta tags, Open Graph, and structured data for better search
            engine visibility
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !!jsonError}
            className="gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            SEO configuration saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic SEO Meta Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Basic Meta Tags
          </CardTitle>
          <CardDescription>
            Primary meta tags for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={seoData.metaTitle}
              onChange={(e) =>
                setSeoData({ ...seoData, metaTitle: e.target.value })
              }
              placeholder="Personal Wings - Premium Aviation Training"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {seoData.metaTitle.length}/60 characters (optimal: 50-60)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={seoData.metaDescription}
              onChange={(e) =>
                setSeoData({ ...seoData, metaDescription: e.target.value })
              }
              placeholder="Join Personal Wings for professional pilot training courses..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {seoData.metaDescription.length}/160 characters (optimal: 150-160)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input
              id="canonicalUrl"
              value={seoData.canonicalUrl}
              onChange={(e) =>
                setSeoData({ ...seoData, canonicalUrl: e.target.value })
              }
              placeholder="https://personalwings.com"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddKeyword())
                }
                placeholder="Add keyword and press Enter"
              />
              <Button
                type="button"
                onClick={handleAddKeyword}
                variant="secondary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {seoData.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="gap-1">
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph / Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Open Graph & Social Media
          </CardTitle>
          <CardDescription>
            Configure how your site appears when shared on social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogImage">Open Graph Image URL</Label>
            <Input
              id="ogImage"
              value={seoData.ogImage}
              onChange={(e) =>
                setSeoData({ ...seoData, ogImage: e.target.value })
              }
              placeholder="https://personalwings.com/og-image.jpg"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x630px
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ogType">Open Graph Type</Label>
              <Input
                id="ogType"
                value={seoData.ogType}
                onChange={(e) =>
                  setSeoData({ ...seoData, ogType: e.target.value })
                }
                placeholder="website"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterCard">Twitter Card Type</Label>
              <Input
                id="twitterCard"
                value={seoData.twitterCard}
                onChange={(e) =>
                  setSeoData({ ...seoData, twitterCard: e.target.value })
                }
                placeholder="summary_large_image"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Data (JSON-LD) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Structured Data (JSON-LD)
          </CardTitle>
          <CardDescription>
            Schema.org structured data for rich search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jsonError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{jsonError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="structuredData">JSON-LD Schema</Label>
            <Textarea
              id="structuredData"
              value={structuredDataInput}
              onChange={(e) => handleStructuredDataChange(e.target.value)}
              placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}'
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Valid JSON-LD schema. See{" "}
              <a
                href="https://schema.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                schema.org
              </a>{" "}
              for documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
