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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Download,
  Copy,
  ExternalLink,
  Loader2,
  CheckSquare,
  Square,
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
    saving,
    uploadProgress,
    createBannerWithMedia,
    updateBannerWithMedia,
    updateBanner,
    deleteBanner,
    duplicateBanner,
    toggleActiveStatus,
    bulkDelete,
    bulkToggleStatus,
    exportBanners,
    refreshBanners,
  } = useBanners();

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

      if (editingBanner) {
        await updateBannerWithMedia(editingBanner._id, submitFormData);
      } else {
        await createBannerWithMedia(submitFormData);
      }

      resetForm();
      setActiveTab("list");
      await refreshBanners();
    } catch (error) {
      console.error("Failed to save banner:", error);
    }
  };

  const handleQuickToggle = async (banner: Banner) => {
    await toggleActiveStatus(banner._id);
  };

  const handleDelete = async (id: string) => {
    await deleteBanner(id);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateBanner(id);
    await refreshBanners();
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      const ids = selectedBanners.length > 0 ? selectedBanners : undefined;
      await exportBanners(format, ids);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBanners.length === 0) return;
    await bulkDelete(selectedBanners);
    setSelectedBanners([]);
    setShowDeleteDialog(false);
  };

  const handleBulkToggle = async (isActive: boolean) => {
    if (selectedBanners.length === 0) return;
    await bulkToggleStatus(selectedBanners, isActive);
    setSelectedBanners([]);
  };

  const toggleSelectBanner = (id: string) => {
    setSelectedBanners((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBanners.length === banners.length) {
      setSelectedBanners([]);
    } else {
      setSelectedBanners(banners.map((b) => b._id));
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
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {selectedBanners.length > 0 && (
            <Badge variant="default">{selectedBanners.length} selected</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedBanners.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggle(true)}
                disabled={saving || loading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Activate Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggle(false)}
                disabled={saving || loading}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Deactivate Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={saving || loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setPreviewBanner(banners[0] || null)}
            disabled={saving || loading || banners.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isExporting || saving || loading}
              >
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
              {selectedBanners.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Export Selected as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export Selected as PDF
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={refreshBanners}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

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
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Manage Banners</h3>
              {banners.length > 0 && (
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {selectedBanners.length === banners.length ? (
                    <CheckSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  {selectedBanners.length === banners.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>
            <Button onClick={handleCreate} disabled={saving || loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Banner
            </Button>
          </div>

          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner._id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedBanners.includes(banner._id)}
                        onCheckedChange={() => toggleSelectBanner(banner._id)}
                      />
                    </div>
                    <div
                      className="w-48 h-32 relative rounded-lg overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
                      onClick={() => setPreviewBanner(banner)}
                    >
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
                        disabled={saving || loading}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(banner._id)}
                        disabled={saving || loading}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickToggle(banner)}
                        disabled={saving || loading}
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
                        disabled={saving || loading}
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
                    disabled={
                      (uploadProgress > 0 && uploadProgress < 100) ||
                      saving ||
                      loading
                    }
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? "Saving..." : editingBanner ? "Update" : "Create"}{" "}
                    Banner
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving || loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
      <Dialog
        open={!!previewBanner}
        onOpenChange={(open) => !open && setPreviewBanner(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
            <DialogDescription>
              Preview how your banner will appear to users
            </DialogDescription>
          </DialogHeader>
          {previewBanner && (
            <div className="space-y-6 mt-4">
              {/* Thumbnail */}
              {previewBanner.thumbnail && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={previewBanner.thumbnail}
                    alt={previewBanner.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Video */}
              {previewBanner.videoUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Video</h3>
                  <video
                    src={previewBanner.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Title & Description */}
              <div>
                <h1 className="text-3xl font-bold">{previewBanner.title}</h1>
                <p className="text-muted-foreground mt-2">
                  {previewBanner.description}
                </p>
              </div>

              {/* Link */}
              {previewBanner.link && (
                <div className="pt-4">
                  <a
                    href={previewBanner.link}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    View More
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                <p>Order: {previewBanner.order}</p>
                <p>Status: {previewBanner.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Banners?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedBanners.length}{" "}
              banner(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving || loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={saving || loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
