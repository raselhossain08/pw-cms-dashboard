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
  Plus,
  Trash2,
  Image as ImageIcon,
  Heart,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { useAboutSection } from "@/hooks/useAboutSection";
import type {
  AboutSection,
  UpdateAboutSectionDto,
  Highlight,
  Stat,
  CTA,
  SeoMeta,
} from "@/lib/types/about-section";

export function AboutSectionEditor() {
  const {
    aboutSection,
    loading,
    uploadProgress,
    fetchAboutSection,
    updateAboutSection,
    updateAboutSectionWithMedia,
    toggleActive,
  } = useAboutSection();

  const [activeTab, setActiveTab] = useState("content");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<
    UpdateAboutSectionDto & { imageFile?: File }
  >({
    id: "about",
    title: "",
    subtitle: "",
    description: "",
    image: "",
    highlights: [],
    cta: { label: "", link: "" },
    stats: [],
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

  // Load data when aboutSection changes
  useEffect(() => {
    if (aboutSection) {
      setFormData({
        id: aboutSection.id || "about",
        title: aboutSection.title || "",
        subtitle: aboutSection.subtitle || "",
        description: aboutSection.description || "",
        image: aboutSection.image || "",
        highlights: aboutSection.highlights || [],
        cta: aboutSection.cta || { label: "", link: "" },
        stats: aboutSection.stats || [],
        seo: aboutSection.seo || {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          ogTitle: "",
          ogDescription: "",
          canonicalUrl: "",
        },
        isActive: aboutSection.isActive ?? true,
      });
      setImagePreview(aboutSection.image || "");
    }
  }, [aboutSection]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Add image file if present
      if (imageFile) {
        submitFormData.append("image", imageFile);
      }

      // Add text fields
      submitFormData.append("id", formData.id || "about");
      submitFormData.append("title", formData.title || "");
      submitFormData.append("subtitle", formData.subtitle || "");
      submitFormData.append("description", formData.description || "");

      // Only send image URL if no file is being uploaded and it's a valid URL
      if (!imageFile && formData.image && formData.image.startsWith("http")) {
        submitFormData.append("image", formData.image);
      }

      // Add highlights array
      formData.highlights?.forEach((highlight, index) => {
        submitFormData.append(
          `highlights[${index}][icon]`,
          highlight.icon || ""
        );
        submitFormData.append(
          `highlights[${index}][label]`,
          highlight.label || ""
        );
        submitFormData.append(
          `highlights[${index}][text]`,
          highlight.text || ""
        );
      });

      // Add CTA
      submitFormData.append("cta[label]", formData.cta?.label || "");
      submitFormData.append("cta[link]", formData.cta?.link || "");

      // Add stats array
      formData.stats?.forEach((stat, index) => {
        submitFormData.append(
          `stats[${index}][value]`,
          String(stat.value || 0)
        );
        submitFormData.append(`stats[${index}][suffix]`, stat.suffix || "");
        submitFormData.append(`stats[${index}][label]`, stat.label || "");
      });

      // Add SEO fields
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

      await updateAboutSectionWithMedia(submitFormData);
      setImageFile(null);
      fetchAboutSection();
    } catch (error) {
      console.error("Failed to update about section:", error);
    }
  };

  const handleQuickUpdate = async (
    field: keyof UpdateAboutSectionDto,
    value: any
  ) => {
    try {
      await updateAboutSection({ [field]: value });
      fetchAboutSection();
    } catch (error) {
      console.error("Failed to update field:", error);
    }
  };

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlights: [
        ...(formData.highlights || []),
        { icon: "🎓", label: "", text: "" },
      ],
    });
  };

  const removeHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: formData.highlights?.filter((_, i) => i !== index) || [],
    });
  };

  const updateHighlight = (
    index: number,
    field: keyof Highlight,
    value: string
  ) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights[index] = { ...newHighlights[index], [field]: value };
    setFormData({ ...formData, highlights: newHighlights });
  };

  const addStat = () => {
    setFormData({
      ...formData,
      stats: [...(formData.stats || []), { value: 0, suffix: "+", label: "" }],
    });
  };

  const removeStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats?.filter((_, i) => i !== index) || [],
    });
  };

  const updateStat = (
    index: number,
    field: keyof Stat,
    value: string | number
  ) => {
    const newStats = [...(formData.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, stats: newStats });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-3 gap-1 sm:gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl overflow-x-auto">
          <TabsTrigger
            value="content"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Content</span>
            <span className="sm:hidden">Content</span>
          </TabsTrigger>
          <TabsTrigger
            value="highlights"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Highlights & Stats</span>
            <span className="sm:hidden">Highlights</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">SEO</span>
            <span className="sm:hidden">SEO</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-t-lg py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    About Section Content
                  </CardTitle>
                  <CardDescription className="text-pink-100">
                    Manage main about section content and image
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={aboutSection?.isActive ? "default" : "secondary"}
                  >
                    {aboutSection?.isActive ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" /> Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" /> Inactive
                      </>
                    )}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={toggleActive}>
                    {aboutSection?.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-semibold">
                    Featured Image
                  </Label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      uploadProgress > 0 && uploadProgress < 100
                        ? "border-blue-400 bg-blue-50"
                        : "border-blue-200 hover:border-blue-400 cursor-pointer bg-white"
                    }`}
                  >
                    {uploadProgress > 0 && uploadProgress < 100 ? (
                      <div className="space-y-3">
                        <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                        <div>
                          <p className="text-base font-semibold text-blue-700">
                            Uploading Image...
                          </p>
                          <p className="text-sm text-blue-600 mt-1 font-medium">
                            {uploadProgress}% Complete
                          </p>
                        </div>
                        <Progress
                          value={uploadProgress}
                          className="w-full h-3 bg-blue-100"
                        />
                        <p className="text-xs text-blue-500">
                          Please wait while we upload your image
                        </p>
                      </div>
                    ) : imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-100 shadow-sm mx-auto max-w-md">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Image Ready
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(formData.image || "");
                          }}
                          className="border-2 hover:border-blue-400 hover:bg-blue-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    {uploadProgress === 0 && (
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Passionate About Flight"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Meet Rich Pickett — Pilot, Instructor, and Aviation Innovator"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={6}
                    placeholder="From my very first exploratory flight..."
                  />
                </div>

                {/* CTA */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaLabel">CTA Label</Label>
                    <Input
                      id="ctaLabel"
                      value={formData.cta?.label}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cta: {
                            ...formData.cta,
                            label: e.target.value,
                          } as CTA,
                        })
                      }
                      placeholder="Explore My Courses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">CTA Link</Label>
                    <Input
                      id="ctaLink"
                      value={formData.cta?.link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cta: { ...formData.cta, link: e.target.value } as CTA,
                        })
                      }
                      placeholder="/courses"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchAboutSection}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Highlights & Stats Tab */}
        <TabsContent value="highlights" className="space-y-6">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Highlights
              </CardTitle>
              <CardDescription className="text-yellow-100">
                Manage key highlights and features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              {formData.highlights?.map((highlight, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Highlight {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHighlight(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Input
                        value={highlight.icon}
                        onChange={(e) =>
                          updateHighlight(index, "icon", e.target.value)
                        }
                        placeholder="🎓"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={highlight.label}
                        onChange={(e) =>
                          updateHighlight(index, "label", e.target.value)
                        }
                        placeholder="Certified Flight Instructor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={highlight.text}
                        onChange={(e) =>
                          updateHighlight(index, "text", e.target.value)
                        }
                        placeholder="Teaching advanced flight operations..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addHighlight}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Highlight
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Statistics
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Manage achievement statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              {formData.stats?.map((stat, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Stat {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStat(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        type="number"
                        value={stat.value}
                        onChange={(e) =>
                          updateStat(
                            index,
                            "value",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Suffix</Label>
                      <Input
                        value={stat.suffix}
                        onChange={(e) =>
                          updateStat(index, "suffix", e.target.value)
                        }
                        placeholder="+"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(index, "label", e.target.value)
                        }
                        placeholder="Hours Flown"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addStat}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stat
              </Button>

              {/* Save Button */}
              <Button onClick={handleSubmit} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO Settings
              </CardTitle>
              <CardDescription className="text-purple-100">
                Optimize your About page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Page Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seo?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, title: e.target.value },
                    })
                  }
                  placeholder="About Us - Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  rows={3}
                  value={formData.seo?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, description: e.target.value },
                    })
                  }
                  placeholder="Learn more about Personal Wings, our mission, and aviation training excellence."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seo?.keywords || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, keywords: e.target.value },
                    })
                  }
                  placeholder="about personal wings, aviation training, flight school"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">Open Graph Title</Label>
                  <Input
                    id="ogTitle"
                    value={formData.seo?.ogTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo!, ogTitle: e.target.value },
                      })
                    }
                    placeholder="About Personal Wings"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    value={formData.seo?.ogImage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo!, ogImage: e.target.value },
                      })
                    }
                    placeholder="https://personalwings.com/images/about-og.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  rows={3}
                  value={formData.seo?.ogDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, ogDescription: e.target.value },
                    })
                  }
                  placeholder="Discover our aviation training approach and values."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.seo?.canonicalUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, canonicalUrl: e.target.value },
                    })
                  }
                  placeholder="https://personalwings.com/about-us"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" />
                  Save SEO Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
