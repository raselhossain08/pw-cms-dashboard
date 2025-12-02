"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { courseCategoriesService } from "@/services/course-categories.service";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryItem {
  _id?: string;
  name: string;
  slug: string;
  count?: number;
  isActive?: boolean;
}

export default function CourseCategories() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteCategory, setDeleteCategory] = React.useState<string | null>(
    null
  );
  const [search, setSearch] = React.useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => courseCategoriesService.getAllCategories(),
    staleTime: 60000,
  });

  const categories: CategoryItem[] = React.useMemo(() => {
    // Handle nested API response structure: data.data.data.categories
    const apiData = data?.data?.data ?? data?.data ?? data;
    const categoryList = apiData?.categories ?? [];

    return categoryList.map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.courseCount || 0,
    }));
  }, [data]);

  const filtered = React.useMemo(() => {
    if (!search) return categories;
    const searchLower = search.toLowerCase();
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchLower)
    );
  }, [categories, search]);

  React.useEffect(() => {
    if (error) {
      push({ type: "error", message: "Failed to load categories" });
    }
  }, [error, push]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      push({ type: "error", message: "Category name is required" });
      return;
    }

    try {
      await courseCategoriesService.createCategory({ name });
      push({ type: "success", message: "Category created successfully" });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
    } catch {
      push({ type: "error", message: "Failed to create category" });
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    try {
      await courseCategoriesService.deleteCategory(deleteCategory);
      push({ type: "success", message: "Category deleted successfully" });
      setDeleteCategory(null);
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
    } catch {
      push({ type: "error", message: "Failed to delete category" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
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
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Course Categories
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Organize aviation training courses into categories
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
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
                  {categories.length}
                </p>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active categories
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
                  {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
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
                  {categories.length > 0
                    ? Math.round(
                        categories.reduce(
                          (sum, cat) => sum + (cat.count || 0),
                          0
                        ) / categories.length
                      )
                    : 0}
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

        {/* Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
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
                className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Tag className="text-primary w-6 h-6" />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    onClick={() => setDeleteCategory(category.slug)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-slate-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
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
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
