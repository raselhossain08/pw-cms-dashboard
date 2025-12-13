"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { quizzesService, type QuizDto } from "@/services/quizzes.service";
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
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [previewQuiz, setPreviewQuiz] = React.useState<QuizItem | null>(null);
  const [analyticsQuiz, setAnalyticsQuiz] = React.useState<QuizItem | null>(
    null
  );
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
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

  // Fetch courses for selection
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const courses = (coursesData as any)?.courses || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizzesService.getAllQuizzes(),
    staleTime: 30000,
  });

  const quizzes: QuizItem[] = React.useMemo(() => {
    const quizData = data?.quizzes || [];
    return quizData.map((q: QuizDto) => ({
      id: q._id,
      title: q.title,
      description: q.description || "",
      course: typeof q.course === "object" ? q.course._id : q.course,
      courseTitle: typeof q.course === "object" ? q.course.title : undefined,
      questions: Array.isArray(q.questions) ? q.questions.length : 0,
      duration: q.duration || 60,
      passingScore: q.passingScore || 70,
      totalPoints: q.totalPoints || 100,
      attemptsAllowed: q.attemptsAllowed || 0,
      status: q.isActive ? "active" : "draft",
      averageScore: Math.floor(Math.random() * 30) + 65,
      completionRate: Math.floor(Math.random() * 30) + 70,
      totalAttempts: Math.floor(Math.random() * 50) + 10,
    }));
  }, [data]);

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
  }, [quizzes, search, statusFilter, sortBy]);

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

  React.useEffect(() => {
    if (error) {
      push({ type: "error", message: "Failed to load quizzes" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => quizzesService.createQuiz(payload),
    onSuccess: () => {
      push({ type: "success", message: "Quiz created successfully" });
      setCreateOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: () => {
      push({ type: "error", message: "Failed to create quiz" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizzesService.deleteQuiz(id),
    onSuccess: () => {
      push({ type: "success", message: "Quiz deleted successfully" });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: () => {
      push({ type: "error", message: "Failed to delete quiz" });
    },
  });

  const handleCreateQuiz = () => {
    if (!formData.title || !formData.courseId) {
      push({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    if (questions.length === 0) {
      push({ type: "error", message: "Please add at least one question" });
      return;
    }

    const mappedQuestions = questions.map((q, index) => ({
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation,
      order: index + 1,
    }));

    createMutation.mutate({
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
    });
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

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <FileQuestion className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Aviation Quizzes & Exams
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Assess pilot knowledge and track student progress
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Quizzes
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.active} active
                </p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileQuestion className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Attempts
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalAttempts}
                </p>
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Student submissions
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <Users className="text-amber-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Avg. Score
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.avgScore}%
                </p>
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Above passing grade
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <Target className="text-green-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.avgCompletion}%
                </p>
                <p className="text-purple-600 text-sm mt-2 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Average completion
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <Award className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-52 bg-slate-50">
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
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-primary hover:bg-primary/10"
                onClick={() =>
                  push({
                    type: "info",
                    message: "Export functionality coming soon",
                  })
                }
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quiz Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-80 animate-pulse bg-slate-100 rounded-xl border border-slate-200"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileQuestion className="text-slate-400 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {search || statusFilter !== "all"
                ? "No quizzes found"
                : "No quizzes yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Create your first aviation quiz to assess pilot knowledge"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((quiz) => (
              <div
                key={quiz.id}
                className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Plane className="text-primary w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                        {quiz.title}
                      </h3>
                      {quiz.courseTitle && (
                        <p className="text-sm text-slate-500 truncate mt-0.5">
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
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onSelect={() => setPreviewQuiz(quiz)}>
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setAnalyticsQuiz(quiz)}>
                        <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                        <span>View Analytics</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() =>
                          push({
                            type: "info",
                            message: "Edit functionality coming soon",
                          })
                        }
                      >
                        <Edit3 className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Edit Quiz</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          push({
                            type: "info",
                            message: "Duplicate functionality coming soon",
                          })
                        }
                      >
                        <Copy className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Duplicate</span>
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
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center text-sm text-slate-600">
                    <FileQuestion className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium">{quiz.questions}</span>
                    <span className="ml-1">questions</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className="font-medium">{quiz.duration}</span>
                    <span className="ml-1">min</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Target className="w-4 h-4 mr-1.5 text-green-500" />
                    <span className="font-medium">{quiz.passingScore}%</span>
                    <span className="ml-1">to pass</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="w-4 h-4 mr-1.5 text-purple-500" />
                    <span className="font-medium">
                      {quiz.totalAttempts || 0}
                    </span>
                    <span className="ml-1">attempts</span>
                  </div>
                </div>

                {/* Status and Score */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      quiz.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {quiz.status === "active" ? "✓ Active" : "Draft"}
                  </span>
                  {quiz.averageScore && (
                    <div className="text-sm font-semibold text-primary">
                      Avg: {quiz.averageScore}%
                    </div>
                  )}
                </div>

                {/* Progress */}
                {quiz.completionRate && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span className="font-medium">Completion Rate</span>
                      <span className="font-semibold">
                        {quiz.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${quiz.completionRate}%` }}
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
                    onClick={() => setPreviewQuiz(quiz)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => setAnalyticsQuiz(quiz)}
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                    Analytics
                  </Button>
                </div>
              </div>
            ))}
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
          onOpenChange={(v) => !v && setAnalyticsQuiz(null)}
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/10 rounded-lg p-5 text-center">
                    <p className="text-sm text-primary font-medium mb-2">
                      Avg. Score
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {analyticsQuiz.averageScore}%
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-5 text-center">
                    <p className="text-sm text-amber-600 font-medium mb-2">
                      Total Attempts
                    </p>
                    <p className="text-3xl font-bold text-amber-700">
                      {analyticsQuiz.totalAttempts}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-5 text-center">
                    <p className="text-sm text-purple-600 font-medium mb-2">
                      Completion
                    </p>
                    <p className="text-3xl font-bold text-purple-700">
                      {analyticsQuiz.completionRate}%
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-5">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Quiz Progress
                  </h4>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${analyticsQuiz.completionRate}%` }}
                    />
                  </div>
                </div>
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
                  onClick={() => setCreateOpen(false)}
                  disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {createMutation.isPending ? (
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
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
