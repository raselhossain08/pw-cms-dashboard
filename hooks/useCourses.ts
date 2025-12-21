"use client";

import { useState, useEffect, useCallback } from "react";
import {
  coursesService,
  Course,
  CreateCourseDto,
  UpdateCourseDto,
} from "@/services/courses.service";
import { useToast } from "@/context/ToastContext";

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  activeInstructors: number;
  coursesWithDiscount: number;
  averageDiscount: number;
  totalDiscount: number;
}

interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: CourseStats | null;
  statsLoading: boolean;
  fetchCourses: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    level?: string;
    category?: string;
  }) => Promise<void>;
  getCourse: (id: string) => Promise<Course | null>;
  createCourse: (data: CreateCourseDto) => Promise<Course | null>;
  updateCourse: (id: string, data: UpdateCourseDto) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  publishCourse: (id: string) => Promise<Course | null>;
  unpublishCourse: (id: string) => Promise<Course | null>;
  toggleCourseStatus: (id: string) => Promise<Course | null>;
  duplicateCourse: (id: string) => Promise<Course | null>;
  getCourseStats: () => Promise<CourseStats | null>;
  bulkDeleteCourses: (ids: string[]) => Promise<boolean>;
  bulkToggleStatus: (ids: string[]) => Promise<boolean>;
  bulkPublish: (ids: string[]) => Promise<boolean>;
  bulkUnpublish: (ids: string[]) => Promise<boolean>;
  exportCourses: (format: "csv" | "xlsx" | "pdf", params?: { status?: string; category?: string }) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

export function useCourses(): UseCoursesResult {
  const { push } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseCoursesResult['pagination']>(null);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const fetchCourses = useCallback(
    async (params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      level?: string;
      category?: string;
    } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await coursesService.getAllCourses(params);
        const apiData = (response as any)?.data || response;
        const coursesList = apiData?.courses || [];
        const normalizedCourses = coursesList.map((c: any) => ({
          ...c,
          id: c._id || c.id,
          enrollmentCount: c.studentCount || c.enrollmentCount || 0,
          totalRatings: c.totalRatings || c.ratingsCount || c.reviewCount || 0,
          maxStudents: c.maxStudents || 100,
          rating: c.rating || 0,
          price: c.price || 0,
          duration: c.duration || c.durationHours || 0,
          status: c.status || (c.isPublished ? "published" : "draft"),
          categories: Array.isArray(c.categories) ? c.categories : [],
          thumbnail: c.thumbnail || "",
        }));
        setCourses(normalizedCourses);
        const totalPages = params.limit
          ? Math.ceil((apiData?.total || normalizedCourses.length) / params.limit)
          : 1;
        setPagination({
          page: params.page || 1,
          limit: params.limit || 10,
          total: apiData?.total || normalizedCourses.length,
          totalPages,
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch courses";
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

  const getCourse = useCallback(
    async (id: string): Promise<Course | null> => {
      try {
        const response = await coursesService.getCourseById(id);
        const course = (response as any)?.data || response;
        return {
          ...course,
          id: course._id || course.id,
        };
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch course";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      }
    },
    [push]
  );

  const createCourse = useCallback(
    async (data: CreateCourseDto): Promise<Course | null> => {
      setLoading(true);
      try {
        const response = await coursesService.createCourse(data);
        const newCourse = (response as any)?.data || response;
        const normalizedCourse = {
          ...newCourse,
          id: newCourse._id || newCourse.id,
        };
        setCourses((prev) => [normalizedCourse, ...prev]);
        push({
          message: "Course created successfully!",
          type: "success",
        });
        return normalizedCourse;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create course";
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

  const updateCourse = useCallback(
    async (id: string, data: UpdateCourseDto): Promise<Course | null> => {
      setLoading(true);
      try {
        const response = await coursesService.updateCourse(id, data);
        const updatedCourse = (response as any)?.data || response;
        const normalizedCourse = {
          ...updatedCourse,
          id: updatedCourse._id || updatedCourse.id,
        };
        setCourses((prev) => prev.map((c) => (c.id === id || c._id === id ? normalizedCourse : c)));
        push({
          message: "Course updated successfully!",
          type: "success",
        });
        return normalizedCourse;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update course";
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

  const deleteCourse = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        await coursesService.deleteCourse(id);
        setCourses((prev) => prev.filter((c) => c.id !== id && c._id !== id));
        push({
          message: "Course deleted successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete course";
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

  const publishCourse = useCallback(
    async (id: string): Promise<Course | null> => {
      setLoading(true);
      try {
        const response = await coursesService.publishCourse(id);
        const updatedCourse = (response as any)?.data || response;
        const normalizedCourse = {
          ...updatedCourse,
          id: updatedCourse._id || updatedCourse.id,
        };
        setCourses((prev) => prev.map((c) => (c.id === id || c._id === id ? normalizedCourse : c)));
        push({
          message: "Course published successfully!",
          type: "success",
        });
        return normalizedCourse;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to publish course";
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

  const unpublishCourse = useCallback(
    async (id: string): Promise<Course | null> => {
      setLoading(true);
      try {
        const response = await coursesService.unpublishCourse(id);
        const updatedCourse = (response as any)?.data || response;
        const normalizedCourse = {
          ...updatedCourse,
          id: updatedCourse._id || updatedCourse.id,
        };
        setCourses((prev) => prev.map((c) => (c.id === id || c._id === id ? normalizedCourse : c)));
        push({
          message: "Course unpublished successfully!",
          type: "success",
        });
        return normalizedCourse;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to unpublish course";
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

  const toggleCourseStatus = useCallback(
    async (id: string): Promise<Course | null> => {
      setLoading(true);
      try {
        const course = courses.find((c) => c.id === id || c._id === id);
        if (!course) {
          throw new Error("Course not found");
        }
        const isPublished = course.status === "published" || course.isPublished;
        const response = isPublished
          ? await coursesService.unpublishCourse(id)
          : await coursesService.publishCourse(id);
        const updatedCourse = (response as any)?.data || response;
        const normalizedCourse = {
          ...updatedCourse,
          id: updatedCourse._id || updatedCourse.id,
        };
        setCourses((prev) => prev.map((c) => (c.id === id || c._id === id ? normalizedCourse : c)));
        push({
          message: `Course ${isPublished ? "unpublished" : "published"} successfully!`,
          type: "success",
        });
        return normalizedCourse;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle course status";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push, courses]
  );

  const duplicateCourse = useCallback(
    async (id: string): Promise<Course | null> => {
      setLoading(true);
      try {
        const response = await coursesService.duplicateCourse(id);
        const duplicatedCourse = (response as any)?.data || response;
        const normalizedCourse = {
          ...duplicatedCourse,
          id: duplicatedCourse._id || duplicatedCourse.id,
        };
        setCourses((prev) => [normalizedCourse, ...prev]);
        push({
          message: "Course duplicated successfully!",
          type: "success",
        });
        return normalizedCourse;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate course";
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

  const getCourseStats = useCallback(
    async (): Promise<CourseStats | null> => {
      setStatsLoading(true);
      try {
        const statsData = await coursesService.getDashboardStats();
        const normalizedStats: CourseStats = {
          totalCourses: statsData.totalCourses || 0,
          publishedCourses: statsData.publishedCourses || 0,
          draftCourses: statsData.draftCourses || 0,
          totalStudents: statsData.totalStudents || 0,
          totalRevenue: statsData.totalRevenue || 0,
          averageRating: statsData.averageRating || 0,
          activeInstructors: statsData.activeInstructors || 0,
          coursesWithDiscount: statsData.coursesWithDiscount || 0,
          averageDiscount: statsData.discountPercentage || 0,
          totalDiscount: statsData.totalDiscountGiven || 0,
        };
        setStats(normalizedStats);
        return normalizedStats;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch course stats";
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

  const bulkDeleteCourses = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await coursesService.bulkDeleteCourses(ids);
        setCourses((prev) => prev.filter((c) => !ids.includes(c.id || c._id || "")));
        push({
          message: `${ids.length} course${ids.length > 1 ? "s" : ""} deleted successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete courses";
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
        await coursesService.bulkToggleStatus(ids);
        await fetchCourses();
        push({
          message: `Status updated for ${ids.length} course${ids.length > 1 ? "s" : ""}!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle course status";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchCourses]
  );

  const bulkPublish = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await coursesService.bulkPublishCourses(ids);
        await fetchCourses();
        push({
          message: `${ids.length} course${ids.length > 1 ? "s" : ""} published successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to publish courses";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchCourses]
  );

  const bulkUnpublish = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await coursesService.bulkUnpublishCourses(ids);
        await fetchCourses();
        push({
          message: `${ids.length} course${ids.length > 1 ? "s" : ""} unpublished successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to unpublish courses";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchCourses]
  );

  const exportCourses = useCallback(
    async (format: "csv" | "xlsx" | "pdf", params?: { status?: string; category?: string }): Promise<void> => {
      setLoading(true);
      try {
        await coursesService.exportCourses(format, params);
        push({
          message: `Courses exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export courses";
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

  const refreshCourses = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    pagination,
    stats,
    statsLoading,
    fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    toggleCourseStatus,
    duplicateCourse,
    getCourseStats,
    bulkDeleteCourses,
    bulkToggleStatus,
    bulkPublish,
    bulkUnpublish,
    exportCourses,
    refreshCourses,
  };
}
