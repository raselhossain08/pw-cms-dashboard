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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  MessageCircle,
  Plane,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  Users,
  Headphones,
  Search,
  Edit,
  X,
  Download,
  Copy,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { FaqsService } from "@/lib/services/faqs.service";
import type {
  Faqs,
  HeaderSection,
  Category,
  FaqItem,
  SeoMeta,
} from "@/lib/services/faqs.service";
import { useToast } from "@/context/ToastContext";
import { useFAQs } from "@/hooks/useFAQs";

// Icon map for category icons
const iconMap = {
  MessageCircle,
  Plane,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  Users,
  Headphones,
};

type IconName = keyof typeof iconMap;

export function FAQsEditor() {
  const { push } = useToast();
  const {
    faqs,
    loading,
    saving,
    uploadProgress,
    error,
    fetchFaqs,
    updateFaqs,
    updateFaqsWithUpload,
    toggleActive,
    duplicateFaqs,
    exportFaqs,
    refreshFaqs,
  } = useFAQs();

  const [activeTab, setActiveTab] = useState("header");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<Partial<Faqs>>({
    headerSection: {
      badge: "",
      title: "",
      description: "",
      image: "",
      imageAlt: "",
    },
    categories: [],
    faqs: [],
    seoMeta: {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
    isActive: true,
  });

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Category>({
    name: "",
    icon: "MessageCircle",
    count: 0,
    color: "bg-blue-100 text-blue-800",
  });

  // FAQ editing state
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm, setFaqForm] = useState<FaqItem>({
    question: "",
    answer: "",
    category: "",
    tags: [],
    isActive: true,
    order: 0,
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (faqs) {
      setFormData({
        headerSection: faqs.headerSection,
        categories: faqs.categories,
        faqs: faqs.faqs,
        seoMeta: faqs.seoMeta,
        isActive: faqs.isActive,
      });
      if (faqs.headerSection?.image) {
        setImagePreview(faqs.headerSection.image);
      }
    }
  }, [faqs]);

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

  const handleSave = async () => {
    if (!faqs?._id) {
      push({
        message: "No FAQs data found",
        type: "error",
      });
      return;
    }

    if (imageFile) {
      const formDataObj = new FormData();
      formDataObj.append("image", imageFile);
      formDataObj.append(
        "headerSection",
        JSON.stringify(formData.headerSection)
      );
      formDataObj.append("categories", JSON.stringify(formData.categories));
      formDataObj.append("faqs", JSON.stringify(formData.faqs));
      formDataObj.append("seoMeta", JSON.stringify(formData.seoMeta));
      formDataObj.append("isActive", String(formData.isActive));

      await updateFaqsWithUpload(formDataObj);
      setImageFile(null);
    } else {
      await updateFaqs(formData);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!categoryForm.name) {
      push({
        message: "Category name is required",
        type: "error",
      });
      return;
    }

    const updatedCategories = [...(formData.categories || [])];
    if (editingCategory) {
      const index = updatedCategories.findIndex(
        (c) => c.name === editingCategory.name
      );
      if (index !== -1) {
        updatedCategories[index] = categoryForm;
      }
    } else {
      updatedCategories.push(categoryForm);
    }

    setFormData({ ...formData, categories: updatedCategories });
    setCategoryForm({
      name: "",
      icon: "MessageCircle",
      count: 0,
      color: "bg-blue-100 text-blue-800",
    });
    setEditingCategory(null);

    push({
      message: editingCategory ? "Category updated" : "Category added",
      type: "success",
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm(category);
  };

  const handleDeleteCategory = (categoryName: string) => {
    const updatedCategories = (formData.categories || []).filter(
      (c) => c.name !== categoryName
    );
    setFormData({ ...formData, categories: updatedCategories });
    push({
      message: "Category deleted",
      type: "success",
    });
  };

  // FAQ handlers
  const handleAddFaq = () => {
    if (!faqForm.question || !faqForm.answer) {
      push({
        message: "Question and answer are required",
        type: "error",
      });
      return;
    }

    const updatedFaqs = [...(formData.faqs || [])];
    if (editingFaq) {
      const index = updatedFaqs.findIndex(
        (f) => f.question === editingFaq.question
      );
      if (index !== -1) {
        updatedFaqs[index] = faqForm;
      }
    } else {
      updatedFaqs.push(faqForm);
    }

    setFormData({ ...formData, faqs: updatedFaqs });
    setFaqForm({
      question: "",
      answer: "",
      category: "",
      tags: [],
      isActive: true,
      order: 0,
    });
    setEditingFaq(null);

    push({
      message: editingFaq ? "FAQ updated" : "FAQ added",
      type: "success",
    });
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqForm(faq);
  };

  const handleDeleteFaq = (question: string) => {
    const updatedFaqs = (formData.faqs || []).filter(
      (f) => f.question !== question
    );
    setFormData({ ...formData, faqs: updatedFaqs });
    push({
      message: "FAQ deleted",
      type: "success",
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const updatedTags = [...faqForm.tags, tagInput.trim()];
      setFaqForm({ ...faqForm, tags: updatedTags });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = faqForm.tags.filter((t) => t !== tag);
    setFaqForm({ ...faqForm, tags: updatedTags });
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      await exportFaqs(format);
      push({
        message: `FAQs exported successfully as ${format.toUpperCase()}`,
        type: "success",
      });
    } catch (error) {
      push({
        message: `Failed to export FAQs`,
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateFaqs();
      push({
        message: "FAQs duplicated successfully",
        type: "success",
      });
    } catch (error) {
      push({
        message: "Failed to duplicate FAQs",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading FAQs data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!faqs) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <MessageCircle className="w-12 h-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">No FAQs Data Found</p>
            <p className="text-sm text-muted-foreground">
              {error ||
                "The backend will create default FAQs data automatically."}
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                  {error}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={refreshFaqs} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Loading
              </Button>
              <Button
                onClick={() => {
                  window.open(
                    "http://localhost:5000/api/cms/faqs/default",
                    "_blank"
                  );
                }}
                variant="secondary"
                size="sm"
              >
                Test API Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">FAQs Management</h2>
          <p className="text-muted-foreground">
            Manage your FAQ content, categories, and SEO settings
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={faqs?.isActive ? "default" : "secondary"}>
            {faqs?.isActive ? (
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
            disabled={!faqs || saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {faqs?._id && (
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
                  await refreshFaqs();
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
            onClick={refreshFaqs}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Active Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Page Status</CardTitle>
              <CardDescription>
                Control visibility of the FAQs page
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={async (checked) => {
                  setFormData({ ...formData, isActive: checked });
                  await toggleActive();
                  await refreshFaqs();
                }}
                disabled={saving}
              />
              <Label>{formData.isActive ? "Active" : "Inactive"}</Label>
              {formData.isActive ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Section</CardTitle>
              <CardDescription>
                Configure the header content for your FAQs page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.headerSection?.badge || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        badge: e.target.value,
                      },
                    })
                  }
                  placeholder="FAQs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.headerSection?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="How can we help you?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.headerSection?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        description: e.target.value,
                      },
                    })
                  }
                  placeholder="Find answers to common questions..."
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Header Image (Optional)</Label>
                {imagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Header preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                    type="button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {imageFile && (
                    <Badge variant="secondary">{imageFile.name}</Badge>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageAlt">Image Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={formData.headerSection?.imageAlt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        imageAlt: e.target.value,
                      },
                    })
                  }
                  placeholder="Descriptive text for the image"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory ? "Edit Category" : "Add Category"}
              </CardTitle>
              <CardDescription>
                {editingCategory
                  ? "Update category information"
                  : "Create a new FAQ category"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Flight Training"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryIcon">Icon</Label>
                  <select
                    id="categoryIcon"
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        icon: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="MessageCircle">MessageCircle</option>
                    <option value="Plane">Plane</option>
                    <option value="GraduationCap">GraduationCap</option>
                    <option value="CreditCard">CreditCard</option>
                    <option value="ShieldCheck">ShieldCheck</option>
                    <option value="Users">Users</option>
                    <option value="Headphones">Headphones</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryColor">Color</Label>
                  <Input
                    id="categoryColor"
                    value={categoryForm.color}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        color: e.target.value,
                      })
                    }
                    placeholder="bg-blue-100 text-blue-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryCount">Count (Auto-calculated)</Label>
                  <Input
                    id="categoryCount"
                    value={categoryForm.count}
                    disabled
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddCategory}>
                  {editingCategory ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Category
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </>
                  )}
                </Button>
                {editingCategory && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({
                        name: "",
                        icon: "MessageCircle",
                        count: 0,
                        color: "bg-blue-100 text-blue-800",
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Categories ({formData.categories?.length || 0})
              </CardTitle>
              <CardDescription>Manage your FAQ categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.categories?.map((category) => {
                  const IconComponent =
                    iconMap[category.icon as IconName] || MessageCircle;
                  return (
                    <div
                      key={category.name}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.count} FAQs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{category.icon}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {(!formData.categories || formData.categories.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No categories added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</CardTitle>
              <CardDescription>
                {editingFaq
                  ? "Update FAQ information"
                  : "Create a new FAQ entry"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={faqForm.question}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, question: e.target.value })
                  }
                  placeholder="What flight training programs do you offer?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={faqForm.answer}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, answer: e.target.value })
                  }
                  placeholder="Personal Wings offers comprehensive flight training programs..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faqCategory">Category</Label>
                  <select
                    id="faqCategory"
                    value={faqForm.category}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, category: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select category</option>
                    {formData.categories?.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={faqForm.order || 0}
                    onChange={(e) =>
                      setFaqForm({
                        ...faqForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {faqForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={faqForm.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setFaqForm({ ...faqForm, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddFaq}>
                  {editingFaq ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update FAQ
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </>
                  )}
                </Button>
                {editingFaq && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingFaq(null);
                      setFaqForm({
                        question: "",
                        answer: "",
                        category: "",
                        tags: [],
                        isActive: true,
                        order: 0,
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FAQs List */}
          <Card>
            <CardHeader>
              <CardTitle>FAQs ({formData.faqs?.length || 0})</CardTitle>
              <CardDescription>Manage your FAQ entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.faqs
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((faq, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{faq.question}</p>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {faq.answer}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{faq.category}</Badge>
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                            {!faq.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline">#{faq.order || 0}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFaq(faq)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFaq(faq.question)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {(!formData.faqs || formData.faqs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No FAQs added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your FAQs page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Page Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoMeta?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="FAQs - Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoMeta?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        description: e.target.value,
                      },
                    })
                  }
                  placeholder="Find answers to common questions about flight training..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoMeta?.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k),
                      },
                    })
                  }
                  placeholder="flight training, faqs, aviation, courses"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  value={formData.seoMeta?.ogTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        ogTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="FAQs - Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.seoMeta?.ogDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        ogDescription: e.target.value,
                      },
                    })
                  }
                  placeholder="Find answers to common questions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.seoMeta?.ogImage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        ogImage: e.target.value,
                      },
                    })
                  }
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.seoMeta?.canonicalUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        canonicalUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://personalwings.com/faqs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
