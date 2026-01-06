import { apiClient } from "@/lib/api-client";

export interface Assignment {
  _id: string;
  course: string | { _id: string; title?: string };
  instructor: string | { _id: string; firstName?: string; lastName?: string };
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  dueDate: string;
  maxPoints?: number;
  attachments?: string[];
  moduleId?: string;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  dueDate?: string;
  maxPoints?: number;
  attachments?: string[];
}

class AssignmentsService {
  async getCourseAssignments(courseId: string, params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ assignments: Assignment[]; total: number }>(
      `/assignments/course/${courseId}`,
      { params }
    );
    return data;
  }

  async createAssignment(courseId: string, payload: CreateAssignmentDto) {
    const { data } = await apiClient.post<Assignment>(`/assignments/course/${courseId}`, payload);
    return data;
  }

  async updateAssignment(id: string, payload: UpdateAssignmentDto) {
    const { data } = await apiClient.patch<Assignment>(`/assignments/${id}`, payload);
    return data;
  }

  async deleteAssignment(id: string) {
    const { data } = await apiClient.delete(`/assignments/${id}`);
    return data;
  }

  async getAssignment(id: string) {
    const { data } = await apiClient.get<Assignment>(`/assignments/${id}`);
    return data;
  }

  async getAssignmentSubmissions(id: string, params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<any>(`/assignments/${id}/submissions`, { params });
    return data;
  }

  async gradeSubmission(id: string, payload: { grade: number; feedback?: string }) {
    const { data } = await apiClient.post(`/assignments/submissions/${id}/grade`, payload);
    return data;
  }

  async getAssignmentStats(id: string) {
    const { data } = await apiClient.get<any>(`/assignments/${id}/stats`);
    return data;
  }

  async submitAssignment(id: string, payload: { content: string; attachments?: string[] }) {
    const { data } = await apiClient.post(`/assignments/${id}/submit`, payload);
    return data;
  }

  async getMySubmissions(params: { courseId?: string; page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ submissions: any[]; total: number }>(
      "/assignments/my-submissions",
      { params }
    );
    return data;
  }

  async getSubmission(id: string) {
    const { data } = await apiClient.get(`/assignments/submissions/${id}`);
    return data;
  }

  async toggleAssignmentStatus(id: string) {
    try {
      const { data } = await apiClient.patch<Assignment>(`/assignments/${id}/toggle-status`);
      return data;
    } catch (error) {
      console.error(`Failed to toggle assignment status ${id}:`, error);
      throw error;
    }
  }

  async duplicateAssignment(id: string) {
    try {
      const { data } = await apiClient.post<Assignment>(`/assignments/${id}/duplicate`);
      return data;
    } catch (error) {
      console.error(`Failed to duplicate assignment ${id}:`, error);
      throw error;
    }
  }

  async bulkDeleteAssignments(ids: string[]) {
    try {
      const { data } = await apiClient.post('/assignments/bulk-delete', { ids });
      return data;
    } catch (error) {
      console.error('Failed to bulk delete assignments:', error);
      throw error;
    }
  }

  async bulkToggleStatus(ids: string[]) {
    try {
      const { data } = await apiClient.post('/assignments/bulk-toggle-status', { ids });
      return data;
    } catch (error) {
      console.error('Failed to bulk toggle assignment status:', error);
      throw error;
    }
  }

  async exportAssignments(format: "csv" | "xlsx" | "pdf", params?: { courseId?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.courseId) queryParams.append('courseId', params.courseId);
      queryParams.append('format', format);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/assignments/export?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export assignments');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assignments_export_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export assignments:', error);
      throw error;
    }
  }
}

export const assignmentsService = new AssignmentsService();
export default assignmentsService;
