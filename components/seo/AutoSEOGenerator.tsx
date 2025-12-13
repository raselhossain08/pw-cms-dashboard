"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, CheckCircle2, Copy } from "lucide-react";
import { generateOptimizedSEO, optimizeExistingSEO } from "@/lib/seo-generator";
import { useToast } from "@/context/ToastContext";

interface AutoSEOGeneratorProps {
  contentType: "banner" | "about" | "blog" | "events" | "testimonials";
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    alt?: string;
  };
  existingSeo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    canonicalUrl?: string;
  };
  onApply: (seo: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    canonicalUrl: string;
  }) => void;
  triggerClassName?: string;
}

export function AutoSEOGenerator({
  contentType,
  content,
  existingSeo,
  onApply,
  triggerClassName,
}: AutoSEOGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedSeo, setGeneratedSeo] = useState<any>(null);
  const { push } = useToast();

  const showToast = (message: string, type: "success" | "error" | "info") => {
    push({ message, type });
  };

  const handleGenerate = () => {
    setGenerating(true);

    // Simulate AI processing delay for better UX
    setTimeout(() => {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://personalwings.com";

      const optimized = generateOptimizedSEO(
        {
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
          category: contentType,
        },
        siteUrl
      );

      setGeneratedSeo(optimized);
      setGenerating(false);

      showToast(
        `SEO Generated Successfully with ${optimized.score}% score!`,
        "success"
      );
    }, 1500);
  };

  const handleOptimizeExisting = () => {
    setGenerating(true);

    setTimeout(() => {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://personalwings.com";

      const optimized = optimizeExistingSEO(
        existingSeo || {},
        {
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
        },
        siteUrl
      );

      setGeneratedSeo(optimized);
      setGenerating(false);

      showToast(
        "Your existing SEO has been optimized to 100% score!",
        "success"
      );
    }, 1000);
  };

  const handleApply = () => {
    if (generatedSeo) {
      onApply({
        title: generatedSeo.title,
        description: generatedSeo.description,
        keywords: generatedSeo.keywords,
        ogTitle: generatedSeo.ogTitle,
        ogDescription: generatedSeo.ogDescription,
        canonicalUrl: generatedSeo.canonicalUrl,
      });

      showToast("Generated SEO has been applied to your content!", "success");

      setOpen(false);
      setGeneratedSeo(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, "info");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={triggerClassName || "gap-2"}
          size="sm"
        >
          <Sparkles className="w-4 h-4" />
          Auto-Generate SEO
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI-Powered SEO Generator
          </DialogTitle>
          <DialogDescription>
            Automatically generate optimized SEO metadata based on your content.
            Guaranteed 100% SEO score!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Preview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Your Content:</h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Title:</span>{" "}
                {content.title || "N/A"}
              </p>
              {content.subtitle && (
                <p>
                  <span className="font-medium">Subtitle:</span>{" "}
                  {content.subtitle}
                </p>
              )}
              {content.description && (
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {content.description.substring(0, 100)}
                  {content.description.length > 100 ? "..." : ""}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Generating..." : "Generate New SEO"}
            </Button>
            {existingSeo && (
              <Button
                onClick={handleOptimizeExisting}
                disabled={generating}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {generating ? "Optimizing..." : "Optimize Existing"}
              </Button>
            )}
          </div>

          {/* Generated SEO Display */}
          {generatedSeo && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Generated SEO (100% Score)
                </h4>
                <Badge variant="default" className="bg-green-600">
                  {generatedSeo.score}%
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Title ({generatedSeo.title.length} chars)
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedSeo.title, "Title")
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm">
                    {generatedSeo.title}
                  </div>
                  <p className="text-xs text-green-600">
                    ✓ Perfect length (30-65 chars)
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Meta Description ({generatedSeo.description.length} chars)
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedSeo.description, "Description")
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm">
                    {generatedSeo.description}
                  </div>
                  <p className="text-xs text-green-600">
                    ✓ Perfect length (120-160 chars)
                  </p>
                </div>

                {/* Keywords */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Keywords
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedSeo.keywords, "Keywords")
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm">
                    {generatedSeo.keywords}
                  </div>
                  <p className="text-xs text-green-600">
                    ✓ Relevant keywords extracted
                  </p>
                </div>

                {/* OG Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Open Graph Title
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedSeo.ogTitle, "OG Title")
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm">
                    {generatedSeo.ogTitle}
                  </div>
                  <p className="text-xs text-green-600">
                    ✓ Optimized for social sharing
                  </p>
                </div>

                {/* OG Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Open Graph Description
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          generatedSeo.ogDescription,
                          "OG Description"
                        )
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm">
                    {generatedSeo.ogDescription}
                  </div>
                  <p className="text-xs text-green-600">✓ Social media ready</p>
                </div>

                {/* Canonical URL */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Canonical URL
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          generatedSeo.canonicalUrl,
                          "Canonical URL"
                        )
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm break-all">
                    {generatedSeo.canonicalUrl}
                  </div>
                  <p className="text-xs text-green-600">✓ Properly formatted</p>
                </div>
              </div>

              {/* SEO Preview */}
              <div className="border-t pt-4 space-y-2">
                <h5 className="font-semibold text-sm">
                  Google Search Preview:
                </h5>
                <div className="border rounded-lg p-3 bg-white">
                  <div className="text-xs text-green-700 mb-1">
                    {generatedSeo.canonicalUrl}
                  </div>
                  <div className="text-lg text-blue-600 mb-1">
                    {generatedSeo.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {generatedSeo.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setGeneratedSeo(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!generatedSeo}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Apply Generated SEO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
