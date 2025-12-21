"use client";

import { useState, useEffect, useCallback } from "react";
import {
  quizzesService,
  QuizDto,
  CreateQuizPayload,
  UpdateQuizPayload,
} from "@/services/quizzes.service";
import { useToast } from "@/context/ToastContext";

export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  passedCount: number;
  failedCount: number;
  averageTime: number;
}

export interface QuizSubmission {
  _id: string;
  quiz: string | QuizDto;
  student: string | { _id: string; firstName: string; lastName: string; email: string };
  score: number;
  percentage: number;
  passed: boolean;
  status: string;
  startedAt: string;
  submittedAt?: string;
  attemptNumber: number;
}

interface UseQuizzesResult {
  quizzes: QuizDto[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: QuizStats | null;
  statsLoading: boolean;
  submissions: QuizSubmission[];
  submissionsLoading: boolean;
  fetchQuizzes: (params?: {
    courseId?: string;
    lessonId?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getQuiz: (id: string) => Promise<QuizDto | null>;
  createQuiz: (data: CreateQuizPayload) => Promise<QuizDto | null>;
  updateQuiz: (id: string, data: UpdateQuizPayload) => Promise<QuizDto | null>;
  deleteQuiz: (id: string) => Promise<boolean>;
  toggleQuizStatus: (id: string) => Promise<QuizDto | null>;
  duplicateQuiz: (id: string) => Promise<QuizDto | null>;
  getQuizStats: (id: string) => Promise<QuizStats | null>;
  getQuizSubmissions: (id: string, params?: { page?: number; limit?: number }) => Promise<void>;
  bulkDeleteQuizzes: (ids: string[]) => Promise<boolean>;
  bulkToggleStatus: (ids: string[]) => Promise<boolean>;
  refreshQuizzes: () => Promise<void>;
}

export function useQuizzes(): UseQuizzesResult {
  const { push } = useToast();
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseQuizzesResult['pagination']>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);

  const fetchQuizzes = useCallback(
    async (params: {
      courseId?: string;
      lessonId?: string;
      page?: number;
      limit?: number;
    } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await quizzesService.getAllQuizzes(params);
        setQuizzes(response.quizzes);
        const totalPages = params.limit
          ? Math.ceil(response.total / params.limit)
          : 1;
        setPagination({
          page: params.page || 1,
          limit: params.limit || 10,
          total: response.total,
          totalPages,
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch quizzes";
        setError(errorMessage);
        push({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const getQuiz = useCallback(
    async (id: string): Promise<QuizDto | null> => {
      try {
        const quiz = await quizzesService.getQuiz(id);
        return quiz;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch quiz";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      }
    },
    [push]
  );

  const createQuiz = useCallback(
    async (data: CreateQuizPayload): Promise<QuizDto | null> => {
      setLoading(true);
      try {
        const newQuiz = await quizzesService.createQuiz(data);
        setQuizzes((prev) => [newQuiz, ...prev]);
        push({
          message: "Quiz created successfully!",
          type: "success",
        });
        return newQuiz;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create quiz";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const updateQuiz = useCallback(
    async (id: string, data: UpdateQuizPayload): Promise<QuizDto | null> => {
      setLoading(true);
      try {
        const updatedQuiz = await quizzesService.updateQuiz(id, data);
        setQuizzes((prev) => prev.map((q) => (q._id === id ? updatedQuiz : q)));
        push({
          message: "Quiz updated successfully!",
          type: "success",
        });
        return updatedQuiz;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update quiz";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const deleteQuiz = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        await quizzesService.deleteQuiz(id);
        setQuizzes((prev) => prev.filter((q) => q._id !== id));
        push({
          message: "Quiz deleted successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete quiz";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const toggleQuizStatus = useCallback(
    async (id: string): Promise<QuizDto | null> => {
      setLoading(true);
      try {
        const updatedQuiz = await quizzesService.toggleQuizStatus(id);
        setQuizzes((prev) => prev.map((q) => (q._id === id ? updatedQuiz : q)));
        push({
          message: `Quiz ${updatedQuiz.isActive ? "activated" : "deactivated"} successfully!`,
          type: "success",
        });
        return updatedQuiz;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle quiz status";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const duplicateQuiz = useCallback(
    async (id: string): Promise<QuizDto | null> => {
      setLoading(true);
      try {
        const duplicatedQuiz = await quizzesService.duplicateQuiz(id);
        setQuizzes((prev) => [duplicatedQuiz, ...prev]);
        push({
          message: "Quiz duplicated successfully!",
          type: "success",
        });
        return duplicatedQuiz;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate quiz";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const getQuizStats = useCallback(
    async (id: string): Promise<QuizStats | null> => {
      setStatsLoading(true);
      try {
        const statsData = await quizzesService.getQuizStats(id);
        setStats(statsData);
        return statsData;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch quiz stats";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setStatsLoading(false);
      }
    },
    [push]
  );

  const getQuizSubmissions = useCallback(
    async (id: string, params: { page?: number; limit?: number } = {}) => {
      setSubmissionsLoading(true);
      try {
        const response = await quizzesService.getQuizSubmissions(id, params);
        setSubmissions(response.submissions);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch submissions";
        push({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setSubmissionsLoading(false);
      }
    },
    [push]
  );

  const bulkDeleteQuizzes = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await quizzesService.bulkDeleteQuizzes(ids);
        setQuizzes((prev) => prev.filter((q) => !ids.includes(q._id)));
        push({
          message: `${ids.length} quiz${ids.length > 1 ? "zes" : ""} deleted successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete quizzes";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const bulkToggleStatus = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await quizzesService.bulkToggleStatus(ids);
        await fetchQuizzes();
        push({
          message: `Status updated for ${ids.length} quiz${ids.length > 1 ? "zes" : ""}!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle quiz status";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchQuizzes]
  );

  const refreshQuizzes = useCallback(async () => {
    await fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    quizzes,
    loading,
    error,
    pagination,
    stats,
    statsLoading,
    submissions,
    submissionsLoading,
    fetchQuizzes,
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleQuizStatus,
    duplicateQuiz,
    getQuizStats,
    getQuizSubmissions,
    bulkDeleteQuizzes,
    bulkToggleStatus,
    refreshQuizzes,
  };
}
