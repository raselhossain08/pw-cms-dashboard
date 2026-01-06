"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { useQuizzes, type QuizSubmission } from "@/hooks/useQuizzes";
import { quizzesService } from "@/services/quizzes.service";
import {
  type QuizDto,
  type CreateQuizPayload,
  type UpdateQuizPayload,
} from "@/services/quizzes.service";
import { coursesService } from "@/services/courses.service";
import QuizBuilder, { QuizQuestion } from "./QuizBuilder";
import { aviationQuizTemplates, QuizTemplate } from "./QuizTemplates";
import {
  FileQuestion,
  Clock,
  Target,
  TrendingUp,
  Users,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Copy,
  BarChart3,
  CheckCircle,
  Award,
  Plane,
  BookOpen,
  Filter,
  Download,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Power,
  PowerOff,
  CheckSquare,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuizItem {
  id: string;
  title: string;
  description: string;
  course: string;
  courseTitle?: string;
  questions: number;
  duration: number;
  passingScore: number;
  totalPoints: number;
  attemptsAllowed: number;
  status: "active" | "draft";
  averageScore?: number;
  completionRate?: number;
  totalAttempts?: number;
}

export default function Quizzes() {
  const { push } = useToast();
  const {
    quizzes: quizzesData,
    loading,
    error,
    pagination,
    stats: quizStats,
    statsLoading,
    submissions,
    submissionsLoading,
    getQuiz,
    getQuizStats,
    getQuizSubmissions,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleQuizStatus,
    duplicateQuiz,
    bulkDeleteQuizzes,
    bulkToggleStatus,
    refreshQuizzes,
    fetchQuizzes,
  } = useQuizzes();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [courseFilter, setCourseFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [previewQuiz, setPreviewQuiz] = React.useState<QuizItem | null>(null);
  const [analyticsQuiz, setAnalyticsQuiz] = React.useState<QuizItem | null>(
    null
  );
  const [submissionsQuiz, setSubmissionsQuiz] = React.useState<QuizItem | null>(
    null
  );
  const [editQuiz, setEditQuiz] = React.useState<QuizItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<QuizTemplate | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    courseId: "",
    lessonId: "",
    duration: 60,
    passingScore: 70,
    attemptsAllowed: 0,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    allowReview: true,
  });
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Fetch courses for selection
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const courses = (coursesData as any)?.courses || [];

  const quizzes: QuizItem[] = React.useMemo(() => {
    return quizzesData
      .filter((q: QuizDto | null | undefined) => q && q._id)
      .map((q: QuizDto) => ({
        id: q._id,
        title: q.title || "Untitled Quiz",
        description: q.description || "",
        course:
          typeof q.course === "object" && q.course
            ? q.course._id
            : q.course || "",
        courseTitle:
          typeof q.course === "object" && q.course ? q.course.title : undefined,
        questions: Array.isArray(q.questions) ? q.questions.length : 0,
        duration: q.duration || 60,
        passingScore: q.passingScore || 70,
        totalPoints: q.totalPoints || 100,
        attemptsAllowed: q.attemptsAllowed || 0,
        status: q.isActive ? "active" : "draft",
        averageScore: undefined, // Will be loaded from stats
        completionRate: undefined,
        totalAttempts: undefined,
      }));
  }, [quizzesData]);

  // Load stats when analytics dialog opens
  React.useEffect(() => {
    if (analyticsQuiz) {
      getQuizStats(analyticsQuiz.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsQuiz]);

  // Load submissions when submissions dialog opens
  React.useEffect(() => {
    if (submissionsQuiz) {
      getQuizSubmissions(submissionsQuiz.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionsQuiz]);

  const filtered = React.useMemo(() => {
    return quizzes
      .filter((q) => {
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            q.title.toLowerCase().includes(searchLower) ||
            q.description.toLowerCase().includes(searchLower) ||
            q.courseTitle?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter((q) => {
        if (statusFilter === "all") return true;
        return q.status === statusFilter;
      })
      .filter((q) => {
        if (courseFilter === "all") return true;
        return q.course === courseFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return b.id.localeCompare(a.id);
          case "oldest":
            return a.id.localeCompare(b.id);
          case "name":
            return a.title.localeCompare(b.title);
          case "questions":
            return b.questions - a.questions;
          case "attempts":
            return (b.totalAttempts || 0) - (a.totalAttempts || 0);
          default:
            return 0;
        }
      });
  }, [quizzes, search, statusFilter, courseFilter, sortBy]);

  const stats = React.useMemo(() => {
    const active = quizzes.filter((q) => q.status === "active").length;
    const totalAttempts = quizzes.reduce(
      (sum, q) => sum + (q.totalAttempts || 0),
      0
    );
    const avgScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + (q.averageScore || 0), 0) /
              quizzes.length
          )
        : 0;
    const avgCompletion =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + (q.completionRate || 0), 0) /
              quizzes.length
          )
        : 0;

    return {
      total: quizzes.length,
      active,
      totalAttempts,
      avgScore,
      avgCompletion,
    };
  }, [quizzes]);

  const handleCreateQuiz = async () => {
    if (!formData.title || !formData.courseId) {
      push({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    if (questions.length === 0) {
      push({ type: "error", message: "Please add at least one question" });
      return;
    }

    setActionLoading(true);
    try {
      const mappedQuestions = questions.map((q, index) => ({
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        explanation: q.explanation,
        order: index + 1,
      }));

      const payload: CreateQuizPayload = {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        lessonId: formData.lessonId || undefined,
        duration: formData.duration,
        passingScore: formData.passingScore,
        attemptsAllowed: formData.attemptsAllowed,
        questions: mappedQuestions,
        shuffleQuestions: formData.shuffleQuestions,
        showCorrectAnswers: formData.showCorrectAnswers,
        allowReview: formData.allowReview,
      };

      await createQuiz(payload);
      setCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create quiz:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditQuiz = async () => {
    if (!editQuiz || !formData.title || !formData.courseId) {
      push({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    if (questions.length === 0) {
      push({ type: "error", message: "Please add at least one question" });
      return;
    }

    setActionLoading(true);
    try {
      const mappedQuestions = questions.map((q, index) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        explanation: q.explanation,
        order: index + 1,
      }));

      const payload: UpdateQuizPayload = {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        lessonId: formData.lessonId || undefined,
        duration: formData.duration,
        passingScore: formData.passingScore,
        attemptsAllowed: formData.attemptsAllowed,
        questions: mappedQuestions,
        shuffleQuestions: formData.shuffleQuestions,
        showCorrectAnswers: formData.showCorrectAnswers,
        allowReview: formData.allowReview,
      };

      await updateQuiz(editQuiz.id, payload);
      setEditOpen(false);
      setEditQuiz(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update quiz:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteQuiz(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkDeleteQuizzes(selectedIds);
      setBulkDeleteOpen(false);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to delete quizzes:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (quiz: QuizItem) => {
    setActionLoading(true);
    try {
      await toggleQuizStatus(quiz.id);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (quiz: QuizItem) => {
    setActionLoading(true);
    try {
      await duplicateQuiz(quiz.id);
    } catch (error) {
      console.error("Failed to duplicate quiz:", error);
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
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (quiz: QuizItem) => {
    const fullQuiz = await getQuiz(quiz.id);
    if (!fullQuiz) return;

    setEditQuiz(quiz);
    setFormData({
      title: fullQuiz.title,
      description: fullQuiz.description || "",
      courseId:
        typeof fullQuiz.course === "object"
          ? fullQuiz.course._id
          : fullQuiz.course,
      lessonId:
        typeof fullQuiz.lesson === "object"
          ? fullQuiz.lesson._id
          : fullQuiz.lesson || "",
      duration: fullQuiz.duration || 60,
      passingScore: fullQuiz.passingScore || 70,
      attemptsAllowed: fullQuiz.attemptsAllowed || 0,
      shuffleQuestions: fullQuiz.shuffleQuestions || false,
      showCorrectAnswers: fullQuiz.showCorrectAnswers || true,
      allowReview: fullQuiz.allowReview || true,
    });
    setQuestions(
      fullQuiz.questions.map((q, index) => ({
        id: q.id || `q-${Date.now()}-${index}`,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        explanation: q.explanation,
        order: q.order || index + 1,
      }))
    );
    setCurrentStep(1);
    setEditOpen(true);
  };

  const handleViewSubmissions = async (quiz: QuizItem) => {
    setSubmissionsQuiz(quiz);
    await getQuizSubmissions(quiz.id);
  };

  const handleViewAnalytics = async (quiz: QuizItem) => {
    setAnalyticsQuiz(quiz);
    await getQuizStats(quiz.id);
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      const blob = await quizzesService.exportQuizzes(format, {
        courseId: courseFilter !== "all" ? courseFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quizzes.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      push({
        type: "success",
        message: `Quizzes exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to export quizzes",
      });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((q) => q.id));
    }
  };

  const handleTemplateSelect = (template: QuizTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      title: template.name,
      description: template.description,
      duration: template.duration,
      passingScore: template.passingScore,
    });
    const templateQuestions: QuizQuestion[] = template.questions.map(
      (q, index) => ({
        id: `q-${Date.now()}-${index}`,
        ...q,
        order: index + 1,
      })
    );
    setQuestions(templateQuestions);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.courseId) {
      push({ type: "error", message: "Please select a course" });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      lessonId: "",
      duration: 60,
      passingScore: 70,
      attemptsAllowed: 0,
      shuffleQuestions: false,
      showCorrectAnswers: true,
      allowReview: true,
    });
    setQuestions([]);
    setCurrentStep(1);
    setSelectedTemplate(null);
  };

  // Loading skeleton component
  const QuizSkeleton = () => (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-slate-200 rounded"></div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-slate-200 rounded"></div>
        <div className="flex-1 h-9 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  // Error handling
  if (loading && quizzes.length === 0) {
    return (
      <main className="w-full">
        <div className="p-3 sm:p-4 md:p-6 max-w-[1800px] mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 animate-pulse"
              >
                <div className="h-12 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <QuizSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Failed to Load Quizzes
          </h3>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Button
            onClick={() => refreshQuizzes()}
            variant="outline"
            className="text-sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full">
      <div className="p-3 sm:p-4 md:p-6 max-w-[1800px] mx-auto">
        {/* Header - Removed duplicate header since it's in page.tsx */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Create Quiz
              </Button>
              <Button
                onClick={() => refreshQuizzes()}
                variant="outline"
                disabled={loading}
                className="w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div
            className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(var(--primary-rgb, 59 130 246) / 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Total Quizzes
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {stats.total}
                </p>
                <p className="text-primary text-xs sm:text-sm flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span className="truncate font-medium">
                    {stats.active} active
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 ml-2 group-hover:bg-primary/20 transition-colors">
                <FileQuestion className="text-primary w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(251, 191, 36, 0.1))",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Total Attempts
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {stats.totalAttempts}
                </p>
                <p className="text-amber-600 text-xs sm:text-sm flex items-center gap-1">
                  <Users className="w-3 h-3 shrink-0" />
                  <span className="truncate font-medium">Submissions</span>
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 ml-2">
                <Users className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(34, 197, 94, 0.1))",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Avg. Score
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {stats.avgScore}%
                </p>
                <p className="text-green-600 text-xs sm:text-sm flex items-center gap-1">
                  <Target className="w-3 h-3 shrink-0" />
                  <span className="truncate font-medium">Performance</span>
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-xl flex items-center justify-center shrink-0 ml-2">
                <Target className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(168, 85, 247, 0.1))",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Completion Rate
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {stats.avgCompletion}%
                </p>
                <p className="text-purple-600 text-xs sm:text-sm flex items-center gap-1">
                  <Award className="w-3 h-3 shrink-0" />
                  <span className="truncate font-medium">Avg. completion</span>
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 ml-2">
                <Award className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && quizzes.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-50 text-xs sm:text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-52 bg-slate-50 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="questions">Most Questions</SelectItem>
                  <SelectItem value="attempts">Most Attempts</SelectItem>
                </SelectContent>
              </Select>

              {courses.length > 0 && (
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-50 text-xs sm:text-sm">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course: any) => (
                      <SelectItem key={course._id} value={course._id}>
                        <span className="truncate block max-w-[200px] sm:max-w-full">
                          {course.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-600 hover:text-primary hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => handleExport("csv")}
                    className="text-xs sm:text-sm"
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleExport("xlsx")}
                    className="text-xs sm:text-sm"
                  >
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleExport("pdf")}
                    className="text-xs sm:text-sm"
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="font-semibold text-primary text-xs sm:text-sm">
                {selectedIds.length} quiz{selectedIds.length > 1 ? "zes" : ""}{" "}
                selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkToggleStatus}
                disabled={actionLoading}
                className="text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Toggle Status</span>
                <span className="xs:hidden">Toggle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={actionLoading}
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm flex-1 sm:flex-initial"
                onClick={() => setSelectedIds([])}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quiz Cards */}
        {loading && quizzes.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <QuizSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 md:p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileQuestion className="text-slate-400 w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
              {search || statusFilter !== "all"
                ? "No quizzes found"
                : "No quizzes yet"}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Create your first quiz to assess student knowledge"}
            </p>
            {!search && statusFilter === "all" && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quiz
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((quiz) => (
              <div
                key={quiz.id}
                className={`group bg-white rounded-xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 ${
                  selectedIds.includes(quiz.id)
                    ? "border-primary bg-primary/5"
                    : "border-slate-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(quiz.id)}
                      onChange={() => toggleSelection(quiz.id)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary rounded border-slate-300 focus:ring-primary shrink-0"
                    />
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Plane className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight line-clamp-2">
                        {quiz.title}
                      </h3>
                      {quiz.courseTitle && (
                        <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
                          {quiz.courseTitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onSelect={() => setPreviewQuiz(quiz)}>
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleViewAnalytics(quiz)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                        <span>View Analytics</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleViewSubmissions(quiz)}
                      >
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        <span>View Submissions</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => handleEdit(quiz)}>
                        <Edit3 className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Edit Quiz</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDuplicate(quiz)}>
                        <Copy className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleToggleStatus(quiz)}
                      >
                        {quiz.status === "active" ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2 text-amber-600" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2 text-green-600" />
                            <span>Activate</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={() => setDeleteId(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                {quiz.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100">
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <FileQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-blue-500 shrink-0" />
                    <span className="font-medium">{quiz.questions}</span>
                    <span className="ml-0.5 sm:ml-1 hidden xs:inline">
                      questions
                    </span>
                    <span className="ml-0.5 sm:ml-1 xs:hidden">Q</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-amber-500 shrink-0" />
                    <span className="font-medium">{quiz.duration}</span>
                    <span className="ml-0.5 sm:ml-1">min</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-green-500 shrink-0" />
                    <span className="font-medium">{quiz.passingScore}%</span>
                    <span className="ml-0.5 sm:ml-1 hidden xs:inline">
                      to pass
                    </span>
                    <span className="ml-0.5 sm:ml-1 xs:hidden">pass</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-purple-500 shrink-0" />
                    <span className="font-medium">
                      {quiz.totalAttempts || 0}
                    </span>
                    <span className="ml-0.5 sm:ml-1 hidden xs:inline">
                      attempts
                    </span>
                    <span className="ml-0.5 sm:ml-1 xs:hidden">att</span>
                  </div>
                </div>

                {/* Status and Score */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                  <span
                    className={`text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
                      quiz.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {quiz.status === "active" ? "✓ Active" : "Draft"}
                  </span>
                  {quiz.averageScore && (
                    <div className="text-xs sm:text-sm font-semibold text-primary">
                      Avg: {quiz.averageScore}%
                    </div>
                  )}
                </div>

                {/* Progress */}
                {quiz.completionRate && (
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1 sm:mb-1.5">
                      <span className="font-medium">Completion Rate</span>
                      <span className="font-semibold">
                        {quiz.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${quiz.completionRate}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary text-xs sm:text-sm"
                    onClick={() => setPreviewQuiz(quiz)}
                  >
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm"
                    onClick={() => handleViewAnalytics(quiz)}
                  >
                    <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden xs:inline">Analytics</span>
                    <span className="xs:hidden">Stats</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Select All & Pagination */}
        {filtered.length > 0 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="text-slate-600 text-xs sm:text-sm w-full sm:w-auto"
            >
              {selectedIds.length === filtered.length
                ? "Deselect All"
                : "Select All"}
            </Button>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchQuizzes({ page: pagination.page - 1 })}
                  disabled={pagination.page <= 1 || loading}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <span className="text-xs sm:text-sm text-slate-600 px-2 sm:px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchQuizzes({ page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog
          open={!!previewQuiz}
          onOpenChange={(v) => !v && setPreviewQuiz(null)}
        >
          <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Quiz Preview
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Complete quiz overview and settings
              </DialogDescription>
            </DialogHeader>
            {previewQuiz && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {previewQuiz.title}
                  </h3>
                  {previewQuiz.description && (
                    <p className="text-slate-600">{previewQuiz.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Questions</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewQuiz.questions}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewQuiz.duration} minutes
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Passing Score</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewQuiz.passingScore}%
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Points</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewQuiz.totalPoints}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">
                      Attempts Allowed
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewQuiz.attemptsAllowed === 0
                        ? "Unlimited"
                        : previewQuiz.attemptsAllowed}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <p className="text-lg font-semibold text-slate-900 capitalize">
                      {previewQuiz.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog
          open={!!analyticsQuiz}
          onOpenChange={(v) => {
            if (!v) {
              setAnalyticsQuiz(null);
            }
          }}
        >
          <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Quiz Analytics
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Performance metrics and insights
              </DialogDescription>
            </DialogHeader>
            {analyticsQuiz && (
              <div className="space-y-6">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : quizStats ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-primary/10 rounded-lg p-5 text-center">
                        <p className="text-sm text-primary font-medium mb-2">
                          Avg. Score
                        </p>
                        <p className="text-3xl font-bold text-blue-700">
                          {Math.round(quizStats.averageScore || 0)}%
                        </p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-5 text-center">
                        <p className="text-sm text-amber-600 font-medium mb-2">
                          Total Attempts
                        </p>
                        <p className="text-3xl font-bold text-amber-700">
                          {quizStats.totalAttempts}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-5 text-center">
                        <p className="text-sm text-green-600 font-medium mb-2">
                          Passed
                        </p>
                        <p className="text-3xl font-bold text-green-700">
                          {quizStats.passedCount}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-5 text-center">
                        <p className="text-sm text-red-600 font-medium mb-2">
                          Failed
                        </p>
                        <p className="text-3xl font-bold text-red-700">
                          {quizStats.failedCount}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-5">
                        <h4 className="font-semibold text-slate-900 mb-3">
                          Pass Rate
                        </h4>
                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-green-600 h-4 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                quizStats.totalAttempts > 0
                                  ? (quizStats.passedCount /
                                      quizStats.totalAttempts) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                          {quizStats.totalAttempts > 0
                            ? Math.round(
                                (quizStats.passedCount /
                                  quizStats.totalAttempts) *
                                  100
                              )
                            : 0}
                          % of students passed
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-5">
                        <h4 className="font-semibold text-slate-900 mb-3">
                          Average Time
                        </h4>
                        <p className="text-2xl font-bold text-slate-900">
                          {Math.round(quizStats.averageTime || 0)} min
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          Average time spent on quiz
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No statistics available yet
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Submissions Dialog */}
        <Dialog
          open={!!submissionsQuiz}
          onOpenChange={(v) => {
            if (!v) {
              setSubmissionsQuiz(null);
            }
          }}
        >
          <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Quiz Submissions
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {submissionsQuiz?.title} - Student submissions and results
              </DialogDescription>
            </DialogHeader>
            {submissionsQuiz && (
              <div className="space-y-4">
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((submission: QuizSubmission) => {
                      const student =
                        typeof submission.student === "object"
                          ? submission.student
                          : null;
                      return (
                        <div
                          key={submission._id}
                          className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                    submission.passed
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {submission.passed ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <X className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {student
                                      ? `${student.firstName} ${student.lastName}`
                                      : "Unknown Student"}
                                  </p>
                                  {student && (
                                    <p className="text-sm text-slate-500">
                                      {student.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <p className="text-slate-600">Score</p>
                                  <p className="font-semibold text-slate-900">
                                    {submission.score} /{" "}
                                    {typeof submission.quiz === "object"
                                      ? submission.quiz.totalPoints
                                      : "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-600">Percentage</p>
                                  <p className="font-semibold text-slate-900">
                                    {submission.percentage.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-600">Attempt</p>
                                  <p className="font-semibold text-slate-900">
                                    #{submission.attemptNumber}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-600">Submitted</p>
                                  <p className="font-semibold text-slate-900">
                                    {submission.submittedAt
                                      ? new Date(
                                          submission.submittedAt
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  submission.passed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {submission.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No submissions yet
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Quiz Dialog - Multi-Step Form */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-[98vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[95vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Create Professional Aviation Quiz
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Step {currentStep} of 3:{" "}
                {currentStep === 1
                  ? "Quiz Details & Course Selection"
                  : currentStep === 2
                  ? "Build Questions"
                  : "Review & Publish"}
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= step
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 rounded ${
                        currentStep > step ? "bg-primary" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Quiz Details & Course Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Aviation Templates */}
                <div className="bg-linear-to-br from-primary/5 to-blue-50 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-slate-900">
                      Start with a Template
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aviationQuizTemplates.slice(0, 4).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="text-left bg-white rounded-lg p-4 border-2 border-slate-200 hover:border-primary hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">
                            {template.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              template.difficulty === "beginner"
                                ? "bg-green-100 text-green-700"
                                : template.difficulty === "intermediate"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {template.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{template.questions.length} questions</span>
                          <span>•</span>
                          <span>{template.duration} min</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">
                      or create from scratch
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Private Pilot License - Final Examination"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of what this quiz covers..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseId">Select Course *</Label>
                      <Select
                        value={formData.courseId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, courseId: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a course..." />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lessonId">Select Lesson (Optional)</Label>
                      <Input
                        id="lessonId"
                        placeholder="Leave empty or enter lesson ID"
                        value={formData.lessonId}
                        onChange={(e) =>
                          setFormData({ ...formData, lessonId: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value) || 60,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passingScore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passingScore: parseInt(e.target.value) || 70,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attempts">Max Attempts</Label>
                      <Input
                        id="attempts"
                        type="number"
                        min="0"
                        value={formData.attemptsAllowed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attemptsAllowed: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-slate-500">0 = unlimited</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Build Questions */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <QuizBuilder questions={questions} onChange={setQuestions} />
              </div>
            )}

            {/* Step 3: Review & Publish */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Quiz Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Title</p>
                      <p className="font-semibold">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Course</p>
                      <p className="font-semibold">
                        {courses.find((c: any) => c._id === formData.courseId)
                          ?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Questions</p>
                      <p className="font-semibold">{questions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Points</p>
                      <p className="font-semibold">
                        {questions.reduce((sum, q) => sum + q.points, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Duration</p>
                      <p className="font-semibold">
                        {formData.duration} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Passing Score</p>
                      <p className="font-semibold">{formData.passingScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Quiz Settings</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Shuffle questions for each attempt
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showCorrectAnswers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showCorrectAnswers: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Show correct answers after submission
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowReview}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowReview: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Allow students to review their answers
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 mt-6 pt-4 border-t">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    ← Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateOpen(false);
                    resetForm();
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateQuiz}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quiz Dialog - Reuse Create Dialog Structure */}
        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) {
              setEditQuiz(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-[98vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[95vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-primary" />
                Edit Quiz
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Step {currentStep} of 3:{" "}
                {currentStep === 1
                  ? "Quiz Details & Course Selection"
                  : currentStep === 2
                  ? "Build Questions"
                  : "Review & Update"}
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= step
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 rounded ${
                        currentStep > step ? "bg-primary" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Quiz Details & Course Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Quiz Title *</Label>
                    <Input
                      id="edit-title"
                      placeholder="e.g., Private Pilot License - Final Examination"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Brief description of what this quiz covers..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-courseId">Select Course *</Label>
                      <Select
                        value={formData.courseId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, courseId: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a course..." />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-lessonId">
                        Select Lesson (Optional)
                      </Label>
                      <Input
                        id="edit-lessonId"
                        placeholder="Leave empty or enter lesson ID"
                        value={formData.lessonId}
                        onChange={(e) =>
                          setFormData({ ...formData, lessonId: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Duration (min)</Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value) || 60,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-passingScore">
                        Passing Score (%)
                      </Label>
                      <Input
                        id="edit-passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passingScore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passingScore: parseInt(e.target.value) || 70,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-attempts">Max Attempts</Label>
                      <Input
                        id="edit-attempts"
                        type="number"
                        min="0"
                        value={formData.attemptsAllowed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attemptsAllowed: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-slate-500">0 = unlimited</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Build Questions */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <QuizBuilder questions={questions} onChange={setQuestions} />
              </div>
            )}

            {/* Step 3: Review & Update */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Quiz Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Title</p>
                      <p className="font-semibold">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Course</p>
                      <p className="font-semibold">
                        {courses.find((c: any) => c._id === formData.courseId)
                          ?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Questions</p>
                      <p className="font-semibold">{questions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Points</p>
                      <p className="font-semibold">
                        {questions.reduce((sum, q) => sum + q.points, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Duration</p>
                      <p className="font-semibold">
                        {formData.duration} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Passing Score</p>
                      <p className="font-semibold">{formData.passingScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Quiz Settings</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Shuffle questions for each attempt
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showCorrectAnswers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showCorrectAnswers: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Show correct answers after submission
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowReview}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowReview: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Allow students to review their answers
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 mt-6 pt-4 border-t">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    ← Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setEditQuiz(null);
                    resetForm();
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleEditQuiz}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
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
                Delete Quiz?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This action cannot be undone. This will permanently delete the
                quiz and all associated submissions and data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteQuiz}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Quiz"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation */}
        <AlertDialog
          open={bulkDeleteOpen}
          onOpenChange={(v) => !v && setBulkDeleteOpen(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Delete {selectedIds.length} Quiz
                {selectedIds.length > 1 ? "zes" : ""}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This action cannot be undone. This will permanently delete the
                selected quiz{selectedIds.length > 1 ? "zes" : ""} and all
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
