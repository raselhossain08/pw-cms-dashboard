"use client";

import * as React from "react";
import { useToast } from "@/context/ToastContext";
import { useCourseCategories } from "@/hooks/useCourseCategories";
import { uploadService } from "@/services/upload.service";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Trash2,
  Tag,
  TrendingUp,
  Layers,
  BookOpen,
  Edit3,
  Search,
  Filter,
  ImageIcon,
  X,
  Loader2,
  Power,
  PowerOff,
  CheckSquare,
  Copy,
  Download,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface CategoryItem {
  _id?: string;
  name: string;
  slug: string;
  count?: number;
  isActive?: boolean;
  image?: string;
}

export default function CourseCategories() {
  const { push } = useToast();
  const {
    categories: categoriesList,
    loading: categoriesLoading,
    stats: backendStats,
    statsLoading,
    createCategory: createCategoryHook,
    updateCategory: updateCategoryHook,
    deleteCategory: deleteCategoryHook,
    toggleCategoryStatus,
    duplicateCategory: duplicateCategoryHook,
    bulkDeleteCategories,
    bulkToggleStatus,
    exportCategories,
    refreshCategories,
    getCategoryStats,
  } = useCourseCategories();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<CategoryItem | null>(
    null
  );
  const [deleteCategory, setDeleteCategory] = React.useState<string | null>(
    null
  );
  const [search, setSearch] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories: CategoryItem[] = React.useMemo(() => {
    return categoriesList.map((cat: any) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      count: cat.courseCount || 0,
      image: cat.image,
      isActive: cat.isActive !== false,
    }));
  }, [categoriesList]);

  const filtered = React.useMemo(() => {
    if (!search) return categories;
    const searchLower = search.toLowerCase();
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchLower)
    );
  }, [categories, search]);

  React.useEffect(() => {
    getCategoryStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch stats once on mount

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      push({ type: "error", message: "Category name is required" });
      return;
    }

    try {
      let imageUrl = "";

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadService.uploadFile(imageFile, {
            type: "image",
            description: "Category image",
            tags: ["category", "image"],
            onProgress: (progress) => {
              setUploadProgress(progress.percentage);
            },
          });
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          push({
            type: "error",
            message: "Failed to upload image. Creating category without image.",
          });
        } finally {
          setIsUploading(false);
        }
      }

      const payload: any = { name };
      if (imageUrl) {
        payload.image = imageUrl;
      }

      setActionLoading(true);
      await createCategoryHook(payload);
      setCreateOpen(false);
      setImageFile(null);
      setImagePreview("");
      setUploadProgress(0);
    } catch (err) {
      console.error("Failed to create category:", err);
      setIsUploading(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      push({ type: "error", message: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      push({ type: "error", message: "Image size must be less than 5MB" });
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCategory) return;

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      push({ type: "error", message: "Category name is required" });
      return;
    }

    try {
      let imageUrl = editCategory.image || "";

      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadService.uploadFile(imageFile, {
            type: "image",
            description: "Category image",
            tags: ["category", "image"],
            onProgress: (progress) => {
              setUploadProgress(progress.percentage);
            },
          });
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          push({
            type: "error",
            message:
              "Failed to upload image. Updating category without new image.",
          });
        } finally {
          setIsUploading(false);
        }
      }

      const payload: any = { name };
      if (imageUrl) {
        payload.image = imageUrl;
      }

      setActionLoading(true);
      await updateCategoryHook(editCategory.slug, payload);
      setEditCategory(null);
      setImageFile(null);
      setImagePreview("");
      setUploadProgress(0);
    } catch (err) {
      console.error("Failed to update category:", err);
      setIsUploading(false);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (category: CategoryItem) => {
    setEditCategory(category);
    setImagePreview(category.image || "");
    setImageFile(null);
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setActionLoading(true);
    try {
      await deleteCategoryHook(deleteCategory);
      setDeleteCategory(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (slug: string) => {
    setActionLoading(true);
    try {
      await toggleCategoryStatus(slug);
    } catch (err) {
      console.error("Failed to toggle category status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (slug: string) => {
    setActionLoading(true);
    try {
      await duplicateCategoryHook(slug);
    } catch (err) {
      console.error("Failed to duplicate category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkDeleteCategories(selectedIds);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch (err) {
      console.error("Failed to bulk delete categories:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkToggleStatus = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkToggleStatus(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to bulk toggle status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    setIsExporting(true);
    try {
      await exportCategories(format);
    } catch (err) {
      console.error("Failed to export categories:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSelection = (slug: string) => {
    setSelectedIds((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.slug));
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <FolderTree className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Course Categories
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Organize aviation training courses into categories
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isExporting || categories.length === 0}
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
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={() => refreshCategories()}
                disabled={categoriesLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    categoriesLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>

              {/* Create Button */}
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Categories
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {backendStats?.totalCategories ?? categories.length}
                </p>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {backendStats?.activeCategories ??
                    categories.filter((c) => c.isActive).length}{" "}
                  active
                </p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <FolderTree className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {backendStats?.totalCourses ??
                    categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
                </p>
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Across all categories
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <Layers className="text-amber-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Avg per Category
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {backendStats?.averageCoursesPerCategory ??
                    (categories.length > 0
                      ? Math.round(
                          categories.reduce(
                            (sum, cat) => sum + (cat.count || 0),
                            0
                          ) / categories.length
                        )
                      : 0)}
                </p>
                <p className="text-purple-600 text-sm mt-2 flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  Courses per category
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <Tag className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="px-3 py-1">
                  <CheckSquare className="w-3 h-3 mr-1" />
                  {selectedIds.length} selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkToggleStatus}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Power className="w-4 h-4 mr-2" />
                  )}
                  Toggle Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                  disabled={actionLoading}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
              </div>
            )}
            {selectedIds.length === 0 && filtered.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedIds.length === filtered.length &&
                    filtered.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-slate-600">Select All</span>
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-40 animate-pulse bg-slate-100 rounded-xl border border-slate-200"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderTree className="text-slate-400 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {search ? "No categories found" : "No categories yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {search
                ? "Try adjusting your search to find what you're looking for"
                : "Create your first category to start organizing your aviation training courses"}
            </p>
            {!search && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((category) => (
              <div
                key={category.slug}
                className={`group bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 ${
                  selectedIds.includes(category.slug)
                    ? "border-primary bg-primary/5"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedIds.includes(category.slug)}
                      onCheckedChange={() => toggleSelection(category.slug)}
                      className="mt-1"
                    />
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Tag className="text-primary w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        {category.slug}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-slate-600 shrink-0"
                        disabled={actionLoading}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(category)}
                        disabled={actionLoading}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(category.slug)}
                        disabled={actionLoading}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(category.slug)}
                        disabled={actionLoading}
                      >
                        {category.isActive ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteCategory(category.slug)}
                        disabled={actionLoading}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {category.count || 0} courses
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {category.isActive ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-slate-500">Active</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-slate-500">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) clearImage();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Add New Category
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a new category to organize your aviation training courses
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Category Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Jet Transition Training"
                  className="w-full"
                  required
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  A unique name for this category. It will be automatically
                  converted to a URL-friendly slug.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Category Image (Optional)
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Category preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-8 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG or WEBP (MAX. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateOpen(false);
                    clearImage();
                  }}
                  disabled={isUploading || actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isUploading || actionLoading}
                >
                  {isUploading || actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Category
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={!!editCategory}
          onOpenChange={(open) => {
            if (!open) {
              setEditCategory(null);
              clearImage();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Edit Category
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Update the category details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Category Name *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editCategory?.name}
                  placeholder="e.g., Jet Transition Training"
                  className="w-full"
                  required
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Update the category name
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Category Image (Optional)
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Category preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-8 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG or WEBP (MAX. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditCategory(null);
                    clearImage();
                  }}
                  disabled={isUploading || actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isUploading || actionLoading}
                >
                  {isUploading || actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Update Category
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteCategory}
          onOpenChange={(v) => !v && setDeleteCategory(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Delete Category?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This will permanently delete the category. Courses in this
                category will not be deleted but will need to be re-categorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Delete Categories?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This will permanently delete {selectedIds.length} categor
                {selectedIds.length > 1 ? "ies" : "y"}. Courses in these
                categories will not be deleted but will need to be
                re-categorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  `Delete ${selectedIds.length} Categor${
                    selectedIds.length > 1 ? "ies" : "y"
                  }`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
