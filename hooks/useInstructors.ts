"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api-client";

export interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: "instructor";
  status: "active" | "inactive" | "pending" | "suspended";
  isActive: boolean;
  emailVerified: boolean;
  specialization?: string;
  experience?: "expert" | "advanced" | "intermediate";
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  // Stats
  coursesCount?: number;
  studentsCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface InstructorStats {
  totalInstructors: number;
  activeInstructors: number;
  pendingInstructors: number;
  avgRating: number;
  totalCourses: number;
  totalStudents: number;
}

export interface CreateInstructorDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  experience?: "expert" | "advanced" | "intermediate";
  country?: string;
  status?: "active" | "pending";
}

export interface UpdateInstructorDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  experience?: "expert" | "advanced" | "intermediate";
  country?: string;
  status?: "active" | "inactive" | "pending" | "suspended";
  isActive?: boolean;
  avatar?: string;
}

export function useInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const { push } = useToast();

  // Fetch all instructors with filters
  const fetchInstructors = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    specialization?: string;
    experience?: string;
  } = {}) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/users/instructors", { params });
      
      // Calculate stats for each instructor
      const instructorsWithStats = await Promise.all(
        (data || []).map(async (instructor: any) => {
          try {
            // Fetch courses for this instructor
            const { data: coursesData } = await apiClient.get("/courses", {
              params: { instructor: instructor._id },
            });
            
            const courses = coursesData?.courses || [];
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
      setTotal(instructorsWithStats.length);
      return { instructors: instructorsWithStats, total: instructorsWithStats.length };
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to fetch instructors",
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
      const [instructorsRes, coursesRes] = await Promise.all([
        apiClient.get("/users/instructors"),
        apiClient.get("/courses"),
      ]);

      const allInstructors = instructorsRes.data || [];
      const allCourses = coursesRes.data?.courses || [];

      const activeInstructors = allInstructors.filter(
        (i: any) => i.status === "active"
      ).length;
      const pendingInstructors = allInstructors.filter(
        (i: any) => i.status === "pending"
      ).length;

      const totalRating = allCourses.reduce(
        (sum: number, course: any) => sum + (course.rating || 0) * (course.reviewCount || 0),
        0
      );
      const totalReviews = allCourses.reduce(
        (sum: number, course: any) => sum + (course.reviewCount || 0),
        0
      );
      const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      const totalStudents = allCourses.reduce(
        (sum: number, course: any) => sum + (course.studentCount || 0),
        0
      );

      const statsData: InstructorStats = {
        totalInstructors: allInstructors.length,
        activeInstructors,
        pendingInstructors,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalCourses: allCourses.length,
        totalStudents,
      };

      setStats(statsData);
      return statsData;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to fetch stats",
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
      const { data } = await apiClient.get(`/users/${id}`);
      return data;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to fetch instructor",
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
      const { data } = await apiClient.post("/users", {
        ...instructorData,
        role: "instructor",
        name: `${instructorData.firstName} ${instructorData.lastName}`,
      });
      
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
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to create instructor",
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
      const { data } = await apiClient.patch(`/users/${id}`, instructorData);
      
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
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to update instructor",
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
      await apiClient.delete(`/users/${id}`);
      setInstructors((prev) => prev.filter((instructor) => instructor._id !== id));
      setTotal((prev) => prev - 1);
      
      push({
        type: "success",
        message: "Instructor deleted successfully",
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to delete instructor",
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
      const { data } = await apiClient.patch(`/users/${id}/status`, { status });
      
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
        message: error.response?.data?.message || "Failed to update status",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [push]);

  // Approve instructor (for pending instructors)
  const approveInstructor = useCallback(async (id: string) => {
    return updateStatus(id, "active");
  }, [updateStatus]);

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

  return {
    instructors,
    stats,
    loading,
    statsLoading,
    total,
    fetchInstructors,
    fetchStats,
    getInstructor,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    updateStatus,
    approveInstructor,
    suspendInstructor,
    activateInstructor,
    deactivateInstructor,
  };
}
