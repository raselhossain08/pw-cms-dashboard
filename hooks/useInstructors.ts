"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import {
  instructorsService,
  Instructor,
  InstructorStats,
  CreateInstructorDto,
  UpdateInstructorDto,
  InstructorFilters,
} from "@/services/instructors.service";

// Re-export types from service
export type {
  Instructor,
  InstructorStats,
  CreateInstructorDto,
  UpdateInstructorDto,
} from "@/services/instructors.service";

export function useInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const { push } = useToast();

  // Fetch all instructors with filters
  const fetchInstructors = useCallback(async (filters: InstructorFilters = {}) => {
    setLoading(true);
    try {
      const response = await instructorsService.getAllInstructors(filters);

      // Ensure we have an array of instructors
      const instructorsArray = response.instructors || response || [];

      if (!Array.isArray(instructorsArray)) {
        console.error("Invalid instructors response:", response);
        setInstructors([]);
        setTotal(0);
        return { instructors: [], total: 0 };
      }

      // Normalize dates to ensure they are strings (defensive programming)
      const normalizedInstructors = instructorsArray.map((instructor: any) => {
        // Helper function to safely convert dates
        const safeDate = (value: any): string | null => {
          if (!value) return null;
          if (typeof value === 'string') return value;
          // Check if it's an empty object or invalid value
          if (typeof value === 'object' && Object.keys(value).length === 0) return null;
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return null;
            return date.toISOString();
          } catch {
            return null;
          }
        };

        return {
          ...instructor,
          createdAt: safeDate(instructor.createdAt),
          updatedAt: safeDate(instructor.updatedAt),
          lastLogin: safeDate(instructor.lastLogin),
        };
      });

      // Calculate stats for each instructor
      const instructorsWithStats = await Promise.all(
        normalizedInstructors.map(async (instructor: any) => {
          try {
            // Fetch courses for this instructor
            const { apiClient } = await import("@/lib/api-client");
            const response = await apiClient.get<any>("/courses", {
              params: { instructor: instructor._id },
            });

            const courses = response.data?.courses || response.data || [];
            const coursesCount = courses.length;
            const studentsCount = courses.reduce(
              (sum: number, course: any) => sum + (course.studentCount || 0),
              0
            );
            const totalRating = courses.reduce(
              (sum: number, course: any) => sum + (course.rating || 0) * (course.reviewCount || 0),
              0
            );
            const totalReviews = courses.reduce(
              (sum: number, course: any) => sum + (course.reviewCount || 0),
              0
            );
            const rating = totalReviews > 0 ? totalRating / totalReviews : 0;

            return {
              ...instructor,
              name: `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.email,
              coursesCount,
              studentsCount,
              rating: parseFloat(rating.toFixed(1)),
              reviewCount: totalReviews,
            };
          } catch (error) {
            return {
              ...instructor,
              name: `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.email,
              coursesCount: 0,
              studentsCount: 0,
              rating: 0,
              reviewCount: 0,
            };
          }
        })
      );

      setInstructors(instructorsWithStats);
      setTotal(response.total ?? instructorsWithStats.length);
      setPagination({
        page: response.page ?? 1,
        limit: response.limit ?? 12,
        totalPages: response.totalPages ?? Math.ceil((response.total ?? instructorsWithStats.length) / (response.limit ?? 12)),
      });
      return { instructors: instructorsWithStats, total: response.total ?? instructorsWithStats.length };
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to fetch instructors",
      });
      setInstructors([]);
      setTotal(0);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Fetch instructor stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await instructorsService.getStats();
      setStats(statsData);
      return statsData;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to fetch stats",
      });
      throw error;
    } finally {
      setStatsLoading(false);
    }
  }, [push]);

  // Get single instructor
  const getInstructor = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const instructor = await instructorsService.getInstructorById(id);
      return instructor;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to fetch instructor",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Create instructor
  const createInstructor = useCallback(async (instructorData: CreateInstructorDto) => {
    setLoading(true);
    try {
      // Validate specialization and experience before sending
      if (instructorData.specialization && instructorData.specialization.length > 200) {
        throw new Error('Specialization must not exceed 200 characters');
      }

      if (instructorData.experience) {
        const validExperience = ['expert', 'advanced', 'intermediate'];
        if (!validExperience.includes(instructorData.experience)) {
          throw new Error(`Experience must be one of: ${validExperience.join(', ')}`);
        }
      }

      console.log('Creating instructor with data:', instructorData);

      const data = await instructorsService.createInstructor(instructorData);

      const newInstructor = {
        ...data,
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email,
        coursesCount: 0,
        studentsCount: 0,
        rating: 0,
        reviewCount: 0,
      };

      setInstructors((prev) => [newInstructor, ...prev]);
      setTotal((prev) => prev + 1);

      push({
        type: "success",
        message: `Instructor ${instructorData.firstName} ${instructorData.lastName} created successfully`,
      });

      return newInstructor;
    } catch (error: any) {
      console.error('Failed to create instructor:', error);

      // Enhanced error messages
      let errorMessage = 'Failed to create instructor';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Update instructor
  const updateInstructor = useCallback(async (id: string, instructorData: UpdateInstructorDto) => {
    setLoading(true);
    try {
      // Validate specialization and experience before sending
      if (instructorData.specialization && instructorData.specialization.length > 200) {
        throw new Error('Specialization must not exceed 200 characters');
      }

      if (instructorData.experience) {
        const validExperience = ['expert', 'advanced', 'intermediate'];
        if (!validExperience.includes(instructorData.experience)) {
          throw new Error(`Experience must be one of: ${validExperience.join(', ')}`);
        }
      }

      console.log('Updating instructor with data:', instructorData);

      const data = await instructorsService.updateInstructor(id, instructorData);

      const updatedInstructor = {
        ...data,
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email,
      };

      setInstructors((prev) =>
        prev.map((instructor) => (instructor._id === id ? { ...instructor, ...updatedInstructor } : instructor))
      );

      push({
        type: "success",
        message: "Instructor updated successfully",
      });

      return updatedInstructor;
    } catch (error: any) {
      console.error('Failed to update instructor:', error);

      // Enhanced error messages
      let errorMessage = 'Failed to update instructor';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Delete instructor
  const deleteInstructor = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await instructorsService.deleteInstructor(id);
      setInstructors((prev) => prev.filter((instructor) => instructor._id !== id));
      setTotal((prev) => prev - 1);

      push({
        type: "success",
        message: "Instructor deleted successfully",
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to delete instructor",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Bulk delete instructors
  const bulkDeleteInstructors = useCallback(async (ids: string[]) => {
    setLoading(true);
    try {
      await instructorsService.bulkDeleteInstructors(ids);
      setInstructors((prev) => prev.filter((instructor) => !ids.includes(instructor._id)));
      setTotal((prev) => prev - ids.length);

      push({
        type: "success",
        message: `${ids.length} instructor(s) deleted successfully`,
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to delete instructors",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Update instructor status
  const updateStatus = useCallback(async (id: string, status: "active" | "inactive" | "pending" | "suspended") => {
    setLoading(true);
    try {
      const data = await instructorsService.updateStatus(id, status);

      setInstructors((prev) =>
        prev.map((instructor) => (instructor._id === id ? { ...instructor, status } : instructor))
      );

      push({
        type: "success",
        message: `Instructor status updated to ${status}`,
      });

      return data;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to update status",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (ids: string[], status: "active" | "inactive" | "pending" | "suspended") => {
    setLoading(true);
    try {
      await instructorsService.bulkUpdateStatus(ids, status);
      setInstructors((prev) =>
        prev.map((instructor) => (ids.includes(instructor._id) ? { ...instructor, status } : instructor))
      );

      push({
        type: "success",
        message: `${ids.length} instructor(s) status updated to ${status}`,
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to update status",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Export instructors
  const exportInstructors = useCallback(async (filters: InstructorFilters = {}) => {
    try {
      // Format date safely
      const formatDate = (date: any): string => {
        if (!date) return 'N/A';
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) return 'Invalid Date';
          return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch {
          return 'Invalid Date';
        }
      };

      const csv = [
        [
          "Name",
          "Email",
          "Status",
          "Specialization",
          "Experience",
          "Courses",
          "Students",
          "Rating",
          "Joined Date",
        ].join(","),
        ...instructors.map((i) =>
          [
            `"${i.name.replace(/"/g, '""')}"`,
            i.email,
            i.status,
            `"${(i.specialization || '').replace(/"/g, '""')}"`,
            i.experience || "",
            i.coursesCount || 0,
            i.studentsCount || 0,
            i.rating || 0,
            formatDate(i.createdAt),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `instructors-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      push({
        type: "success",
        message: "Instructors exported successfully",
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to export instructors",
      });
      throw error;
    }
  }, [instructors, push]);

  // Approve instructor (for pending instructors)
  const approveInstructor = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await instructorsService.approveInstructor(id);
      setInstructors((prev) =>
        prev.map((instructor) => (instructor._id === id ? { ...instructor, status: "active" } : instructor))
      );
      push({
        type: "success",
        message: "Instructor approved successfully",
      });
      return data;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to approve instructor",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Reject instructor
  const rejectInstructor = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    try {
      const data = await instructorsService.rejectInstructor(id, reason);
      setInstructors((prev) => prev.filter((instructor) => instructor._id !== id));
      setTotal((prev) => prev - 1);
      push({
        type: "success",
        message: "Instructor rejected successfully",
      });
      return data;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to reject instructor",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Suspend instructor
  const suspendInstructor = useCallback(async (id: string) => {
    return updateStatus(id, "suspended");
  }, [updateStatus]);

  // Activate instructor
  const activateInstructor = useCallback(async (id: string) => {
    return updateStatus(id, "active");
  }, [updateStatus]);

  // Deactivate instructor
  const deactivateInstructor = useCallback(async (id: string) => {
    return updateStatus(id, "inactive");
  }, [updateStatus]);

  // Send broadcast announcement to instructors
  const sendBroadcast = useCallback(async (data: { subject: string; message: string; instructorIds?: string[] }) => {
    setLoading(true);
    try {
      const result = await instructorsService.sendBroadcast(data) as any;
      push({
        type: "success",
        message: result.message || "Announcement sent successfully",
      });
      return result;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to send announcement",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Send individual message to instructor
  const sendMessage = useCallback(async (instructorId: string, data: { subject: string; message: string; type?: 'email' | 'notification' | 'both' }) => {
    setLoading(true);
    try {
      const result = await instructorsService.sendMessage(instructorId, data) as any;
      push({
        type: "success",
        message: result.message || "Message sent successfully",
      });
      return result;
    } catch (error: any) {
      push({
        type: "error",
        message: error?.message || "Failed to send message",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  return {
    instructors,
    stats,
    loading,
    statsLoading,
    total,
    pagination,
    fetchInstructors,
    fetchStats,
    getInstructor,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    bulkDeleteInstructors,
    updateStatus,
    bulkUpdateStatus,
    approveInstructor,
    rejectInstructor,
    suspendInstructor,
    activateInstructor,
    deactivateInstructor,
    exportInstructors,
    sendBroadcast,
    sendMessage,
  };
}
