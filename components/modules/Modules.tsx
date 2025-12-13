"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import {
  modulesService,
  type ModuleDto,
  type Lesson,
} from "@/services/modules.service";
import { coursesService } from "@/services/courses.service";
import {
  Layers,
  PlayCircle,
  Clock,
  EllipsisVertical,
  ArrowUp,
  CheckCircle,
  ChartLine,
  Paintbrush,
  Database,
  Share2,
  Pencil,
  Download,
  Filter,
  Plus,
  Eye,
  Trash,
  BookOpen,
  TrendingUp,
  Copy,
  Plane,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";

type ModuleItem = {
  id: string;
  title: string;
  course: string;
  courseTitle?: string;
  lessons: number;
  duration: string;
  durationHours: number;
  status: "published" | "draft" | "archived";
  completion: number;
  description?: string;
  icon: React.ReactNode;
  accentClass: string;
  badgeClass: string;
  type?: string;
  level?: string;
  price?: number;
  thumbnail?: string;
  instructor?: any;
};

export default function Modules() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(50);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["modules", page, limit],
    queryFn: () => modulesService.getAllModules({ page, limit }),
    staleTime: 30000,
  });

  // Fetch courses for module creation
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const modules: ModuleItem[] = React.useMemo(() => {
    const responseData: any = data;
    // Handle different API response structures
    // API returns: { data: { modules: [...] } }
    const modulesList = Array.isArray(responseData?.data?.modules)
      ? responseData.data.modules
      : Array.isArray(responseData?.modules)
      ? responseData.modules
      : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(data)
      ? data
      : [];

    return modulesList.map((m: any) => {
      const lessonsCount = Array.isArray(m.lessons)
        ? m.lessons.length
        : m.lessonsCount || 0;
      const durationHours = m.duration || m.durationHours || 0;
      const durationStr =
        durationHours >= 1
          ? `${Math.floor(durationHours)}h ${Math.round(
              (durationHours % 1) * 60
            )}m`
          : `${Math.round(durationHours * 60)}m`;

      // Extract course information
      const courseObj = typeof m.course === "object" ? m.course : null;
      const courseId = courseObj?._id || m.course || "";
      const courseTitle = courseObj?.title || "No Course";

      return {
        id: m._id || m.id,
        title: m.title,
        course: courseId,
        courseTitle: courseTitle,
        lessons: lessonsCount,
        duration: durationStr,
        durationHours,
        status: m.status || (m.isPublished ? "published" : "draft"),
        completion: m.completionRate || m.completion || 0,
        description: m.description || m.excerpt,
        icon: <Plane className="text-blue-600" />,
        accentClass: "bg-blue-50",
        badgeClass:
          m.status === "published" || m.isPublished
            ? "bg-green-50 text-green-700"
            : "bg-amber-50 text-amber-700",
        type: m.type,
        level: m.level,
        price: m.price,
        thumbnail: m.thumbnail,
        instructor: m.instructor,
      };
    });
  }, [data]);

  const availableCourses = React.useMemo(() => {
    const apiData = (coursesData as any)?.data || coursesData;
    const list = apiData?.courses || [];
    return list.map((c: any) => ({
      id: c._id || c.id,
      title: c.title,
    }));
  }, [coursesData]);

  React.useEffect(() => {
    if (error) {
      push({ type: "error", message: "Failed to load modules" });
    }
  }, [error, push]);
  const [search, setSearch] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [editModule, setEditModule] = React.useState<ModuleItem | null>(null);
  const [previewModule, setPreviewModule] = React.useState<ModuleItem | null>(
    null
  );
  const [analyticsModule, setAnalyticsModule] =
    React.useState<ModuleItem | null>(null);
  const [shareModule, setShareModule] = React.useState<ModuleItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return modules
      .filter((m) => {
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            m.title.toLowerCase().includes(searchLower) ||
            m.description?.toLowerCase().includes(searchLower) ||
            m.type?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter((m) => {
        if (levelFilter === "all") return true;
        return m.level?.toLowerCase() === levelFilter;
      })
      .filter((m) => {
        if (statusFilter === "all") return true;
        return m.status === statusFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return b.id.localeCompare(a.id);
          case "oldest":
            return a.id.localeCompare(b.id);
          case "name":
            return a.title.localeCompare(b.title);
          case "lessons":
            return b.lessons - a.lessons;
          case "duration":
            return b.durationHours - a.durationHours;
          case "price":
            return (b.price || 0) - (a.price || 0);
          default:
            return 0;
        }
      });
  }, [modules, search, levelFilter, statusFilter, sortBy]);

  const stats = React.useMemo(() => {
    const published = modules.filter((m) => m.status === "published").length;
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons, 0);
    const avgCompletion =
      modules.length > 0
        ? Math.round(
            modules.reduce((sum, m) => sum + m.completion, 0) / modules.length
          )
        : 0;
    const totalRevenue = modules.reduce((sum, m) => sum + (m.price || 0), 0);

    return {
      total: modules.length,
      published,
      totalLessons,
      avgCompletion,
      totalRevenue,
    };
  }, [modules]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Aviation Training Courses
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Professional flight training modules for Personal Wings
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Training Course
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="hidden md:flex flex-wrap gap-3">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-44 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-52 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="lessons">Most Lessons</SelectItem>
                  <SelectItem value="duration">Longest Duration</SelectItem>
                  <SelectItem value="price">Highest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              <Button
                variant="outline"
                className="md:hidden border-slate-200"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  push({
                    type: "info",
                    message: "Export functionality coming soon",
                  });
                }}
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.published} published
                </p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.published}
                </p>
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {stats.total > 0
                    ? Math.round((stats.published / stats.total) * 100)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <Award className="text-green-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Lessons
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalLessons}
                </p>
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <PlayCircle className="w-3 h-3 mr-1" />
                  Across all courses
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-amber-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Avg. Completion
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.avgCompletion}%
                </p>
                <p className="text-purple-600 text-sm mt-2 flex items-center">
                  <ChartLine className="w-3 h-3 mr-1" />
                  Student progress
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <ChartLine className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-80 animate-pulse bg-slate-100 rounded-xl border border-slate-200"
              >
                <div className="p-6 space-y-4">
                  <div className="h-12 bg-slate-200 rounded-lg w-12"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plane className="text-slate-400 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {search || levelFilter !== "all" || statusFilter !== "all"
                ? "No courses found"
                : "No training courses yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {search || levelFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Create your first aviation training course to start building your flight training program"}
            </p>
            {!search && levelFilter === "all" && statusFilter === "all" && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Course Thumbnail */}
                {m.thumbnail && (
                  <div className="mb-4 -mx-6 -mt-6 h-40 overflow-hidden rounded-t-xl">
                    <img
                      src={m.thumbnail}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-10 h-10 ${m.accentClass} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
                          {m.title}
                        </h3>
                        {m.level && (
                          <span className="text-xs font-medium text-slate-500 capitalize">
                            {m.level} Level
                          </span>
                        )}
                        {m.courseTitle && (
                          <div className="mt-1">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                              {m.courseTitle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 -mr-2"
                      >
                        <EllipsisVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onSelect={() => setEditModule(m)}>
                        <Pencil className="w-4 h-4 mr-2 text-primary" />
                        <span>Edit Course</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setPreviewModule(m)}>
                        <Eye className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setAnalyticsModule(m)}>
                        <ChartLine className="w-4 h-4 mr-2 text-purple-600" />
                        <span>View Analytics</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={async () => {
                          try {
                            await modulesService.duplicateModule(m.id);
                            push({
                              type: "success",
                              message: "Course duplicated successfully",
                            });
                            queryClient.invalidateQueries({
                              queryKey: ["modules"],
                            });
                          } catch {
                            push({
                              type: "error",
                              message: "Failed to duplicate course",
                            });
                          }
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setShareModule(m)}>
                        <Share2 className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={() => setDeleteId(m.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {m.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center text-sm text-slate-600">
                    <PlayCircle className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className="font-medium">{m.lessons}</span>
                    <span className="ml-1">lessons</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium">{m.duration}</span>
                  </div>
                  {m.type && (
                    <div className="flex items-center text-sm text-slate-600 capitalize">
                      <Layers className="w-4 h-4 mr-1.5 text-purple-500" />
                      <span className="font-medium">{m.type}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${m.badgeClass}`}
                  >
                    {m.status === "published"
                      ? "✓ Published"
                      : m.status === "draft"
                      ? "Draft"
                      : "Archived"}
                  </span>
                  {m.price !== undefined && (
                    <span className="text-lg font-bold text-primary">
                      ${m.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {m.completion > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span className="font-medium">Completion Rate</span>
                      <span className="font-semibold">{m.completion}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${m.completion}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                    onClick={() => setEditModule(m)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => setPreviewModule(m)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Create New Module
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a new training module within an existing course
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const title = String(fd.get("title") || "");
                const courseId = String(fd.get("course") || "");
                const description = String(fd.get("description") || "");
                const duration = Number(fd.get("duration") || 0);
                const status = String(fd.get("status") || "draft");
                const order = Number(fd.get("order") || 1);

                if (!courseId) {
                  push({ type: "error", message: "Please select a course" });
                  return;
                }

                try {
                  await modulesService.createModule({
                    title,
                    courseId,
                    description,
                    duration,
                    status: status as "published" | "draft",
                    order,
                  });
                  push({
                    type: "success",
                    message: "Module created successfully",
                  });
                  setCreateOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["modules"] });
                } catch (err) {
                  console.error(err);
                  push({ type: "error", message: "Failed to create module" });
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="course"
                  className="text-sm font-semibold text-slate-700"
                >
                  Course *
                </Label>
                <Select name="course" required>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.length > 0 ? (
                      availableCourses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableCourses.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Please create a course first before adding modules.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Module Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Introduction to Citation Jet"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe what this module covers..."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Duration (hours)
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="order"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Order
                  </Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    min="1"
                    placeholder="1"
                    defaultValue={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Status
                  </Label>
                  <Select name="status" defaultValue="draft">
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={availableCourses.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Module
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="lessons">Most Lessons</SelectItem>
                  <SelectItem value="duration">Longest Duration</SelectItem>
                  <SelectItem value="price">Highest Price</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setLevelFilter("all");
                    setStatusFilter("all");
                    setSortBy("newest");
                    setFiltersOpen(false);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Edit Dialog */}
      <Dialog
        open={!!editModule}
        onOpenChange={(v) => !v && setEditModule(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Edit Training Course
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update course information and settings
            </DialogDescription>
          </DialogHeader>
          {editModule && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const title = String(fd.get("title") || editModule.title);
                const description = String(
                  fd.get("description") || editModule.description || ""
                );
                const level = String(fd.get("level") || editModule.level);
                const type = String(fd.get("type") || editModule.type);
                const durationHours = Number(
                  fd.get("durationHours") || editModule.durationHours
                );
                const status = String(fd.get("status") || editModule.status);
                const price = Number(fd.get("price") || editModule.price);
                const maxStudents = Number(fd.get("maxStudents") || 10);

                try {
                  await coursesService.updateCourse(editModule.id, {
                    title,
                    description,
                    level: level as any,
                    type: type as any,
                    durationHours,
                    price,
                    maxStudents,
                    isPublished: status === "published",
                  });
                  push({
                    type: "success",
                    message: "Course updated successfully",
                  });
                  setEditModule(null);
                  queryClient.invalidateQueries({ queryKey: ["modules"] });
                } catch {
                  push({ type: "error", message: "Failed to update course" });
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="edit-title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Course Title *
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editModule.title}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  defaultValue={editModule.description || ""}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-level"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Level
                  </Label>
                  <Select
                    name="level"
                    defaultValue={editModule.level || "beginner"}
                  >
                    <SelectTrigger id="edit-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-type"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Type
                  </Label>
                  <Select
                    name="type"
                    defaultValue={editModule.type || "combined"}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theoretical">Theoretical</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="simulator">Simulator</SelectItem>
                      <SelectItem value="combined">Combined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-duration"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Duration (hours)
                  </Label>
                  <Input
                    id="edit-duration"
                    name="durationHours"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={editModule.durationHours}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-price"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Price ($)
                  </Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editModule.price || 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-maxStudents"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Max Students
                  </Label>
                  <Input
                    id="edit-maxStudents"
                    name="maxStudents"
                    type="number"
                    min="1"
                    defaultValue={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-status"
                  className="text-sm font-semibold text-slate-700"
                >
                  Status
                </Label>
                <Select name="status" defaultValue={editModule.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModule(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewModule}
        onOpenChange={(v) => !v && setPreviewModule(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Course Preview
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Complete overview of the training course
            </DialogDescription>
          </DialogHeader>
          {previewModule && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {previewModule.title}
                </h3>
                {previewModule.description && (
                  <p className="text-slate-600">{previewModule.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Level</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {previewModule.level || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Type</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {previewModule.type || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {previewModule.duration}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Lessons</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {previewModule.lessons}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {previewModule.status}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Price</p>
                  <p className="text-lg font-semibold text-primary">
                    $
                    {previewModule.price
                      ? previewModule.price.toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={!!analyticsModule}
        onOpenChange={(v) => !v && setAnalyticsModule(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Course Analytics
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Performance metrics and insights
            </DialogDescription>
          </DialogHeader>
          {analyticsModule && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-5 text-center">
                  <p className="text-sm text-primary font-medium mb-2">
                    Completion Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {analyticsModule.completion}%
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-5 text-center">
                  <p className="text-sm text-amber-600 font-medium mb-2">
                    Total Lessons
                  </p>
                  <p className="text-3xl font-bold text-amber-700">
                    {analyticsModule.lessons}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-5 text-center">
                  <p className="text-sm text-purple-600 font-medium mb-2">
                    Duration
                  </p>
                  <p className="text-3xl font-bold text-purple-700">
                    {analyticsModule.durationHours}h
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Course Progress
                </h4>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${analyticsModule.completion}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={!!shareModule}
        onOpenChange={(v) => !v && setShareModule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Share Course
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Share this training course with others
            </DialogDescription>
          </DialogHeader>
          {shareModule && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/courses/${shareModule.id}`}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/courses/${shareModule.id}`
                    );
                    push({
                      type: "success",
                      message: "Link copied to clipboard",
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                Share this link with pilots interested in:{" "}
                <strong>{shareModule.title}</strong>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Delete Training Course?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the
              course and all associated lessons and progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                try {
                  await modulesService.deleteModule(deleteId);
                  push({
                    type: "success",
                    message: "Course deleted successfully",
                  });
                  setDeleteId(null);
                  queryClient.invalidateQueries({ queryKey: ["modules"] });
                } catch {
                  push({ type: "error", message: "Failed to delete course" });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
