import { apiClient } from "@/lib/api-client";

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment" | "download";
  status: "draft" | "published";
  duration?: number;
  videoUrl?: string;
  content?: string;
  order?: number;
  isPreview?: boolean;
  course?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleDto {
  _id?: string;
  id?: string;
  title: string;
  course: string | { _id: string; title?: string };
  lessons?: Lesson[] | number;
  lessonsCount?: number;
  duration?: string | number;
  durationHours?: number;
  status?: "published" | "draft" | "archived";
  completion?: number;
  description?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModuleDto {
  title: string;
  courseId: string;
  description?: string;
  duration?: number;
  status?: "published" | "draft";
  order?: number;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> { }

class ModulesService {
  async getAllModules(params: { page?: number; limit?: number; courseId?: string } = {}) {
    try {
      const { data }: any = await apiClient.get("/course-modules", { params });
      // Return the full response to let component handle parsing
      return data;
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      throw error;
    }
  }

  async getModuleById(id: string) {
    try {
      const { data } = await apiClient.get<ModuleDto>(`/course-modules/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch module ${id}:`, error);
      throw error;
    }
  }

  async createModule(moduleData: CreateModuleDto) {
    try {
      const { data } = await apiClient.post<ModuleDto>("/course-modules", moduleData);
      return data;
    } catch (error) {
      console.error("Failed to create module:", error);
      throw error;
    }
  }

  async updateModule(id: string, moduleData: UpdateModuleDto) {
    try {
      const { data } = await apiClient.patch<ModuleDto>(`/course-modules/${id}`, moduleData);
      return data;
    } catch (error) {
      console.error(`Failed to update module ${id}:`, error);
      throw error;
    }
  }

  async deleteModule(id: string) {
    try {
      await apiClient.delete(`/course-modules/${id}`);
    } catch (error) {
      console.error(`Failed to delete module ${id}:`, error);
      throw error;
    }
  }

  async getModuleLessons(moduleId: string) {
    try {
      const { data } = await apiClient.get<Lesson[]>(`/course-modules/${moduleId}/lessons`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch lessons for module ${moduleId}:`, error);
      throw error;
    }
  }

  async duplicateModule(id: string) {
    try {
      const { data } = await apiClient.post<ModuleDto>(`/course-modules/${id}/duplicate`);
      return data;
    } catch (error) {
      console.error(`Failed to duplicate module ${id}:`, error);
      throw error;
    }
  }

  async toggleModuleStatus(id: string) {
    try {
      const { data } = await apiClient.patch<ModuleDto>(`/course-modules/${id}/toggle-status`);
      return data;
    } catch (error) {
      console.error(`Failed to toggle module status ${id}:`, error);
      throw error;
    }
  }

  async reorderModules(courseId: string, moduleIds: string[]) {
    try {
      const { data } = await apiClient.patch(`/course-modules/course/${courseId}/reorder`, { moduleIds });
      return data;
    } catch (error) {
      console.error(`Failed to reorder modules for course ${courseId}:`, error);
      throw error;
    }
  }

  async bulkDeleteModules(ids: string[]) {
    try {
      const { data } = await apiClient.post<{ message: string }>("/course-modules/bulk-delete", { ids });
      return data;
    } catch (error) {
      console.error("Failed to bulk delete modules:", error);
      throw error;
    }
  }

  async bulkToggleStatus(ids: string[]) {
    try {
      const { data } = await apiClient.post<{ message: string }>("/course-modules/bulk-toggle-status", { ids });
      return data;
    } catch (error) {
      console.error("Failed to bulk toggle module status:", error);
      throw error;
    }
  }

  async getModuleStats(id: string) {
    try {
      const { data } = await apiClient.get(`/course-modules/${id}/stats`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch module stats ${id}:`, error);
      throw error;
    }
  }

  async exportModules(format: "csv" | "xlsx" | "pdf", params?: { courseId?: string }): Promise<Blob> {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const { getAccessToken } = await import('@/lib/cookies');
    const token = getAccessToken();

    const queryParams = new URLSearchParams();
    if (params?.courseId) {
      queryParams.append('courseId', params.courseId);
    }
    const queryString = queryParams.toString();
    const url = `${BASE_URL}/course-modules/export/${format}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to export modules: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const modulesService = new ModulesService();
export default modulesService;
