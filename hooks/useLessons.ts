"use client";

import { useState, useEffect, useCallback } from "react";
import {
  lessonsService,
  LessonDto,
  CreateLessonPayload,
  UpdateLessonPayload,
  LessonAnalytics,
} from "@/services/lessons.service";
import { useToast } from "@/context/ToastContext";

export interface LessonStats {
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  totalViews: number;
  totalCompletions: number;
  averageCompletion: number;
  averageTimeSpent: number;
}

interface UseLessonsResult {
  lessons: LessonDto[];
  loading: boolean;
  error: string | null;
  analytics: LessonAnalytics | null;
  analyticsLoading: boolean;
  stats: LessonStats | null;
  statsLoading: boolean;
  fetchLessons: (courseId: string) => Promise<void>;
  getLesson: (id: string) => Promise<LessonDto | null>;
  createLesson: (courseId: string, data: CreateLessonPayload) => Promise<LessonDto | null>;
  updateLesson: (id: string, data: UpdateLessonPayload) => Promise<LessonDto | null>;
  deleteLesson: (id: string) => Promise<boolean>;
  toggleLessonStatus: (id: string) => Promise<LessonDto | null>;
  duplicateLesson: (id: string) => Promise<LessonDto | null>;
  getLessonAnalytics: (id: string) => Promise<LessonAnalytics | null>;
  getCourseAnalytics: (courseId: string) => Promise<any | null>;
  reorderLessons: (courseId: string, lessonIds: string[], moduleId?: string) => Promise<boolean>;
  bulkDeleteLessons: (ids: string[]) => Promise<boolean>;
  bulkToggleStatus: (ids: string[]) => Promise<boolean>;
  refreshLessons: (courseId: string) => Promise<void>;
}

export function useLessons(): UseLessonsResult {
  const { push } = useToast();
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<LessonAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const fetchLessons = useCallback(
    async (courseId: string) => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const lessonsList = await lessonsService.getCourseLessons(courseId);
        setLessons(Array.isArray(lessonsList) ? lessonsList : []);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch lessons";
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

  const getLesson = useCallback(
    async (id: string): Promise<LessonDto | null> => {
      try {
        const lesson = await lessonsService.getLessonById(id);
        return lesson;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch lesson";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      }
    },
    [push]
  );

  const createLesson = useCallback(
    async (courseId: string, data: CreateLessonPayload): Promise<LessonDto | null> => {
      setLoading(true);
      try {
        const newLesson = await lessonsService.createLesson(courseId, data);
        setLessons((prev) => [newLesson, ...prev]);
        push({
          message: "Lesson created successfully!",
          type: "success",
        });
        return newLesson;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create lesson";
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

  const updateLesson = useCallback(
    async (id: string, data: UpdateLessonPayload): Promise<LessonDto | null> => {
      setLoading(true);
      try {
        const updatedLesson = await lessonsService.updateLesson(id, data);
        setLessons((prev) => prev.map((l) => (l._id === id ? updatedLesson : l)));
        push({
          message: "Lesson updated successfully!",
          type: "success",
        });
        return updatedLesson;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update lesson";
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

  const deleteLesson = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        await lessonsService.deleteLesson(id);
        setLessons((prev) => prev.filter((l) => l._id !== id));
        push({
          message: "Lesson deleted successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete lesson";
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

  const toggleLessonStatus = useCallback(
    async (id: string): Promise<LessonDto | null> => {
      setLoading(true);
      try {
        const updatedLesson = await lessonsService.toggleLessonStatus(id);
        setLessons((prev) => prev.map((l) => (l._id === id ? updatedLesson : l)));
        push({
          message: `Lesson ${updatedLesson.status === "published" ? "published" : "unpublished"} successfully!`,
          type: "success",
        });
        return updatedLesson;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle lesson status";
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

  const duplicateLesson = useCallback(
    async (id: string): Promise<LessonDto | null> => {
      setLoading(true);
      try {
        const duplicatedLesson = await lessonsService.duplicateLesson(id);
        setLessons((prev) => [duplicatedLesson, ...prev]);
        push({
          message: "Lesson duplicated successfully!",
          type: "success",
        });
        return duplicatedLesson;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate lesson";
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

  const getLessonAnalytics = useCallback(
    async (id: string): Promise<LessonAnalytics | null> => {
      setAnalyticsLoading(true);
      try {
        const analyticsData = await lessonsService.getLessonAnalytics(id);
        setAnalytics(analyticsData);
        return analyticsData;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch lesson analytics";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [push]
  );

  const getCourseAnalytics = useCallback(
    async (courseId: string): Promise<any | null> => {
      setStatsLoading(true);
      try {
        const statsData = await lessonsService.getCourseAnalytics(courseId);
        setStats(statsData as any);
        return statsData;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch course analytics";
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

  const reorderLessons = useCallback(
    async (courseId: string, lessonIds: string[], moduleId?: string): Promise<boolean> => {
      setLoading(true);
      try {
        await lessonsService.reorderLessons(courseId, lessonIds, moduleId);
        await fetchLessons(courseId);
        push({
          message: "Lessons reordered successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to reorder lessons";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchLessons]
  );

  const bulkDeleteLessons = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await lessonsService.bulkDeleteLessons(ids);
        setLessons((prev) => prev.filter((l) => !ids.includes(l._id)));
        push({
          message: `${ids.length} lesson${ids.length > 1 ? "s" : ""} deleted successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete lessons";
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
        await lessonsService.bulkToggleStatus(ids);
        push({
          message: `Status updated for ${ids.length} lesson${ids.length > 1 ? "s" : ""}!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle lesson status";
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

  const refreshLessons = useCallback(
    async (courseId: string) => {
      await fetchLessons(courseId);
    },
    [fetchLessons]
  );

  return {
    lessons,
    loading,
    error,
    analytics,
    analyticsLoading,
    stats,
    statsLoading,
    fetchLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    toggleLessonStatus,
    duplicateLesson,
    getLessonAnalytics,
    getCourseAnalytics,
    reorderLessons,
    bulkDeleteLessons,
    bulkToggleStatus,
    refreshLessons,
  };
}
