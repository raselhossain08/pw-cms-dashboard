"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Search,
  Download,
  Copy,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useContact } from "@/hooks/useContact";
import type {
  ContactInfo,
  ContactFormSection,
  MapSection,
  SeoMeta,
  UpdateContactDto,
} from "@/lib/services/contact.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ContactEditor() {
  const {
    contact,
    loading,
    saving,
    uploadProgress,
    fetchContact,
    updateContact,
    updateContactWithUpload,
    toggleActive,
    duplicateContact,
    exportContact,
    refreshContact,
  } = useContact();

  const [activeTab, setActiveTab] = useState("contact-info");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [localUploadProgress, setLocalUploadProgress] = useState(0);

  const [formData, setFormData] = useState<UpdateContactDto>({
    contactInfo: {
      email: "",
      location: "",
      phone: "",
    },
    contactFormSection: {
      badge: "",
      title: "",
      image: "",
      imageAlt: "",
    },
    mapSection: {
      embedUrl: "",
      showMap: true,
    },
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      ogTitle: "",
      ogDescription: "",
      canonicalUrl: "",
    },
    isActive: true,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        contactInfo: contact.contactInfo || {
          email: "",
          location: "",
          phone: "",
        },
        contactFormSection: contact.contactFormSection ||
          (contact as any).formSection || {
            badge: "",
            title: "",
            image: "",
            imageAlt: "",
          },
        mapSection: contact.mapSection || {
          embedUrl: "",
          showMap: true,
        },
        seo: contact.seo || {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          ogTitle: "",
          ogDescription: "",
          canonicalUrl: "",
        },
        isActive: contact.isActive ?? true,
      });
      setImagePreview(
        contact.contactFormSection?.image ||
          (contact as any).formSection?.image ||
          ""
      );
    }
  }, [contact]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");
    formData.append("description", "Contact page image");

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    // Get auth token from cookies
    let token: string | null | undefined;
    try {
      const { cookieService } = await import("@/lib/cookie.service");
      token = cookieService.get("token");
    } catch (e) {
      // Token not available, continue without it
    }

    // Use XMLHttpRequest for upload progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setLocalUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            const url = response.data?.url || response.data?.data?.url;
            if (url) {
              resolve(url);
            } else {
              reject(new Error("Invalid response format"));
            }
          } catch (error) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", `${API_BASE_URL}/uploads/upload`);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFile) {
      const submitFormData = new FormData();
      submitFormData.append("image", imageFile);
      submitFormData.append(
        "contactInfo[email]",
        formData.contactInfo?.email || ""
      );
      submitFormData.append(
        "contactInfo[location]",
        formData.contactInfo?.location || ""
      );
      if (formData.contactInfo?.phone) {
        submitFormData.append("contactInfo[phone]", formData.contactInfo.phone);
      }
      submitFormData.append(
        "contactFormSection[badge]",
        formData.contactFormSection?.badge || ""
      );
      submitFormData.append(
        "contactFormSection[title]",
        formData.contactFormSection?.title || ""
      );
      if (formData.contactFormSection?.image) {
        submitFormData.append(
          "contactFormSection[image]",
          formData.contactFormSection.image
        );
      }
      if (formData.contactFormSection?.imageAlt) {
        submitFormData.append(
          "contactFormSection[imageAlt]",
          formData.contactFormSection.imageAlt
        );
      }
      submitFormData.append(
        "mapSection[embedUrl]",
        formData.mapSection?.embedUrl || ""
      );
      submitFormData.append(
        "mapSection[showMap]",
        String(formData.mapSection?.showMap ?? true)
      );
      if (formData.seo?.title)
        submitFormData.append("seo[title]", formData.seo.title);
      if (formData.seo?.description)
        submitFormData.append("seo[description]", formData.seo.description);
      if (formData.seo?.keywords)
        submitFormData.append("seo[keywords]", formData.seo.keywords);
      if (formData.seo?.ogImage)
        submitFormData.append("seo[ogImage]", formData.seo.ogImage);
      if (formData.seo?.ogTitle)
        submitFormData.append("seo[ogTitle]", formData.seo.ogTitle);
      if (formData.seo?.ogDescription)
        submitFormData.append("seo[ogDescription]", formData.seo.ogDescription);
      if (formData.seo?.canonicalUrl)
        submitFormData.append("seo[canonicalUrl]", formData.seo.canonicalUrl);
      submitFormData.append("isActive", String(formData.isActive ?? true));

      await updateContactWithUpload(submitFormData);
      setImageFile(null);
      await refreshContact();
    } else {
      const updateData: UpdateContactDto = {
        contactInfo: formData.contactInfo,
        contactFormSection: formData.contactFormSection,
        mapSection: formData.mapSection,
        seo: formData.seo,
        isActive: formData.isActive,
      };
      await updateContact(updateData);
      await refreshContact();
    }
  };

  const handleDuplicate = async () => {
    await duplicateContact();
    await refreshContact();
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      await exportContact(format);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Contact Page Management
          </h2>
          <p className="text-muted-foreground">
            Manage contact information, form section, and SEO settings
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={contact?.isActive ? "default" : "secondary"}>
            {contact?.isActive ? (
              <>
                <Eye className="w-3 h-3 mr-1" /> Active
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" /> Inactive
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!contact || saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {contact?._id && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting || saving}>
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={handleDuplicate}
                disabled={saving}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await toggleActive();
                  await refreshContact();
                }}
                disabled={saving}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${saving ? "animate-spin" : ""}`}
                />
                Toggle Active
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={refreshContact}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-3 gap-1 sm:gap-2 p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-x-auto">
            <TabsTrigger
              value="contact-info"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-[100px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="form-section"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-[100px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Form Section</span>
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>SEO</span>
            </TabsTrigger>
          </TabsList>

          {/* Contact Info Tab */}
          <TabsContent value="contact-info">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Manage email, location, and phone number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contactInfo?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo!,
                            email: e.target.value,
                          },
                        })
                      }
                      placeholder="letsfly@personalwings.com"
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.contactInfo?.location || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo!,
                            location: e.target.value,
                          },
                        })
                      }
                      placeholder="San Diego, CA, USA"
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.contactInfo?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo!,
                            phone: e.target.value,
                          },
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Map Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Map</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Display Google Maps embed on contact page
                        </p>
                      </div>
                      <Switch
                        checked={formData.mapSection?.showMap ?? true}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            mapSection: {
                              ...formData.mapSection!,
                              showMap: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="embedUrl">Google Maps Embed URL</Label>
                      <Textarea
                        id="embedUrl"
                        value={formData.mapSection?.embedUrl || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mapSection: {
                              ...formData.mapSection!,
                              embedUrl: e.target.value,
                            },
                          })
                        }
                        placeholder="https://www.google.com/maps/embed?pb=..."
                        rows={3}
                        className="bg-white dark:bg-gray-700 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get embed URL from Google Maps &gt; Share &gt; Embed a
                        map
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Section Tab */}
          <TabsContent value="form-section">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-green-500" />
                  Contact Form Section
                </CardTitle>
                <CardDescription>
                  Manage badge, title, and illustration image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="badge">
                      Badge Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="badge"
                      value={formData.contactFormSection?.badge || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactFormSection: {
                            ...formData.contactFormSection!,
                            badge: e.target.value,
                          },
                        })
                      }
                      placeholder="Get In Touch"
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.contactFormSection?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactFormSection: {
                            ...formData.contactFormSection!,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder="Ready to Start Your Aviation Journey?"
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    Illustration Image
                  </h3>

                  <div className="space-y-4">
                    {/* Image Preview Section */}
                    {imagePreview && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {imageFile ? "New Image Preview" : "Current Image"}
                        </Label>
                        <div className="relative w-full max-w-md mx-auto">
                          <div className="relative w-full h-64 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <Image
                              src={imagePreview}
                              alt="Contact illustration preview"
                              fill
                              className="object-contain p-4"
                            />
                          </div>
                          {imageFile && (
                            <Badge
                              variant="default"
                              className="absolute top-2 right-2 bg-green-500 text-white"
                            >
                              New Upload
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* File Upload Input */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="image-upload"
                        className="text-sm font-medium"
                      >
                        {imagePreview ? "Change Image" : "Upload New Image"}
                      </Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="bg-white dark:bg-gray-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-100"
                          />
                        </div>
                        {imageFile && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Upload className="w-3 h-3 mr-1" />
                              Selected: {imageFile.name}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(
                                  contact?.contactFormSection?.image || ""
                                );
                              }}
                              className="h-6 text-xs"
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Recommended: SVG or PNG, 500x500px or larger. Max file
                          size: 10MB
                        </p>
                      </div>
                    </div>

                    {/* Upload Progress Bar */}
                    {uploadProgress > 0 && (
                      <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {uploadProgress < 100
                                ? "Uploading image..."
                                : "Upload complete!"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {uploadProgress}%
                          </span>
                        </div>
                        <Progress
                          value={uploadProgress}
                          className="h-2 bg-blue-200 dark:bg-blue-950"
                        />
                        {uploadProgress === 100 && (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Badge
                              variant="default"
                              className="h-4 w-4 p-0 rounded-full bg-green-500"
                            >
                              ✓
                            </Badge>
                            Image uploaded successfully
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="imageAlt">Image Alt Text</Label>
                      <Input
                        id="imageAlt"
                        value={formData.contactFormSection?.imageAlt || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactFormSection: {
                              ...formData.contactFormSection!,
                              imageAlt: e.target.value,
                            },
                          })
                        }
                        placeholder="Customer support illustration"
                        className="bg-white dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Describe the image for accessibility and SEO
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-500" />
                  SEO Optimization
                </CardTitle>
                <CardDescription>
                  Optimize contact page for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">Page Title</Label>
                    <Input
                      id="seo-title"
                      value={formData.seo?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo!, title: e.target.value },
                        })
                      }
                      placeholder="Contact Us - Personal Wings"
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo-description">Meta Description</Label>
                    <Textarea
                      id="seo-description"
                      value={formData.seo?.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo!,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Get in touch with Personal Wings for aviation training inquiries..."
                      rows={3}
                      className="bg-white dark:bg-gray-700"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      150-160 characters recommended
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo-keywords">Keywords</Label>
                    <Input
                      id="seo-keywords"
                      value={formData.seo?.keywords || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo!, keywords: e.target.value },
                        })
                      }
                      placeholder="contact, aviation training, flight school, inquiries"
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="border-t dark:border-gray-700 pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Open Graph (Social Media)
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="og-title">OG Title</Label>
                        <Input
                          id="og-title"
                          value={formData.seo?.ogTitle || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seo: {
                                ...formData.seo!,
                                ogTitle: e.target.value,
                              },
                            })
                          }
                          placeholder="Contact Personal Wings"
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="og-description">OG Description</Label>
                        <Textarea
                          id="og-description"
                          value={formData.seo?.ogDescription || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seo: {
                                ...formData.seo!,
                                ogDescription: e.target.value,
                              },
                            })
                          }
                          placeholder="Reach out to Personal Wings for all your aviation training needs"
                          rows={2}
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="og-image">OG Image URL</Label>
                        <Input
                          id="og-image"
                          value={formData.seo?.ogImage || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seo: {
                                ...formData.seo!,
                                ogImage: e.target.value,
                              },
                            })
                          }
                          placeholder="https://example.com/og-image.jpg"
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="canonical">Canonical URL</Label>
                        <Input
                          id="canonical"
                          value={formData.seo?.canonicalUrl || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seo: {
                                ...formData.seo!,
                                canonicalUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="https://personalwings.com/contact"
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fixed Action Bar */}
        <Card className="mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl sticky bottom-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="active-toggle">Active</Label>
                  <Switch
                    id="active-toggle"
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
                {contact && (
                  <Badge
                    variant={contact.isActive ? "default" : "secondary"}
                    className="hidden sm:inline-flex"
                  >
                    {contact.isActive ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={refreshContact}
                  disabled={loading || saving}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
          </CardContent>
        </Card>
      </form>

      {/* Upload Progress Indicator */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading media...</span>
                  <span className="text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Page Preview</DialogTitle>
            <DialogDescription>
              Preview how your contact page will appear to users
            </DialogDescription>
          </DialogHeader>
          {contact && (
            <div className="space-y-6 mt-4">
              {/* Contact Info Preview */}
              {contact.contactInfo && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.contactInfo.location}</span>
                    </div>
                    {contact.contactInfo.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{contact.contactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Section Preview */}
              {(contact.contactFormSection || (contact as any).formSection) && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Form Section</h3>
                  <div className="p-4 border rounded-lg space-y-2">
                    {(
                      contact.contactFormSection || (contact as any).formSection
                    )?.badge && (
                      <Badge variant="outline">
                        {
                          (
                            contact.contactFormSection ||
                            (contact as any).formSection
                          )?.badge
                        }
                      </Badge>
                    )}
                    <h4 className="text-xl font-bold">
                      {
                        (
                          contact.contactFormSection ||
                          (contact as any).formSection
                        )?.title
                      }
                    </h4>
                    {(
                      contact.contactFormSection || (contact as any).formSection
                    )?.image && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden mt-4">
                        <img
                          src={
                            (
                              contact.contactFormSection ||
                              (contact as any).formSection
                            )?.image
                          }
                          alt={
                            (
                              contact.contactFormSection ||
                              (contact as any).formSection
                            )?.imageAlt || "Form Section Image"
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Map Section Preview */}
              {contact.mapSection && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Map Section</h3>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          contact.mapSection.showMap ? "default" : "secondary"
                        }
                      >
                        {contact.mapSection.showMap
                          ? "Map Visible"
                          : "Map Hidden"}
                      </Badge>
                    </div>
                    {contact.mapSection.embedUrl && (
                      <div className="text-sm text-muted-foreground">
                        Map URL: {contact.mapSection.embedUrl.substring(0, 50)}
                        ...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEO Preview */}
              {contact.seo && (
                <div className="space-y-2">
                  <h3 className="font-semibold">SEO Metadata</h3>
                  <div className="p-4 border rounded-lg space-y-2">
                    {contact.seo.title && (
                      <p className="font-medium">{contact.seo.title}</p>
                    )}
                    {contact.seo.description && (
                      <p className="text-sm text-muted-foreground">
                        {contact.seo.description}
                      </p>
                    )}
                    {contact.seo.keywords && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.seo.keywords
                          .split(",")
                          .slice(0, 5)
                          .map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {keyword.trim()}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <h3 className="font-semibold">Status</h3>
                <Badge variant={contact.isActive ? "default" : "secondary"}>
                  {contact.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
