"use client";

import React, { useState } from "react";
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
  Edit3,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useBanners } from "@/hooks/useBanner";
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  SeoMeta,
} from "@/lib/types/banner";

export function BannerEditor() {
  const {
    banners,
    loading,
    uploadProgress,
    createBannerWithMedia,
    updateBannerWithMedia,
    updateBanner,
    deleteBanner,
  } = useBanners();

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const [formData, setFormData] = useState<
    CreateBannerDto & { videoFile?: File; thumbnailFile?: File }
  >({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
    alt: "",
    link: "/course",
    order: 0,
    isActive: true,
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      ogTitle: "",
      ogDescription: "",
      canonicalUrl: "",
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnail: "",
      alt: "",
      link: "/course",
      order: 0,
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
        ogTitle: "",
        ogDescription: "",
        canonicalUrl: "",
      },
    });
    setEditingBanner(null);
    setIsCreating(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      videoUrl: banner.videoUrl,
      thumbnail: banner.thumbnail,
      alt: banner.alt,
      link: banner.link,
      order: banner.order,
      isActive: banner.isActive,
      seo: banner.seo || {
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
        ogTitle: "",
        ogDescription: "",
        canonicalUrl: "",
      },
    });
    setActiveTab("form");
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setActiveTab("form");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, videoFile: file });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, thumbnailFile: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Add files if present
      if (formData.videoFile) {
        submitFormData.append("video", formData.videoFile);
      }
      if (formData.thumbnailFile) {
        submitFormData.append("thumbnail", formData.thumbnailFile);
      }

      // Add text fields
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);

      // Only send videoUrl if no file is being uploaded
      if (formData.videoUrl && !formData.videoFile) {
        submitFormData.append("videoUrl", formData.videoUrl);
      }

      // Only send thumbnail URL if no file is being uploaded and it's a valid URL
      if (
        !formData.thumbnailFile &&
        formData.thumbnail &&
        formData.thumbnail.startsWith("http")
      ) {
        submitFormData.append("thumbnail", formData.thumbnail);
      }

      submitFormData.append("alt", formData.alt);
      submitFormData.append("link", formData.link);
      submitFormData.append("order", String(formData.order ?? 0));
      submitFormData.append("isActive", String(formData.isActive ?? true));

      // Add SEO fields (only if they have values)
      if (formData.seo) {
        if (formData.seo.title) {
          submitFormData.append("seo[title]", formData.seo.title);
        }
        if (formData.seo.description) {
          submitFormData.append("seo[description]", formData.seo.description);
        }
        if (formData.seo.keywords) {
          submitFormData.append("seo[keywords]", formData.seo.keywords);
        }
        if (formData.seo.ogImage && formData.seo.ogImage.startsWith("http")) {
          submitFormData.append("seo[ogImage]", formData.seo.ogImage);
        }
        if (formData.seo.ogTitle) {
          submitFormData.append("seo[ogTitle]", formData.seo.ogTitle);
        }
        if (formData.seo.ogDescription) {
          submitFormData.append(
            "seo[ogDescription]",
            formData.seo.ogDescription
          );
        }
        if (
          formData.seo.canonicalUrl &&
          formData.seo.canonicalUrl.startsWith("http")
        ) {
          submitFormData.append("seo[canonicalUrl]", formData.seo.canonicalUrl);
        }
      }

      if (editingBanner) {
        await updateBannerWithMedia(editingBanner._id, submitFormData);
      } else {
        await createBannerWithMedia(submitFormData);
      }

      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Failed to save banner:", error);
    }
  };

  const handleQuickToggle = async (banner: Banner) => {
    try {
      await updateBanner(banner._id, { isActive: !banner.isActive });
    } catch (error) {
      console.error("Failed to toggle banner:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await deleteBanner(id);
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-auto items-center justify-start rounded-xl bg-white p-2 shadow-sm border border-gray-200 gap-2 flex-wrap">
          <TabsTrigger
            value="list"
            className={`
              flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
              transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-40
              ${
                activeTab === "list"
                  ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Banner List</span>
          </TabsTrigger>
          <TabsTrigger
            value="form"
            className={`
              flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
              transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-40
              ${
                activeTab === "form"
                  ? "bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{editingBanner ? "Edit" : "Create"} Banner</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className={`
              flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
              transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-40
              ${
                activeTab === "seo"
                  ? "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>SEO Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Banners</h3>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Banner
            </Button>
          </div>

          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner._id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-48 h-32 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={banner.thumbnail}
                        alt={banner.alt}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={banner.isActive ? "default" : "secondary"}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold mb-2">
                        {banner.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {banner.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          Video
                        </span>
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-4 h-4" />
                          {banner.link}
                        </span>
                        <span>Order: {banner.order}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickToggle(banner)}
                      >
                        {banner.isActive ? (
                          <EyeOff className="w-4 h-4 mr-2" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        {banner.isActive ? "Hide" : "Show"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(banner._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {banners.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first banner to get started
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Banner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingBanner ? "Edit" : "Create"} Banner</CardTitle>
              <CardDescription>
                {editingBanner
                  ? "Update banner content and media"
                  : "Add a new banner to your homepage"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="High Performance Aircraft Training"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link *</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="/course"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Master high-performance aircraft..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="alt">Alt Text *</Label>
                    <Input
                      id="alt"
                      value={formData.alt}
                      onChange={(e) =>
                        setFormData({ ...formData, alt: e.target.value })
                      }
                      placeholder="High performance aircraft training"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-gray-600">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Or Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://cdn.example.com/video.mp4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {formData.thumbnail && (
                      <div className="mt-2">
                        <img
                          src={formData.thumbnail}
                          alt="Preview"
                          className="w-64 h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingBanner ? "Update" : "Create"} Banner
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Configure SEO metadata for this banner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input
                  id="seo-title"
                  value={formData.seo?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, title: e.target.value },
                    })
                  }
                  placeholder="Banner SEO Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO Description</Label>
                <Textarea
                  id="seo-description"
                  value={formData.seo?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, description: e.target.value },
                    })
                  }
                  placeholder="Banner description for search engines"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input
                  id="seo-keywords"
                  value={formData.seo?.keywords || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, keywords: e.target.value },
                    })
                  }
                  placeholder="aviation, training, aircraft"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-og-title">OG Title</Label>
                  <Input
                    id="seo-og-title"
                    value={formData.seo?.ogTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, ogTitle: e.target.value },
                      })
                    }
                    placeholder="Title for social media"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-og-image">OG Image URL</Label>
                  <Input
                    id="seo-og-image"
                    value={formData.seo?.ogImage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, ogImage: e.target.value },
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-og-description">OG Description</Label>
                <Textarea
                  id="seo-og-description"
                  value={formData.seo?.ogDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, ogDescription: e.target.value },
                    })
                  }
                  placeholder="Description for social media"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-canonical">Canonical URL</Label>
                <Input
                  id="seo-canonical"
                  value={formData.seo?.canonicalUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, canonicalUrl: e.target.value },
                    })
                  }
                  placeholder="https://personalwings.com/banner"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
