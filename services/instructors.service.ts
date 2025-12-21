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
  coursesCount?: number;
  studentsCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface InstructorStats {
  totalInstructors: number;
  activeInstructors: number;
  pendingInstructors: number;
  inactiveInstructors: number;
  suspendedInstructors: number;
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

export interface InstructorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  specialization?: string;
  experience?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class InstructorsService {
  // Get all instructors with filters
  async getAllInstructors(filters: InstructorFilters = {}) {
    try {
      const params: any = {
        role: "instructor", // Always filter by instructor role
      };

      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== "all") params.status = filters.status;
      // Note: specialization and experience might need client-side filtering
      // as they may not be supported by the backend endpoint

      // Try admin endpoint first (returns all statuses)
      let response;
      let instructors: any[] = [];
      let total = 0;

      try {
        response = await apiClient.get<{ users: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>("/admin/users", { params });
        const adminData = response.data;

        // Admin endpoint returns { users: [], pagination: {} }
        if (adminData && adminData.users && Array.isArray(adminData.users)) {
          instructors = adminData.users;
          total = adminData.pagination?.total ?? instructors.length;
        }
      } catch {
        // Fallback to regular endpoint
        response = await apiClient.get<any>("/users/instructors", { params });
        const responseData = response.data;

        // Handle different response formats
        // apiClient extracts 'data' property, so responseData should be the array
        // But handle cases where it might still be wrapped
        if (Array.isArray(responseData)) {
          // Format: [...] (apiClient extracted the data property)
          instructors = responseData;
          total = instructors.length;
        } else if (responseData && typeof responseData === 'object') {
          // Handle wrapped formats
          if ('data' in responseData && Array.isArray(responseData.data)) {
            // Format: { success: true, data: [...], meta: {...} }
            instructors = responseData.data;
            total = instructors.length;
          } else if ('instructors' in responseData && Array.isArray(responseData.instructors)) {
            // Format: { instructors: [...] }
            instructors = responseData.instructors;
            total = instructors.length;
          } else if ('users' in responseData && Array.isArray(responseData.users)) {
            // Format: { users: [...] }
            instructors = responseData.users;
            total = instructors.length;
          }
        }
      }

      // Apply client-side filters for fields not supported by backend
      if (filters.specialization && filters.specialization !== "all") {
        instructors = instructors.filter((i: any) => i.specialization === filters.specialization);
      }
      if (filters.experience && filters.experience !== "all") {
        instructors = instructors.filter((i: any) => i.experience === filters.experience);
      }

      // Apply pagination if not already paginated by backend
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      let paginatedInstructors = instructors;

      // Only paginate client-side if backend didn't paginate
      if (instructors.length > limit) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        paginatedInstructors = instructors.slice(startIndex, endIndex);
      }

      const totalPages = Math.ceil(total / limit);

      return {
        instructors: paginatedInstructors,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error("Error fetching instructors:", error);
      throw error;
    }
  }

  // Get instructor by ID
  async getInstructorById(id: string) {
    const response = await apiClient.get<Instructor>(`/users/${id}`);
    return response.data;
  }

  // Get instructor stats
  async getInstructorStats(id: string) {
    const response = await apiClient.get<any>(`/admin/instructors/${id}/stats`);
    return response.data;
  }

  // Get pending instructors
  async getPendingInstructors(page = 1, limit = 20) {
    const response = await apiClient.get<{ instructors: Instructor[]; total: number; page: number; limit: number; totalPages: number }>("/admin/instructors/pending", {
      params: { page, limit },
    });
    return response.data;
  }

  // Get overall stats
  async getStats() {
    try {
      const [instructorsRes, coursesRes] = await Promise.all([
        apiClient.get<Instructor[] | { instructors: Instructor[] }>("/users/instructors"),
        apiClient.get<{ courses: any[] }>("/courses"),
      ]);

      // Handle both array and object responses
      const instructorsData = instructorsRes.data;
      const allInstructors = Array.isArray(instructorsData)
        ? instructorsData
        : (instructorsData as any)?.instructors || [];
      const allCourses = coursesRes.data?.courses || [];

      const activeInstructors = allInstructors.filter((i: any) => i.status === "active").length;
      const pendingInstructors = allInstructors.filter((i: any) => i.status === "pending").length;
      const inactiveInstructors = allInstructors.filter((i: any) => i.status === "inactive").length;
      const suspendedInstructors = allInstructors.filter((i: any) => i.status === "suspended").length;

      const totalRating = allCourses.reduce((sum: number, course: any) => sum + (course.rating || 0) * (course.reviewCount || 0), 0);
      const totalReviews = allCourses.reduce((sum: number, course: any) => sum + (course.reviewCount || 0), 0);
      const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      const totalStudents = allCourses.reduce((sum: number, course: any) => sum + (course.studentCount || 0), 0);

      const stats: InstructorStats = {
        totalInstructors: allInstructors.length,
        activeInstructors,
        pendingInstructors,
        inactiveInstructors,
        suspendedInstructors,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalCourses: allCourses.length,
        totalStudents,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Create instructor
  async createInstructor(data: CreateInstructorDto) {
    const response = await apiClient.post<Instructor>("/users", {
      ...data,
      role: "instructor",
    });
    return response.data;
  }

  // Update instructor
  async updateInstructor(id: string, data: UpdateInstructorDto) {
    const response = await apiClient.patch<Instructor>(`/users/${id}`, data);
    return response.data;
  }

  // Delete instructor
  async deleteInstructor(id: string) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }

  // Bulk delete instructors
  async bulkDeleteInstructors(ids: string[]) {
    const response = await apiClient.post("/admin/instructors/bulk-delete", { ids });
    return response.data;
  }

  // Approve instructor
  async approveInstructor(id: string) {
    const response = await apiClient.post<Instructor>(`/admin/instructors/${id}/approve`);
    return response.data;
  }

  // Reject instructor
  async rejectInstructor(id: string, reason: string) {
    const response = await apiClient.post<Instructor>(`/admin/instructors/${id}/reject`, { reason });
    return response.data;
  }

  // Update instructor status
  async updateStatus(id: string, status: "active" | "inactive" | "pending" | "suspended") {
    const response = await apiClient.patch<Instructor>(`/users/${id}/status`, { status });
    return response.data;
  }

  // Bulk update status
  async bulkUpdateStatus(ids: string[], status: "active" | "inactive" | "pending" | "suspended") {
    const response = await apiClient.post("/admin/instructors/bulk-status", { ids, status });
    return response.data;
  }

  // Export instructors
  async exportInstructors(filters: InstructorFilters = {}) {
    const params: any = { export: true };
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.specialization && filters.specialization !== "all") params.specialization = filters.specialization;
    if (filters.experience && filters.experience !== "all") params.experience = filters.experience;

    const response = await apiClient.get<Blob>("/admin/instructors/export", {
      params,
      // Note: You may need to handle blob response differently
    });
    return response.data;
  }
}

export const instructorsService = new InstructorsService();
