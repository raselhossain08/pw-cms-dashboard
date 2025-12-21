"use client";

import { useState, useEffect, useCallback } from "react";
import {
  assignmentsService,
  Assignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from "@/services/assignments.service";
import { useToast } from "@/context/ToastContext";

export interface AssignmentStats {
  totalAssignments: number;
  upcomingAssignments: number;
  dueSoonAssignments: number;
  overdueAssignments: number;
  totalSubmissions: number;
  averageCompletion: number;
  averageGrade: number;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string | Assignment;
  student: string | { _id: string; firstName: string; lastName: string; email: string };
  content: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  status: "submitted" | "graded" | "pending";
}

interface UseAssignmentsResult {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: AssignmentStats | null;
  statsLoading: boolean;
  submissions: AssignmentSubmission[];
  submissionsLoading: boolean;
  fetchAssignments: (courseId: string, params?: {
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getAssignment: (id: string) => Promise<Assignment | null>;
  createAssignment: (courseId: string, data: CreateAssignmentDto) => Promise<Assignment | null>;
  updateAssignment: (id: string, data: UpdateAssignmentDto) => Promise<Assignment | null>;
  deleteAssignment: (id: string) => Promise<boolean>;
  toggleAssignmentStatus: (id: string) => Promise<Assignment | null>;
  duplicateAssignment: (id: string) => Promise<Assignment | null>;
  getAssignmentStats: (id: string) => Promise<any | null>;
  getAssignmentSubmissions: (id: string, params?: { page?: number; limit?: number }) => Promise<void>;
  bulkDeleteAssignments: (ids: string[]) => Promise<boolean>;
  bulkToggleStatus: (ids: string[]) => Promise<boolean>;
  exportAssignments: (format: "csv" | "xlsx" | "pdf", params?: { courseId?: string }) => Promise<void>;
  refreshAssignments: (courseId: string) => Promise<void>;
}

export function useAssignments(): UseAssignmentsResult {
  const { push } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseAssignmentsResult['pagination']>(null);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);

  const fetchAssignments = useCallback(
    async (courseId: string, params: {
      page?: number;
      limit?: number;
    } = {}) => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await assignmentsService.getCourseAssignments(courseId, params);
        const assignmentsList = response?.assignments || [];
        setAssignments(assignmentsList);
        const totalPages = params.limit
          ? Math.ceil((response?.total || assignmentsList.length) / params.limit)
          : 1;
        setPagination({
          page: params.page || 1,
          limit: params.limit || 10,
          total: response?.total || assignmentsList.length,
          totalPages,
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch assignments";
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

  const getAssignment = useCallback(
    async (id: string): Promise<Assignment | null> => {
      try {
        const assignment = await assignmentsService.getAssignment(id);
        return assignment;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch assignment";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      }
    },
    [push]
  );

  const createAssignment = useCallback(
    async (courseId: string, data: CreateAssignmentDto): Promise<Assignment | null> => {
      setLoading(true);
      try {
        const newAssignment = await assignmentsService.createAssignment(courseId, data);
        setAssignments((prev) => [newAssignment, ...prev]);
        push({
          message: "Assignment created successfully!",
          type: "success",
        });
        return newAssignment;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create assignment";
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

  const updateAssignment = useCallback(
    async (id: string, data: UpdateAssignmentDto): Promise<Assignment | null> => {
      setLoading(true);
      try {
        const updatedAssignment = await assignmentsService.updateAssignment(id, data);
        setAssignments((prev) => prev.map((a) => (a._id === id ? updatedAssignment : a)));
        push({
          message: "Assignment updated successfully!",
          type: "success",
        });
        return updatedAssignment;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update assignment";
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

  const deleteAssignment = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        await assignmentsService.deleteAssignment(id);
        setAssignments((prev) => prev.filter((a) => a._id !== id));
        push({
          message: "Assignment deleted successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete assignment";
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

  const toggleAssignmentStatus = useCallback(
    async (id: string): Promise<Assignment | null> => {
      setLoading(true);
      try {
        const updatedAssignment = await assignmentsService.toggleAssignmentStatus(id);
        setAssignments((prev) => prev.map((a) => (a._id === id ? updatedAssignment : a)));
        push({
          message: `Assignment ${updatedAssignment.isActive ? "activated" : "deactivated"} successfully!`,
          type: "success",
        });
        return updatedAssignment;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle assignment status";
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

  const duplicateAssignment = useCallback(
    async (id: string): Promise<Assignment | null> => {
      setLoading(true);
      try {
        const duplicatedAssignment = await assignmentsService.duplicateAssignment(id);
        setAssignments((prev) => [duplicatedAssignment, ...prev]);
        push({
          message: "Assignment duplicated successfully!",
          type: "success",
        });
        return duplicatedAssignment;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate assignment";
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

  const getAssignmentStats = useCallback(
    async (id: string): Promise<any | null> => {
      setStatsLoading(true);
      try {
        const statsData = await assignmentsService.getAssignmentStats(id);
        setStats(statsData);
        return statsData;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch assignment stats";
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

  const getAssignmentSubmissions = useCallback(
    async (id: string, params: { page?: number; limit?: number } = {}) => {
      setSubmissionsLoading(true);
      try {
        const response = await assignmentsService.getAssignmentSubmissions(id, params);
        setSubmissions(response.submissions || []);
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

  const bulkDeleteAssignments = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await assignmentsService.bulkDeleteAssignments(ids);
        setAssignments((prev) => prev.filter((a) => !ids.includes(a._id)));
        push({
          message: `${ids.length} assignment${ids.length > 1 ? "s" : ""} deleted successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete assignments";
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
        await assignmentsService.bulkToggleStatus(ids);
        push({
          message: `Status updated for ${ids.length} assignment${ids.length > 1 ? "s" : ""}!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle assignment status";
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

  const exportAssignments = useCallback(
    async (format: "csv" | "xlsx" | "pdf", params?: { courseId?: string }): Promise<void> => {
      setLoading(true);
      try {
        await assignmentsService.exportAssignments(format, params);
        push({
          message: `Assignments exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export assignments";
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

  const refreshAssignments = useCallback(
    async (courseId: string) => {
      await fetchAssignments(courseId);
    },
    [fetchAssignments]
  );

  return {
    assignments,
    loading,
    error,
    pagination,
    stats,
    statsLoading,
    submissions,
    submissionsLoading,
    fetchAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
    duplicateAssignment,
    getAssignmentStats,
    getAssignmentSubmissions,
    bulkDeleteAssignments,
    bulkToggleStatus,
    exportAssignments,
    refreshAssignments,
  };
}
