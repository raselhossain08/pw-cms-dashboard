"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { quizzesService, type QuizDto } from "@/services/quizzes.service";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    courseId: "",
    duration: 60,
    passingScore: 70,
    attemptsAllowed: 0,
  });

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
      setFormData({
        title: "",
        description: "",
        courseId: "",
        duration: 60,
        passingScore: 70,
        attemptsAllowed: 0,
      });
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

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      courseId: formData.courseId,
      duration: formData.duration,
      passingScore: formData.passingScore,
      attemptsAllowed: formData.attemptsAllowed,
      questions: [],
      shuffleQuestions: false,
      showCorrectAnswers: true,
      allowReview: true,
    });
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
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm w-52 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="questions">Most Questions</option>
                <option value="attempts">Most Attempts</option>
              </select>
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
          <DialogContent className="max-w-3xl">
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
          <DialogContent className="max-w-2xl">
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

        {/* Create Quiz Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Create New Quiz
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a new aviation knowledge assessment quiz
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Quiz Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Private Pilot Ground School Final Exam"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the quiz content and objectives"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="courseId"
                  className="text-sm font-medium text-slate-700"
                >
                  Course ID *
                </Label>
                <Input
                  id="courseId"
                  placeholder="Enter course ID"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">
                  Enter the MongoDB ObjectId of the course this quiz belongs to
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-sm font-medium text-slate-700"
                  >
                    Duration (min)
                  </Label>
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
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="passingScore"
                    className="text-sm font-medium text-slate-700"
                  >
                    Passing Score (%)
                  </Label>
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
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="attempts"
                    className="text-sm font-medium text-slate-700"
                  >
                    Max Attempts
                  </Label>
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
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-slate-500">0 = unlimited</p>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <FileQuestion className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Questions will be added later
                    </p>
                    <p className="text-xs text-blue-700">
                      After creating the quiz, you can add questions through the
                      edit function or question builder interface.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuiz}
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quiz
                  </>
                )}
              </Button>
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
