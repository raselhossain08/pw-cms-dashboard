import { apiClient } from "@/lib/api-client";

export interface Student {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "student";
  status: "active" | "inactive" | "pending" | "suspended";
  isActive: boolean;
  emailVerified: boolean;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  enrolledCourses?: number;
  progressPercent?: number;
  scorePercent?: number;
  enrolledText?: string;
  joinedDate?: string;
  rating?: number;
  location?: string;
  courseCount?: number;
  avatarUrl?: string;
  course?: string;
  courseDetail?: string;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  pendingStudents: number;
  suspendedStudents: number;
  avgCompletion: number;
  avgScore: number;
  totalEnrollments: number;
  completedCourses: number;
}

export interface StudentProgress {
  student: {
    id: string;
    name: string;
    email: string;
  };
  summary: {
    totalEnrollments: number;
    completed: number;
    inProgress: number;
    avgProgress: number;
    totalTimeSpent: number;
    avgScore: number;
  };
  enrollments: Array<{
    course: any;
    progress: number;
    status: string;
    lastAccessed: string;
    timeSpent: number;
    quizScores: number[];
    avgQuizScore: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface StudentPerformanceTier {
  studentId: string;
  name: string;
  email: string;
  score: number;
  tier: "excellent" | "good" | "average" | "needs_improvement";
  stats: {
    avgCompletion: number;
    avgScore: number;
    enrollmentCount: number;
    completedCourses: number;
    activeTime: number;
  };
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  status?: "active" | "pending";
  sendWelcomeEmail?: boolean;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  status?: "active" | "inactive" | "pending" | "suspended";
  isActive?: boolean;
  avatar?: string;
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  course?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class StudentsService {
  // Get all students with filters
  async getAllStudents(filters: StudentFilters = {}) {
    try {
      const params: any = {
        role: "student", // Always filter by student role
      };

      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== "all") params.status = filters.status;
      if (filters.course) params.course = filters.course;
      if (filters.country) params.country = filters.country;

      // Try admin endpoint first (returns all statuses)
      let response;
      let students: any[] = [];
      let total = 0;

      try {
        response = await apiClient.get<{ users: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>("/admin/users", { params });
        const adminData = response.data;

        // Admin endpoint returns { users: [], pagination: {} }
        if (adminData && adminData.users && Array.isArray(adminData.users)) {
          students = adminData.users;
          total = adminData.pagination?.total ?? students.length;
        }
      } catch {
        // Fallback to regular endpoint
        response = await apiClient.get<any>("/users", { params });
        const responseData = response.data;

        // Handle different response formats
        if (Array.isArray(responseData)) {
          students = responseData;
          total = students.length;
        } else if (responseData && typeof responseData === 'object') {
          if ('data' in responseData && Array.isArray(responseData.data)) {
            students = responseData.data;
            total = students.length;
          } else if ('students' in responseData && Array.isArray(responseData.students)) {
            students = responseData.students;
            total = students.length;
          } else if ('users' in responseData && Array.isArray(responseData.users)) {
            students = responseData.users;
            total = students.length;
          }
        }
      }

      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const totalPages = Math.ceil(total / limit);

      return {
        students,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  }

  // Get student by ID
  async getStudentById(id: string) {
    const response = await apiClient.get<Student>(`/users/${id}`);
    return response.data;
  }

  // Get student progress
  async getStudentProgress(id: string) {
    const response = await apiClient.get<StudentProgress>(`/admin/students/${id}/progress`);
    return response.data;
  }

  // Get student stats
  async getStudentStats(id: string) {
    const response = await apiClient.get<any>(`/admin/students/${id}/stats`);
    return response.data;
  }

  // Get overall stats
  async getStats() {
    try {
      const response = await apiClient.get<StudentStats>("/admin/students/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create student
  async createStudent(data: CreateStudentDto) {
    const response = await apiClient.post<Student>("/users", {
      ...data,
      role: "student",
    });
    return response.data;
  }

  // Update student
  async updateStudent(id: string, data: UpdateStudentDto) {
    const response = await apiClient.patch<Student>(`/users/${id}`, data);
    return response.data;
  }

  // Delete student
  async deleteStudent(id: string) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }

  // Bulk delete students
  async bulkDeleteStudents(ids: string[]) {
    const response = await apiClient.post("/admin/students/bulk-delete", { ids });
    return response.data;
  }

  // Update student status
  async updateStatus(id: string, status: "active" | "inactive" | "pending" | "suspended") {
    const response = await apiClient.patch<Student>(`/users/${id}/status`, { status });
    return response.data;
  }

  // Bulk update status
  async bulkUpdateStatus(ids: string[], status: "active" | "inactive" | "pending" | "suspended") {
    const response = await apiClient.post("/admin/students/bulk-status", { ids, status });
    return response.data;
  }

  // Export students
  async exportStudents(filters: StudentFilters = {}) {
    const params: any = { export: true };
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.course) params.course = filters.course;
    if (filters.country) params.country = filters.country;

    const response = await apiClient.get<any>("/admin/students/export", { params });
    return response.data;
  }

  // Import students
  async importStudents(students: any[], sendWelcomeEmail: boolean = false) {
    const response = await apiClient.post("/admin/students/import", {
      students,
      sendWelcomeEmail,
    });
    return response.data;
  }

  // Send broadcast email
  async sendBroadcastToStudents(params: {
    subject: string;
    message: string;
    studentIds?: string[];
    courseId?: string;
  }) {
    const response = await apiClient.post("/admin/students/broadcast", params);
    return response.data;
  }

  // Send message to student
  async sendMessageToStudent(
    studentId: string,
    subject: string,
    message: string,
    type: 'email' | 'notification' | 'both' = 'email'
  ) {
    const response = await apiClient.post(`/admin/students/${studentId}/message`, {
      subject,
      message,
      type,
    });
    return response.data;
  }

  // Get student analytics
  async getStudentAnalytics(startDate?: Date, endDate?: Date) {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await apiClient.get("/admin/students/analytics", { params });
    return response.data;
  }

  // Get student performance tiers
  async getStudentPerformanceTiers() {
    const response = await apiClient.get<{
      tiers: {
        excellent: StudentPerformanceTier[];
        good: StudentPerformanceTier[];
        average: StudentPerformanceTier[];
        needs_improvement: StudentPerformanceTier[];
      };
      summary: {
        total: number;
        excellentCount: number;
        excellentPercentage: number;
        goodCount: number;
        goodPercentage: number;
        averageCount: number;
        averagePercentage: number;
        needsImprovementCount: number;
        needsImprovementPercentage: number;
      };
    }>("/admin/students/performance-tiers");
    return response.data;
  }

  // Bulk activate students
  async bulkActivateStudents(ids: string[]) {
    return this.bulkUpdateStatus(ids, "active");
  }

  // Bulk deactivate students
  async bulkDeactivateStudents(ids: string[]) {
    return this.bulkUpdateStatus(ids, "inactive");
  }

  // Suspend student
  async suspendStudent(id: string) {
    return this.updateStatus(id, "suspended");
  }

  // Activate student
  async activateStudent(id: string) {
    return this.updateStatus(id, "active");
  }
}

export const studentsService = new StudentsService();

