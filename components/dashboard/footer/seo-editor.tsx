"use client";

import React, { useState, useEffect } from "react";
import { useFooterEditor } from "@/hooks/use-footer-editor";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Globe,
  Shield,
  Eye,
  Code,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Footer } from "@/types/footer";
import { toast } from "sonner";

interface FooterSEOEditorProps {
  footer: Footer;
}

export function FooterSEOEditor({ footer }: FooterSEOEditorProps) {
  const { updateSEO, isSaving } = useFooterEditor();
  const [seoData, setSeoData] = useState(footer.seo);
  const [customSchema, setCustomSchema] = useState("");
  const [isValidSchema, setIsValidSchema] = useState(true);
  const [previewMode, setPreviewMode] = useState<"accessibility" | "schema">(
    "accessibility"
  );

  useEffect(() => {
    setSeoData(footer.seo);
    if (footer.seo.footerSchema) {
      setCustomSchema(JSON.stringify(footer.seo.footerSchema, null, 2));
    }
  }, [footer.seo]);

  const validateSchema = (schemaText: string) => {
    try {
      if (schemaText.trim()) {
        JSON.parse(schemaText);
      }
      setIsValidSchema(true);
      return true;
    } catch (error) {
      setIsValidSchema(false);
      return false;
    }
  };

  const handleSchemaChange = (value: string) => {
    setCustomSchema(value);
    validateSchema(value);
  };

  const handleSave = async () => {
    try {
      let updatedSeo = { ...seoData };

      // Parse and set custom schema if provided
      if (customSchema.trim()) {
        if (isValidSchema) {
          updatedSeo.footerSchema = JSON.parse(customSchema);
        } else {
          toast.error("Please fix the JSON schema before saving");
          return;
        }
      } else {
        updatedSeo.footerSchema = null;
      }

      await updateSEO(updatedSeo);
      toast.success("SEO configuration updated successfully!");
    } catch (error) {
      console.error("Failed to update SEO configuration:", error);
      toast.error("Failed to update SEO configuration");
    }
  };

  const generateDefaultSchema = () => {
    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: footer.copyright?.companyName || "Your Company",
      url: "https://yourwebsite.com",
      logo: {
        "@type": "ImageObject",
        url: "https://yourwebsite.com/logo.png",
      },
      description: footer.description?.text || "Your company description",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: footer.contact?.phone?.number || "+1-555-0123",
        contactType: "Customer Service",
      },
    };

    setCustomSchema(JSON.stringify(defaultSchema, null, 2));
    setIsValidSchema(true);
  };

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(customSchema);
    toast.success("Schema copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* SEO Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            SEO Overview
          </CardTitle>
          <CardDescription>
            Configure SEO and accessibility settings for your footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Schema Ready</span>
              </div>
              <p className="text-sm text-green-700">
                Structured data will be automatically generated
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Multi-language
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Accessibility labels configured
              </p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">ARIA Labels</span>
              </div>
              <p className="text-sm text-purple-700">Screen reader optimized</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              SEO Configuration
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={
                  previewMode === "accessibility" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setPreviewMode("accessibility")}
                className="text-xs"
              >
                Accessibility
              </Button>
              <Button
                variant={previewMode === "schema" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("schema")}
                className="text-xs"
              >
                Schema
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewMode === "accessibility" ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">ARIA Labels</Label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="footer-label"
                      className="text-xs text-gray-600"
                    >
                      Footer Label
                    </Label>
                    <Input
                      id="footer-label"
                      value={seoData.accessibility.ariaLabels.footer}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          accessibility: {
                            ...seoData.accessibility,
                            ariaLabels: {
                              ...seoData.accessibility.ariaLabels,
                              footer: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Website footer"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="social-links-label"
                      className="text-xs text-gray-600"
                    >
                      Social Links Label
                    </Label>
                    <Input
                      id="social-links-label"
                      value={seoData.accessibility.ariaLabels.socialLinks}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          accessibility: {
                            ...seoData.accessibility,
                            ariaLabels: {
                              ...seoData.accessibility.ariaLabels,
                              socialLinks: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Social media links"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newsletter-label"
                      className="text-xs text-gray-600"
                    >
                      Newsletter Label
                    </Label>
                    <Input
                      id="newsletter-label"
                      value={seoData.accessibility.ariaLabels.newsletter}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          accessibility: {
                            ...seoData.accessibility,
                            ariaLabels: {
                              ...seoData.accessibility.ariaLabels,
                              newsletter: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Newsletter subscription"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="sections-label"
                      className="text-xs text-gray-600"
                    >
                      Sections Label
                    </Label>
                    <Input
                      id="sections-label"
                      value={seoData.accessibility.ariaLabels.sections}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          accessibility: {
                            ...seoData.accessibility,
                            ariaLabels: {
                              ...seoData.accessibility.ariaLabels,
                              sections: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Footer navigation sections"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <Label
                      htmlFor="bottom-links-label"
                      className="text-xs text-gray-600"
                    >
                      Bottom Links Label
                    </Label>
                    <Input
                      id="bottom-links-label"
                      value={seoData.accessibility.ariaLabels.bottomLinks}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          accessibility: {
                            ...seoData.accessibility,
                            ariaLabels: {
                              ...seoData.accessibility.ariaLabels,
                              bottomLinks: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Legal and policy links"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These ARIA labels help screen readers understand your footer
                  structure, improving accessibility for users with visual
                  impairments.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Custom JSON-LD Schema
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateDefaultSchema}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate Default
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySchemaToClipboard}
                    disabled={!customSchema}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={customSchema}
                  onChange={(e) => handleSchemaChange(e.target.value)}
                  placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company"\n}'
                  className={`font-mono text-sm min-h-[300px] ${
                    !isValidSchema ? "border-red-300 focus:border-red-500" : ""
                  }`}
                  style={{ resize: "vertical" }}
                />
                {!isValidSchema && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Invalid JSON format. Please check your syntax.
                  </div>
                )}
                {isValidSchema && customSchema && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Valid JSON schema
                  </div>
                )}
              </div>

              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Optional:</strong> Add custom JSON-LD structured data
                  for enhanced SEO. Leave empty to use auto-generated schemas
                  based on your footer content.
                  <br />
                  <a
                    href="https://schema.org/Organization"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Learn about Schema.org Organization →
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || !isValidSchema}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Save SEO Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
