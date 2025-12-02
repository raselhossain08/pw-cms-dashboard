"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import {
  lessonsService,
  LessonType,
  LessonStatus,
  CreateLessonPayload,
  UpdateLessonPayload,
} from "@/services/lessons.service";
import { coursesService } from "@/services/courses.service";
import {
  PlayCircle,
  FileText,
  GripVertical,
  Eye,
  Clock,
  EllipsisVertical,
  ArrowUp,
  CheckCircle,
  ChartLine,
  Filter,
  Download,
  Plus,
  Pencil,
  Layers,
  Trash,
  CircleHelp,
  ListTodo,
  Search,
  Upload,
  Loader2,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  Video,
  FileTextIcon,
  Gift,
  Lock,
  Tag,
  X,
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
  DialogFooter,
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

type LessonItem = {
  id: string;
  position: number;
  title: string;
  course: string;
  module: string;
  type: LessonType;
  duration: number; // in seconds
  durationDisplay: string;
  views: number;
  status: LessonStatus;
  completion: number;
  thumbnail?: string;
  videoUrl?: string;
  isFree: boolean;
  completionCount: number;
  averageScore: number;
};

export default function LessonsEnhanced() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("position");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editLesson, setEditLesson] = React.useState<LessonItem | null>(null);
  const [previewLesson, setPreviewLesson] = React.useState<LessonItem | null>(
    null
  );
  const [analyticsLesson, setAnalyticsLesson] =
    React.useState<LessonItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [createPreset, setCreatePreset] = React.useState<{
    type?: LessonType;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [seoTags, setSeoTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", { page: 1, limit: 100 }],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
  });

  const courseList: any[] = React.useMemo(() => {
    const raw: any = coursesData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.courses)) return raw.courses;
    return [];
  }, [coursesData]);

  React.useEffect(() => {
    if (!selectedCourseId && courseList.length > 0) {
      setSelectedCourseId(courseList[0]._id);
    }
  }, [courseList, selectedCourseId]);

  // Fetch lessons
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    isFetching: lessonsFetching,
    error: lessonsError,
  } = useQuery({
    queryKey: ["lessons", selectedCourseId],
    queryFn: () =>
      selectedCourseId
        ? lessonsService.getCourseLessons(selectedCourseId)
        : Promise.resolve([]),
    enabled: !!selectedCourseId,
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["lessons-analytics", selectedCourseId],
    queryFn: () =>
      selectedCourseId
        ? lessonsService.getCourseAnalytics(selectedCourseId)
        : Promise.resolve(null),
    enabled: !!selectedCourseId,
  });

  const lessons: LessonItem[] = React.useMemo(() => {
    const raw: any = lessonsData as any;
    const arr: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    return arr.map((l: any, idx: number) => ({
      id: l._id,
      position: l.order ?? idx + 1,
      title: l.title,
      course:
        courseList.find((c: any) => c._id === selectedCourseId)?.title || "",
      module: "", // Can be enhanced with module data
      type: (l.type || LessonType.VIDEO) as LessonType,
      duration: l.duration || 0,
      durationDisplay: formatDuration(l.duration || 0),
      views: l.completionCount || 0,
      status: (l.status || LessonStatus.DRAFT) as LessonStatus,
      completion: l.averageScore || 0,
      thumbnail: l.thumbnail,
      videoUrl: l.videoUrl,
      isFree: l.isFree || false,
      completionCount: l.completionCount || 0,
      averageScore: l.averageScore || 0,
    }));
  }, [lessonsData, selectedCourseId, courseList]);

  function formatDuration(seconds: number): string {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Filtered and sorted lessons
  const filtered = React.useMemo(() => {
    return lessons
      .filter((l) =>
        search ? l.title.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((l) => (typeFilter === "all" ? true : l.type === typeFilter))
      .filter((l) =>
        statusFilter === "all" ? true : l.status === statusFilter
      )
      .sort((a, b) => {
        if (sortBy === "position") return a.position - b.position;
        if (sortBy === "newest") return b.id.localeCompare(a.id);
        if (sortBy === "duration") return b.duration - a.duration;
        if (sortBy === "completion") return b.completion - a.completion;
        return 0;
      });
  }, [lessons, search, typeFilter, statusFilter, sortBy]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = lessons.length;
    const videoCount = lessons.filter(
      (l) => l.type === LessonType.VIDEO
    ).length;
    const avgDuration =
      total > 0
        ? Math.floor(
            lessons.reduce((sum, l) => sum + l.duration, 0) / total / 60
          )
        : 0;
    const avgCompletion =
      total > 0
        ? Math.round(lessons.reduce((sum, l) => sum + l.completion, 0) / total)
        : 0;
    return { total, videoCount, avgDuration, avgCompletion };
  }, [lessons]);

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: ({
      courseId,
      lessonIds,
    }: {
      courseId: string;
      lessonIds: string[];
    }) => lessonsService.reorderLessons(courseId, lessonIds),
    onSuccess: () => {
      push({ type: "success", message: "✓ Order updated successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to update order",
      });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: CreateLessonPayload;
    }) => lessonsService.createLesson(courseId, payload),
    onSuccess: () => {
      push({ type: "success", message: "✓ Lesson created successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      setCreateOpen(false);
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to create lesson",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: any }) =>
      lessonsService.updateLesson(lessonId, payload),
    onSuccess: () => {
      push({ type: "success", message: "✓ Lesson updated successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      setEditLesson(null);
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to update lesson",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => lessonsService.deleteLesson(lessonId),
    onSuccess: () => {
      push({ type: "success", message: "✓ Lesson deleted successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to delete lesson",
      });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (lessonId: string) => lessonsService.duplicateLesson(lessonId),
    onSuccess: () => {
      push({ type: "success", message: "✓ Lesson duplicated successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to duplicate lesson",
      });
    },
  });

  function onDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const order = [...lessons];
    const from = order.findIndex((l) => l.id === draggedId);
    const to = order.findIndex((l) => l.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    const ids = order.map((l) => l.id);
    if (selectedCourseId) {
      reorderMutation.mutate({ courseId: selectedCourseId, lessonIds: ids });
    }
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function getLessonIcon(type: LessonType) {
    switch (type) {
      case LessonType.VIDEO:
        return <PlayCircle className="w-4 h-4" />;
      case LessonType.TEXT:
        return <FileText className="w-4 h-4" />;
      case LessonType.QUIZ:
        return <CircleHelp className="w-4 h-4" />;
      case LessonType.ASSIGNMENT:
        return <ListTodo className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6  mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-2">
                Lesson Management
              </h2>
              <p className="text-gray-600 text-lg">
                Create, organize, and manage your course content
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                onClick={() => {
                  setCreatePreset(null);
                  setCreateOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" /> Create Lesson
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-6 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons... (⌘K)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchRef}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Lessons
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    stats.total
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <TrendingUp className="inline w-3 h-3 mr-1" /> Active
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Video Lessons
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    stats.videoCount
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <CheckCircle className="inline w-3 h-3 mr-1" />{" "}
                  {((stats.videoCount / stats.total) * 100 || 0).toFixed(0)}%
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-accent w-7 h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Avg. Duration
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    `${stats.avgDuration}m`
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <Clock className="inline w-3 h-3 mr-1" /> Optimal
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="text-yellow-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Completion
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    `${stats.avgCompletion}%`
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <ArrowUp className="inline w-3 h-3 mr-1" /> +8%
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                <ChartLine className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-6 animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-3">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-56 hover:bg-gray-100 transition-all">
                  <SelectValue
                    placeholder={
                      coursesLoading ? "Loading..." : "Select course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courseList.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-gray-100 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={LessonType.VIDEO}>Video</SelectItem>
                  <SelectItem value={LessonType.TEXT}>Text</SelectItem>
                  <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
                  <SelectItem value={LessonType.ASSIGNMENT}>
                    Assignment
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-gray-100 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={LessonStatus.PUBLISHED}>
                    Published
                  </SelectItem>
                  <SelectItem value={LessonStatus.DRAFT}>Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-44 hover:bg-gray-100 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position">Sort: Position</SelectItem>
                  <SelectItem value="newest">Sort: Newest</SelectItem>
                  <SelectItem value="duration">Sort: Duration</SelectItem>
                  <SelectItem value="completion">Sort: Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-secondary">
                  {courseList.find((c) => c._id === selectedCourseId)?.title ||
                    "Course Lessons"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {filtered.length} lesson{filtered.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              </div>
              {lessonsFetching && !lessonsLoading && (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              )}
            </div>
          </div>

          {lessonsLoading ? (
            <div className="p-8 grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="animate-pulse h-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : lessonsError ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">Failed to load lessons</p>
              <p className="text-gray-500 text-sm mt-2">
                Please try refreshing the page
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                No lessons found
              </h4>
              <p className="text-gray-500 mb-6">
                {search || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first lesson to get started"}
              </p>
              {!search && typeFilter === "all" && statusFilter === "all" && (
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Lesson
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`lesson-item group hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 ${
                    dragOverId === lesson.id
                      ? "bg-primary/5 border-l-4 border-primary"
                      : ""
                  }`}
                  draggable
                  onDragStart={() => setDraggedId(lesson.id)}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setDragOverId(lesson.id)}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={() => {
                    setDragOverId(null);
                    onDrop(lesson.id);
                  }}
                  style={{
                    animation: `slideInLeft 0.3s ease-out ${
                      index * 0.05
                    }s backwards`,
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Drag Handle */}
                        <div className="flex items-center space-x-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                          <button className="hover:bg-gray-100 p-2 rounded-lg transition-all">
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-semibold w-8 text-center bg-gray-100 rounded-lg py-1 group-hover:bg-primary group-hover:text-white transition-all">
                            {lesson.position}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div className="flex items-center space-x-4 flex-1">
                          {lesson.type === LessonType.VIDEO ? (
                            <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                              {lesson.thumbnail ? (
                                <img
                                  src={lesson.thumbnail}
                                  alt={lesson.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                  <PlayCircle className="w-6 h-6 text-primary" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayCircle className="text-white w-6 h-6" />
                              </div>
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                {lesson.durationDisplay}
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`w-24 h-16 rounded-lg flex items-center justify-center shadow-sm ${
                                lesson.type === LessonType.TEXT
                                  ? "bg-gray-100"
                                  : lesson.type === LessonType.QUIZ
                                  ? "bg-primary/10"
                                  : "bg-yellow-50"
                              }`}
                            >
                              {getLessonIcon(lesson.type)}
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-secondary truncate group-hover:text-primary transition-colors">
                                {lesson.title}
                              </h4>
                              {lesson.isFree && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  FREE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                {getLessonIcon(lesson.type)}
                                <span className="capitalize">
                                  {lesson.type}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.durationDisplay}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>
                                  {lesson.completionCount} completions
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3 ml-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                            lesson.status === LessonStatus.PUBLISHED
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {lesson.status === LessonStatus.PUBLISHED
                            ? "Published"
                            : "Draft"}
                        </span>

                        <div className="w-24">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span className="font-medium">
                              {lesson.averageScore}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                lesson.status === LessonStatus.PUBLISHED
                                  ? "bg-gradient-to-r from-accent to-primary"
                                  : "bg-gray-400"
                              }`}
                              style={{ width: `${lesson.averageScore}%` }}
                            />
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <EllipsisVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onSelect={() => setEditLesson(lesson)}
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit Lesson
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                duplicateMutation.mutate(lesson.id)
                              }
                            >
                              <Layers className="w-4 h-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setPreviewLesson(lesson)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setAnalyticsLesson(lesson)}
                            >
                              <ChartLine className="w-4 h-4 mr-2" /> Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => setDeleteId(lesson.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100 animate-slide-up"
          style={{ animationDelay: "0.7s" }}
        >
          <h3 className="text-xl font-semibold text-secondary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                type: LessonType.VIDEO,
                title: "Upload Video",
                desc: "Add video content",
                icon: Video,
                gradient: "from-primary to-primary/80",
              },
              {
                type: LessonType.TEXT,
                title: "Create Text",
                desc: "Add written content",
                icon: FileTextIcon,
                gradient: "from-accent to-accent/80",
              },
              {
                type: LessonType.QUIZ,
                title: "Add Quiz",
                desc: "Create assessment",
                icon: CircleHelp,
                gradient: "from-blue-500 to-blue-600",
              },
              {
                type: LessonType.ASSIGNMENT,
                title: "Create Task",
                desc: "Add practical task",
                icon: ListTodo,
                gradient: "from-yellow-500 to-yellow-600",
              },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCreatePreset({ type: action.type });
                  setCreateOpen(true);
                }}
                className="flex items-center space-x-3 p-4 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md group"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="text-white w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-secondary group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Lesson Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="min-w-[70vw] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create New Lesson
            </DialogTitle>
            <DialogDescription>
              Add a new lesson to your course. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);

              const title = String(fd.get("title") || "");
              const description = String(fd.get("description") || "");
              const type = String(
                fd.get("type") || createPreset?.type || LessonType.VIDEO
              );
              const durationInput = String(fd.get("duration") || "0");
              const durationMinutes =
                Number(durationInput.replace(/[^0-9]/g, "")) || 0;
              const duration = durationMinutes * 60;
              const content = String(fd.get("content") || "");
              const videoUrl = String(fd.get("videoUrl") || "");
              const isFree = fd.get("isFree") === "on";
              const status = String(fd.get("status") || LessonStatus.DRAFT);
              const metaTitle = String(fd.get("metaTitle") || "");
              const metaDescription = String(fd.get("metaDescription") || "");

              if (!selectedCourseId) {
                push({
                  type: "error",
                  message: "Please select a course first",
                });
                return;
              }

              const payload: CreateLessonPayload = {
                title,
                description,
                type: type as LessonType,
                content,
                videoUrl,
                duration,
                isFree,
                status: status as LessonStatus,
              };

              createMutation.mutate({ courseId: selectedCourseId, payload });
            }}
            className="space-y-6"
            onReset={() => {
              setVideoPreview(null);
              setVideoFile(null);
              setSeoTags([]);
              setTagInput("");
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  name="title"
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., Introduction to Flight Controls"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Type *
                </label>
                <input
                  type="hidden"
                  name="type"
                  value={createPreset?.type || LessonType.VIDEO}
                />
                <Select
                  defaultValue={createPreset?.type || LessonType.VIDEO}
                  onValueChange={(value) => {
                    const input = document.querySelector(
                      'input[name="type"]'
                    ) as HTMLInputElement;
                    if (input) input.value = value;
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LessonType.VIDEO}>
                      <div className="flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Video</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={LessonType.TEXT}>
                      <div className="flex items-center space-x-2">
                        <FileTextIcon className="w-4 h-4" />
                        <span>Text/Article</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={LessonType.QUIZ}>
                      <div className="flex items-center space-x-2">
                        <CircleHelp className="w-4 h-4" />
                        <span>Quiz</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={LessonType.ASSIGNMENT}>
                      <div className="flex items-center space-x-2">
                        <ListTodo className="w-4 h-4" />
                        <span>Assignment</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  name="duration"
                  type="number"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="15"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Brief description of the lesson content..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Upload or URL
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      name="videoUrl"
                      type="url"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://example.com/video.mp4 or upload below"
                      value={videoPreview || ""}
                      onChange={(e) => setVideoPreview(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </Button>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        const url = URL.createObjectURL(file);
                        setVideoPreview(url);
                      }
                    }}
                  />
                  {videoPreview && (
                    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-48 object-cover bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoPreview(null);
                          setVideoFile(null);
                          if (videoInputRef.current)
                            videoInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content (for text lessons)
                </label>
                <textarea
                  name="content"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Write your lesson content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <input type="hidden" name="status" value={LessonStatus.DRAFT} />
                <Select
                  defaultValue={LessonStatus.DRAFT}
                  onValueChange={(value) => {
                    const input = document.querySelector(
                      'input[name="status"]'
                    ) as HTMLInputElement;
                    if (input) input.value = value;
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LessonStatus.DRAFT}>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Draft</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={LessonStatus.PUBLISHED}>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Published</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center pt-8">
                <input
                  name="isFree"
                  type="checkbox"
                  id="isFree"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="isFree"
                  className="ml-2 flex items-center space-x-2 text-sm text-gray-700"
                >
                  <Gift className="w-4 h-4 text-primary" />
                  <span>Make this lesson free</span>
                </label>
              </div>
            </div>

            {/* SEO Tags Section */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>SEO & Metadata</span>
              </h4>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  name="metaTitle"
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="SEO-friendly title for search engines"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Brief description for search results (150-160 characters)"
                  maxLength={160}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          e.preventDefault();
                          if (!seoTags.includes(tagInput.trim())) {
                            setSeoTags([...seoTags, tagInput.trim()]);
                          }
                          setTagInput("");
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Add tags (press Enter)"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (
                          tagInput.trim() &&
                          !seoTags.includes(tagInput.trim())
                        ) {
                          setSeoTags([...seoTags, tagInput.trim()]);
                          setTagInput("");
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {seoTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {seoTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSeoTags(seoTags.filter((_, i) => i !== idx))
                            }
                            className="ml-1 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Lesson
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={!!editLesson}
        onOpenChange={(v) => !v && setEditLesson(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Edit Lesson
            </DialogTitle>
            <DialogDescription>
              Update the lesson details below.
            </DialogDescription>
          </DialogHeader>
          {editLesson && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);

                const title = String(fd.get("title") || editLesson.title);
                const description = String(fd.get("description") || "");
                const durationInput = String(fd.get("duration") || "0");
                const durationMinutes =
                  Number(durationInput.replace(/[^0-9]/g, "")) || 0;
                const duration = durationMinutes * 60;
                const content = String(fd.get("content") || "");
                const videoUrl = String(fd.get("videoUrl") || "");
                const isFree = fd.get("isFree") === "on";
                const status = String(fd.get("status") || editLesson.status);

                const payload: UpdateLessonPayload = {
                  title,
                  description,
                  content,
                  videoUrl,
                  duration,
                  isFree,
                  status: status as LessonStatus,
                };

                updateMutation.mutate({ lessonId: editLesson.id, payload });
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={editLesson.title}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="0"
                    defaultValue={Math.floor(editLesson.duration / 60)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <input
                    type="hidden"
                    name="status"
                    value={editLesson.status}
                  />
                  <Select
                    defaultValue={editLesson.status}
                    onValueChange={(value) => {
                      const input = document.querySelector(
                        'input[name="status"]'
                      ) as HTMLInputElement;
                      if (input) input.value = value;
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LessonStatus.DRAFT}>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Draft</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={LessonStatus.PUBLISHED}>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Published</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Video URL
                  </label>
                  <input
                    name="videoUrl"
                    type="url"
                    defaultValue={editLesson.videoUrl}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <input
                    name="isFree"
                    type="checkbox"
                    id="editIsFree"
                    defaultChecked={editLesson.isFree}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="editIsFree"
                    className="ml-2 flex items-center space-x-2 text-sm text-gray-700"
                  >
                    <Gift className="w-4 h-4 text-primary" />
                    <span>Make this lesson free</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditLesson(null)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Lesson Dialog */}
      <Dialog
        open={!!previewLesson}
        onOpenChange={(v) => !v && setPreviewLesson(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Preview Lesson
            </DialogTitle>
            <DialogDescription>
              Quick overview of the lesson content.
            </DialogDescription>
          </DialogHeader>
          {previewLesson && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                {previewLesson.type === LessonType.VIDEO &&
                  previewLesson.thumbnail && (
                    <img
                      src={previewLesson.thumbnail}
                      alt={previewLesson.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2">
                    {previewLesson.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      {getLessonIcon(previewLesson.type)}
                      <span className="capitalize">{previewLesson.type}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{previewLesson.durationDisplay}</span>
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        previewLesson.status === LessonStatus.PUBLISHED
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {previewLesson.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Position</p>
                    <p className="text-lg font-semibold">
                      #{previewLesson.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completions</p>
                    <p className="text-lg font-semibold">
                      {previewLesson.completionCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-lg font-semibold">
                      {previewLesson.averageScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Access</p>
                    <p className="text-lg font-semibold flex items-center space-x-2">
                      {previewLesson.isFree ? (
                        <>
                          <Gift className="w-5 h-5 text-green-600" />
                          <span>Free</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-gray-600" />
                          <span>Paid</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Lesson Dialog */}
      <Dialog
        open={!!analyticsLesson}
        onOpenChange={(v) => !v && setAnalyticsLesson(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
              <ChartLine className="w-6 h-6 text-primary" />
              <span>Lesson Analytics</span>
            </DialogTitle>
            <DialogDescription>
              Performance metrics and student engagement data.
            </DialogDescription>
          </DialogHeader>
          {analyticsLesson && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary font-medium">
                        Total Views
                      </p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {analyticsLesson.views}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Completions
                      </p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {analyticsLesson.completionCount}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Avg. Score
                      </p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {analyticsLesson.averageScore}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">
                        Duration
                      </p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        {analyticsLesson.durationDisplay}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Completion Rate</h4>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-accent to-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${analyticsLesson.completion}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-right">
                  {analyticsLesson.completion}%
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete Lesson?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete the
              lesson and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
