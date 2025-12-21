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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  Star,
  Download,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useBlog } from "@/hooks/useBlog";
import Image from "next/image";
import type { Blog, UpdateBlogDto, BlogPost, SeoMeta } from "@/lib/types/blog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

export function BlogEditor() {
  const {
    blog,
    loading,
    saving,
    uploadProgress,
    fetchBlog,
    updateBlogWithMedia,
    toggleActive,
    duplicateBlogPost,
    exportBlog,
    refreshBlog,
  } = useBlog();

  const [activeTab, setActiveTab] = useState("content");
  const [imageFiles, setImageFiles] = useState<{ [key: number]: File }>({});
  const [imagePreviews, setImagePreviews] = useState<{
    [key: number]: string;
  }>({});
  const [avatarFiles, setAvatarFiles] = useState<{ [key: number]: File }>({});
  const [avatarPreviews, setAvatarPreviews] = useState<{
    [key: number]: string;
  }>({});
  const [tagInput, setTagInput] = useState<{ [key: number]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [categories, setCategories] = useState<string[]>([
    "Aviation Training",
    "Flight Safety",
    "Pilot Resources",
    "Aircraft Maintenance",
    "Aviation News",
    "Student Pilot",
    "Commercial Aviation",
    "Private Pilot",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState<UpdateBlogDto>({
    title: "",
    subtitle: "",
    description: "",
    blogs: [],
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
    isActive: true,
  });

  useEffect(() => {
    if (blog) {
      // Normalize blog data to ensure publishedAt is always an ISO string
      const normalizedBlogs = (blog.blogs || []).map((post) => ({
        ...post,
        publishedAt:
          post.publishedAt &&
          typeof post.publishedAt === "string" &&
          post.publishedAt !== "{}"
            ? post.publishedAt
            : post.publishedAt instanceof Date
            ? post.publishedAt.toISOString()
            : new Date().toISOString(),
      }));

      setFormData({
        title: blog.title || "",
        subtitle: blog.subtitle || "",
        description: blog.description || "",
        blogs: normalizedBlogs,
        seo: blog.seo || {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
        },
        isActive: blog.isActive ?? true,
      });
    }
  }, [blog]);

  const handleImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFiles({ ...imageFiles, [index]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({
          ...imagePreviews,
          [index]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFiles({ ...avatarFiles, [index]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviews({
          ...avatarPreviews,
          [index]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (index: number) => {
    const tag = tagInput[index]?.trim();
    if (tag && !formData.blogs?.[index]?.tags?.includes(tag)) {
      const newTags = [...(formData.blogs?.[index]?.tags || []), tag];
      updateBlogPost(index, "tags", newTags);
      setTagInput({ ...tagInput, [index]: "" });
    }
  };

  const removeTag = (postIndex: number, tagIndex: number) => {
    const newTags = [...(formData.blogs?.[postIndex]?.tags || [])];
    newTags.splice(tagIndex, 1);
    updateBlogPost(postIndex, "tags", newTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Add text fields
      submitFormData.append("title", formData.title || "");
      submitFormData.append("subtitle", formData.subtitle || "");
      submitFormData.append("description", formData.description || "");

      // Convert boolean to actual boolean (not string)
      submitFormData.append("isActive", formData.isActive ? "true" : "false");

      // Add blogs as proper JSON string (will be parsed on backend)
      if (formData.blogs && formData.blogs.length > 0) {
        // Create a blogs array with proper structure
        const blogsData = formData.blogs.map((blog) => {
          // Ensure publishedAt is a valid ISO string
          let publishedAtStr = new Date().toISOString();
          if (blog.publishedAt) {
            if (
              typeof blog.publishedAt === "string" &&
              blog.publishedAt !== "{}"
            ) {
              publishedAtStr = blog.publishedAt;
            } else if (blog.publishedAt instanceof Date) {
              publishedAtStr = blog.publishedAt.toISOString();
            }
          }

          return {
            title: blog.title || "",
            excerpt: blog.excerpt || "",
            image: blog.image || "",
            slug: blog.slug || "",
            featured: blog.featured || false,
            content: blog.content || "",
            author: {
              name: blog.author?.name || "",
              role: blog.author?.role || "",
              avatar: blog.author?.avatar || "",
              bio: blog.author?.bio || "",
              socialLinks: {
                facebook: blog.author?.socialLinks?.facebook || "",
                twitter: blog.author?.socialLinks?.twitter || "",
                linkedin: blog.author?.socialLinks?.linkedin || "",
                website: blog.author?.socialLinks?.website || "",
              },
            },
            publishedAt: publishedAtStr,
            readTime: blog.readTime || "5 min read",
            category: blog.category || "",
            tags: blog.tags || [],
            views: blog.views || 0,
            likes: blog.likes || 0,
            commentsCount: blog.commentsCount || 0,
          };
        });

        submitFormData.append("blogs", JSON.stringify(blogsData));
      } else {
        submitFormData.append("blogs", JSON.stringify([]));
      }

      // Add image files
      Object.entries(imageFiles).forEach(([index, file]) => {
        submitFormData.append(`image_${index}`, file);
      });

      // Add avatar files
      Object.entries(avatarFiles).forEach(([index, file]) => {
        submitFormData.append(`avatar_${index}`, file);
      });

      await updateBlogWithMedia(submitFormData);
      setImageFiles({});
      setImagePreviews({});
      setAvatarFiles({});
      setAvatarPreviews({});
      await refreshBlog();
    } catch (error) {
      console.error("Failed to update blog:", error);
    }
  };

  const handleDuplicate = async (slug: string) => {
    await duplicateBlogPost(slug);
    await refreshBlog();
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      await exportBlog(format);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const addBlogPost = () => {
    setFormData({
      ...formData,
      blogs: [
        ...(formData.blogs || []),
        {
          title: "",
          excerpt: "",
          image: "",
          slug: "",
          featured: false,
          content: "",
          author: {
            name: "",
            role: "",
            avatar: "",
            bio: "",
            socialLinks: {
              facebook: "",
              twitter: "",
              linkedin: "",
              website: "",
            },
          },
          publishedAt: new Date().toISOString(),
          readTime: "5 min read",
          category: "",
          tags: [],
          views: 0,
          likes: 0,
          commentsCount: 0,
        },
      ],
    });
  };

  const removeBlogPost = (index: number) => {
    const newBlogs = [...(formData.blogs || [])];
    newBlogs.splice(index, 1);
    setFormData({ ...formData, blogs: newBlogs });

    // Remove preview if exists
    const newPreviews = { ...imagePreviews };
    delete newPreviews[index];
    setImagePreviews(newPreviews);

    const newFiles = { ...imageFiles };
    delete newFiles[index];
    setImageFiles(newFiles);

    const newAvatarFiles = { ...avatarFiles };
    delete newAvatarFiles[index];
    setAvatarFiles(newAvatarFiles);

    const newAvatarPreviews = { ...avatarPreviews };
    delete newAvatarPreviews[index];
    setAvatarPreviews(newAvatarPreviews);
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  const updateBlogPost = (index: number, field: keyof BlogPost, value: any) => {
    const newBlogs = [...(formData.blogs || [])];
    newBlogs[index] = { ...newBlogs[index], [field]: value };

    // Auto-generate slug when title changes
    if (field === "title" && value) {
      newBlogs[index].slug = generateSlug(value);
    }

    setFormData({ ...formData, blogs: newBlogs });
  };

  // Filter and paginate blog posts
  const filteredBlogs =
    formData.blogs
      ?.map((post, originalIndex) => ({ post, originalIndex }))
      .filter(({ post }) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          post.title?.toLowerCase().includes(searchLower) ||
          post.slug?.toLowerCase().includes(searchLower) ||
          post.category?.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }) || [];

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant={blog?.isActive ? "default" : "secondary"}>
            {blog?.isActive ? (
              <>
                <Eye className="w-3 h-3 mr-1" /> Active
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" /> Inactive
              </>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              if (formData.blogs && formData.blogs.length > 0) {
                setPreviewPost(formData.blogs[0]);
              }
            }}
            disabled={
              saving ||
              loading ||
              !formData.blogs ||
              formData.blogs.length === 0
            }
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
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={refreshBlog}
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
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>
                  Manage blog posts and aviation insights section
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, isActive: checked });
                      toggleActive();
                    }}
                  />
                  <Label className="flex items-center gap-2">
                    {formData.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    {formData.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    (uploadProgress > 0 && uploadProgress < 100) ||
                    saving ||
                    loading
                  }
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving
                    ? "Saving..."
                    : uploadProgress > 0 && uploadProgress < 100
                    ? "Uploading..."
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-6"
            >
              <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-4 gap-1 sm:gap-2 p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-x-auto">
                <TabsTrigger
                  value="content"
                  className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger
                  value="blogs"
                  className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>Blog Posts ({formData.blogs?.length || 0})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>Categories ({categories.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-4">
                <Card className="border-0 shadow-lg pt-0 bg-white dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Section Content
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                          Manage blog section content
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="active-toggle"
                          className="text-sm text-white"
                        >
                          Active
                        </Label>
                        <Switch
                          id="active-toggle"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => {
                            setFormData({ ...formData, isActive: checked });
                            toggleActive();
                          }}
                          className="data-[state=checked]:bg-green-500"
                        />
                        {formData.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="title">Section Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Latest Aviation"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData({ ...formData, subtitle: e.target.value })
                        }
                        placeholder="Blog Post"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Stay updated with the latest aviation insights and news"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Blog Posts Tab */}
              <TabsContent value="blogs" className="space-y-6 mt-4">
                <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Blog Posts List
                        </CardTitle>
                        <CardDescription className="text-green-100">
                          Add and manage aviation blog posts
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="bg-white text-green-600 hover:bg-green-50"
                        onClick={addBlogPost}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Blog Post
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Search Bar */}
                    {formData.blogs && formData.blogs.length > 0 && (
                      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search by title, slug, category, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-gray-800"
                          />
                        </div>
                        <Badge variant="secondary" className="px-3 py-2">
                          {filteredBlogs.length} of {formData.blogs.length}{" "}
                          posts
                        </Badge>
                      </div>
                    )}
                    {formData.blogs && formData.blogs.length > 0 ? (
                      <>
                        {filteredBlogs.length > 0 ? (
                          <>
                            <div className="space-y-6">
                              {paginatedBlogs.map(({ post, originalIndex }) => {
                                const index = originalIndex;
                                return (
                                  <Collapsible key={index} className="group">
                                    <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200">
                                      <CardHeader className="pb-3">
                                        <div className="flex items-start gap-4">
                                          {/* Thumbnail */}
                                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                            {imagePreviews[index] ||
                                            post.image ? (
                                              <Image
                                                src={
                                                  imagePreviews[index] ||
                                                  post.image
                                                }
                                                alt={post.title || "Blog post"}
                                                fill
                                                className="object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                              </div>
                                            )}
                                          </div>

                                          {/* Content */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                  <Badge
                                                    variant="outline"
                                                    className="px-2 py-0.5 text-xs"
                                                  >
                                                    Post {index + 1}
                                                  </Badge>
                                                  {post.category && (
                                                    <Badge
                                                      variant="secondary"
                                                      className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                    >
                                                      {post.category}
                                                    </Badge>
                                                  )}
                                                  {post.featured && (
                                                    <Badge className="bg-yellow-500 hover:bg-yellow-600 px-2 py-0.5 text-xs">
                                                      <Star className="w-3 h-3 mr-1" />
                                                      Featured
                                                    </Badge>
                                                  )}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                                                  {post.title ||
                                                    "Untitled Post"}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                  {post.excerpt ||
                                                    post.slug ||
                                                    "No description"}
                                                </p>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex items-center gap-2 flex-shrink-0">
                                                <CollapsibleTrigger asChild>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    title="Expand/Collapse"
                                                  >
                                                    <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                                                  </Button>
                                                </CollapsibleTrigger>
                                                <Button
                                                  type="button"
                                                  onClick={() => {
                                                    if (post.slug) {
                                                      handleDuplicate(
                                                        post.slug
                                                      );
                                                    }
                                                  }}
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-9 w-9 p-0"
                                                  title="Duplicate Post"
                                                  disabled={
                                                    saving ||
                                                    loading ||
                                                    !post.slug
                                                  }
                                                >
                                                  <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  onClick={() =>
                                                    setPreviewPost(post)
                                                  }
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-9 w-9 p-0"
                                                  title="Preview Post"
                                                  disabled={saving || loading}
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  onClick={() =>
                                                    removeBlogPost(index)
                                                  }
                                                  variant="destructive"
                                                  size="sm"
                                                  className="h-9 w-9 p-0"
                                                  title="Delete Post"
                                                  disabled={saving || loading}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CollapsibleContent>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <Label>Blog Image</Label>
                                            <div className="flex items-center gap-4 mt-2">
                                              {(imagePreviews[index] ||
                                                post.image) && (
                                                <div className="relative w-32 h-20 rounded overflow-hidden border-2 border-gray-200">
                                                  <Image
                                                    src={
                                                      imagePreviews[index] ||
                                                      post.image
                                                    }
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                  />
                                                </div>
                                              )}
                                              <div className="flex-1">
                                                <label
                                                  htmlFor={`image-${index}`}
                                                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                  <Upload className="h-4 w-4 mr-2" />
                                                  Choose Image
                                                </label>
                                                <input
                                                  id={`image-${index}`}
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  onChange={(e) =>
                                                    handleImageChange(index, e)
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label>Title</Label>
                                              <Input
                                                value={post.title}
                                                onChange={(e) =>
                                                  updateBlogPost(
                                                    index,
                                                    "title",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Taxiway Delta Transition"
                                              />
                                            </div>

                                            <div>
                                              <Label>Slug</Label>
                                              <Input
                                                value={post.slug}
                                                onChange={(e) =>
                                                  updateBlogPost(
                                                    index,
                                                    "slug",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="taxiway-delta-transition"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <Label>Excerpt</Label>
                                            <Textarea
                                              value={post.excerpt}
                                              onChange={(e) =>
                                                updateBlogPost(
                                                  index,
                                                  "excerpt",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Experience a unique scenic flight over San Diego Bay..."
                                              rows={3}
                                            />
                                          </div>

                                          <div>
                                            <Label>Content</Label>
                                            <RichTextEditor
                                              content={post.content || ""}
                                              onChange={(content) =>
                                                updateBlogPost(
                                                  index,
                                                  "content",
                                                  content
                                                )
                                              }
                                              placeholder="Write your blog post content here..."
                                            />
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label>Category</Label>
                                              <Select
                                                value={post.category}
                                                onValueChange={(value) =>
                                                  updateBlogPost(
                                                    index,
                                                    "category",
                                                    value
                                                  )
                                                }
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {categories.map((cat) => (
                                                    <SelectItem
                                                      key={cat}
                                                      value={cat}
                                                    >
                                                      {cat}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            <div>
                                              <Label>Read Time</Label>
                                              <Input
                                                value={post.readTime}
                                                onChange={(e) =>
                                                  updateBlogPost(
                                                    index,
                                                    "readTime",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="5 min read"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <Label>Tags</Label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                              {post.tags &&
                                              post.tags.length > 0 ? (
                                                post.tags.map(
                                                  (tag, tagIndex) => (
                                                    <Badge
                                                      key={tagIndex}
                                                      variant="secondary"
                                                      className="px-3 py-1 text-sm flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                    >
                                                      {tag}
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          removeTag(
                                                            index,
                                                            tagIndex
                                                          )
                                                        }
                                                        className="hover:text-red-600 ml-1"
                                                      >
                                                        ×
                                                      </button>
                                                    </Badge>
                                                  )
                                                )
                                              ) : (
                                                <span className="text-sm text-gray-500">
                                                  No tags added yet
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <Input
                                                value={tagInput[index] || ""}
                                                onChange={(e) =>
                                                  setTagInput({
                                                    ...tagInput,
                                                    [index]: e.target.value,
                                                  })
                                                }
                                                onKeyPress={(e) => {
                                                  if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTag(index);
                                                  }
                                                }}
                                                placeholder="Add a tag..."
                                              />
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addTag(index)}
                                              >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add
                                              </Button>
                                            </div>
                                          </div>

                                          <div>
                                            <Label>Published Date</Label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  className="w-full justify-start text-left font-normal"
                                                >
                                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                                  {post.publishedAt &&
                                                  !isNaN(
                                                    new Date(
                                                      post.publishedAt
                                                    ).getTime()
                                                  )
                                                    ? format(
                                                        new Date(
                                                          post.publishedAt
                                                        ),
                                                        "PPP"
                                                      )
                                                    : "Pick a date"}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={
                                                    post.publishedAt &&
                                                    !isNaN(
                                                      new Date(
                                                        post.publishedAt
                                                      ).getTime()
                                                    )
                                                      ? new Date(
                                                          post.publishedAt
                                                        )
                                                      : undefined
                                                  }
                                                  onSelect={(date) => {
                                                    if (date) {
                                                      updateBlogPost(
                                                        index,
                                                        "publishedAt",
                                                        date.toISOString()
                                                      );
                                                    }
                                                  }}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>

                                          <div className="border-t pt-4 space-y-4">
                                            <h4 className="font-semibold">
                                              Author Information
                                            </h4>

                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <Label>Author Name</Label>
                                                <Input
                                                  value={post.author.name}
                                                  onChange={(e) =>
                                                    updateBlogPost(
                                                      index,
                                                      "author",
                                                      {
                                                        ...post.author,
                                                        name: e.target.value,
                                                      }
                                                    )
                                                  }
                                                  placeholder="John Doe"
                                                />
                                              </div>

                                              <div>
                                                <Label>Author Role</Label>
                                                <Input
                                                  value={post.author.role}
                                                  onChange={(e) =>
                                                    updateBlogPost(
                                                      index,
                                                      "author",
                                                      {
                                                        ...post.author,
                                                        role: e.target.value,
                                                      }
                                                    )
                                                  }
                                                  placeholder="Flight Instructor"
                                                />
                                              </div>
                                            </div>

                                            <div>
                                              <Label>Author Avatar</Label>
                                              <div className="flex items-center gap-4 mt-2">
                                                {(avatarPreviews[index] ||
                                                  post.author.avatar) && (
                                                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                                                    <Image
                                                      src={
                                                        avatarPreviews[index] ||
                                                        post.author.avatar
                                                      }
                                                      alt={post.author.name}
                                                      fill
                                                      className="object-cover"
                                                    />
                                                  </div>
                                                )}
                                                <div className="flex-1 space-y-2">
                                                  <div>
                                                    <label
                                                      htmlFor={`avatar-${index}`}
                                                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                      <Upload className="h-4 w-4 mr-2" />
                                                      {avatarPreviews[index]
                                                        ? "Change Avatar"
                                                        : "Upload Avatar"}
                                                    </label>
                                                    <input
                                                      id={`avatar-${index}`}
                                                      type="file"
                                                      accept="image/*"
                                                      className="hidden"
                                                      onChange={(e) =>
                                                        handleAvatarChange(
                                                          index,
                                                          e
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                  <Input
                                                    value={post.author.avatar}
                                                    onChange={(e) =>
                                                      updateBlogPost(
                                                        index,
                                                        "author",
                                                        {
                                                          ...post.author,
                                                          avatar:
                                                            e.target.value,
                                                        }
                                                      )
                                                    }
                                                    placeholder="Or paste avatar URL..."
                                                    className="text-sm"
                                                  />
                                                </div>
                                              </div>
                                            </div>

                                            <div>
                                              <Label>Author Bio</Label>
                                              <Textarea
                                                value={post.author.bio}
                                                onChange={(e) =>
                                                  updateBlogPost(
                                                    index,
                                                    "author",
                                                    {
                                                      ...post.author,
                                                      bio: e.target.value,
                                                    }
                                                  )
                                                }
                                                placeholder="Short bio about the author..."
                                                rows={2}
                                              />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <Label>Twitter</Label>
                                                <Input
                                                  value={
                                                    post.author.socialLinks
                                                      ?.twitter || ""
                                                  }
                                                  onChange={(e) =>
                                                    updateBlogPost(
                                                      index,
                                                      "author",
                                                      {
                                                        ...post.author,
                                                        socialLinks: {
                                                          ...post.author
                                                            .socialLinks,
                                                          twitter:
                                                            e.target.value,
                                                        },
                                                      }
                                                    )
                                                  }
                                                  placeholder="https://twitter.com/username"
                                                />
                                              </div>

                                              <div>
                                                <Label>LinkedIn</Label>
                                                <Input
                                                  value={
                                                    post.author.socialLinks
                                                      ?.linkedin || ""
                                                  }
                                                  onChange={(e) =>
                                                    updateBlogPost(
                                                      index,
                                                      "author",
                                                      {
                                                        ...post.author,
                                                        socialLinks: {
                                                          ...post.author
                                                            .socialLinks,
                                                          linkedin:
                                                            e.target.value,
                                                        },
                                                      }
                                                    )
                                                  }
                                                  placeholder="https://linkedin.com/in/username"
                                                />
                                              </div>

                                              <div>
                                                <Label>Website</Label>
                                                <Input
                                                  value={
                                                    post.author.socialLinks
                                                      ?.website || ""
                                                  }
                                                  onChange={(e) =>
                                                    updateBlogPost(
                                                      index,
                                                      "author",
                                                      {
                                                        ...post.author,
                                                        socialLinks: {
                                                          ...post.author
                                                            .socialLinks,
                                                          website:
                                                            e.target.value,
                                                        },
                                                      }
                                                    )
                                                  }
                                                  placeholder="https://website.com"
                                                />
                                              </div>

                                              <div>
                                                <Label>Facebook</Label>
                                                <Input
                                                  value={
                                                    post.author.socialLinks
                                                      ?.facebook || ""
                                                  }
                                                  onChange={(e) =>
                                                    updateBlogPost(
                                                      index,
                                                      "author",
                                                      {
                                                        ...post.author,
                                                        socialLinks: {
                                                          ...post.author
                                                            .socialLinks,
                                                          facebook:
                                                            e.target.value,
                                                        },
                                                      }
                                                    )
                                                  }
                                                  placeholder="https://facebook.com/username"
                                                />
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <Switch
                                              checked={post.featured}
                                              onCheckedChange={(checked) =>
                                                updateBlogPost(
                                                  index,
                                                  "featured",
                                                  checked
                                                )
                                              }
                                            />
                                            <Label>Featured Post</Label>
                                          </div>
                                        </CardContent>
                                      </CollapsibleContent>
                                    </Card>
                                  </Collapsible>
                                );
                              })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between border-t pt-4">
                                <div className="text-sm text-gray-600">
                                  Showing {startIndex + 1} to{" "}
                                  {Math.min(endIndex, filteredBlogs.length)} of{" "}
                                  {filteredBlogs.length} posts
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                      )
                                    }
                                    disabled={currentPage === 1}
                                  >
                                    Previous
                                  </Button>
                                  <div className="flex gap-1">
                                    {Array.from(
                                      { length: totalPages },
                                      (_, i) => i + 1
                                    ).map((page) => (
                                      <Button
                                        key={page}
                                        type="button"
                                        variant={
                                          currentPage === page
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={
                                          currentPage === page
                                            ? "bg-green-600 hover:bg-green-700"
                                            : ""
                                        }
                                      >
                                        {page}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                      )
                                    }
                                    disabled={currentPage === totalPages}
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">
                              No posts found
                            </p>
                            <p className="text-sm">
                              Try adjusting your search query
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>
                          No blog posts yet. Click "Add Blog Post" to get
                          started.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-6 mt-4">
                <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Blog Categories
                        </CardTitle>
                        <CardDescription className="text-orange-100">
                          Manage blog post categories
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Add New Category */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <Label
                        htmlFor="new-category"
                        className="text-base font-semibold mb-2"
                      >
                        Add New Category
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="new-category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Enter category name..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                newCategory.trim() &&
                                !categories.includes(newCategory.trim())
                              ) {
                                setCategories([
                                  ...categories,
                                  newCategory.trim(),
                                ]);
                                setNewCategory("");
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (
                              newCategory.trim() &&
                              !categories.includes(newCategory.trim())
                            ) {
                              setCategories([
                                ...categories,
                                newCategory.trim(),
                              ]);
                              setNewCategory("");
                            }
                          }}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Categories List */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Existing Categories ({categories.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((category, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {category}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setCategories(
                                  categories.filter((c) => c !== category)
                                );
                              }}
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
      <Dialog
        open={!!previewPost}
        onOpenChange={(open) => !open && setPreviewPost(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blog Post Preview</DialogTitle>
            <DialogDescription>
              Preview how your blog post will appear to users
            </DialogDescription>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-6 mt-4">
              {/* Image */}
              {previewPost.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={previewPost.image}
                    alt={previewPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title & Meta */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {previewPost.category && (
                    <Badge variant="secondary">{previewPost.category}</Badge>
                  )}
                  {previewPost.featured && (
                    <Badge className="bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{previewPost.title}</h1>
                <p className="text-muted-foreground mt-2">
                  {previewPost.excerpt}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  {previewPost.publishedAt && (
                    <span>
                      {format(
                        new Date(previewPost.publishedAt),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  )}
                  <span>{previewPost.readTime}</span>
                  <span>{previewPost.views || 0} views</span>
                  <span>{previewPost.likes || 0} likes</span>
                </div>
              </div>

              {/* Author */}
              {previewPost.author && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  {previewPost.author.avatar && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={previewPost.author.avatar}
                        alt={previewPost.author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{previewPost.author.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {previewPost.author.role}
                    </p>
                    {previewPost.author.bio && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {previewPost.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              {previewPost.content && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewPost.content }}
                />
              )}

              {/* Tags */}
              {previewPost.tags && previewPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewPost.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
