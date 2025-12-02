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
  course: string;
  description?: string;
  duration?: number;
  status?: "published" | "draft";
  order?: number;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> { }

class ModulesService {
  async getAllModules(params: {
    page?: number;
    limit?: number;
    search?: string;
    courseId?: string;
    status?: string;
    isPublished?: boolean;
  } = {}) {
    try {
      const { data } = await apiClient.get<ModuleDto[]>("/courses", { params });
      return data;
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      throw error;
    }
  }

  async getModuleById(id: string) {
    try {
      const { data } = await apiClient.get<ModuleDto>(`/courses/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch module ${id}:`, error);
      throw error;
    }
  }

  async createModule(moduleData: CreateModuleDto) {
    try {
      const { data } = await apiClient.post<ModuleDto>("/courses", moduleData);
      return data;
    } catch (error) {
      console.error("Failed to create module:", error);
      throw error;
    }
  }

  async updateModule(id: string, moduleData: UpdateModuleDto) {
    try {
      const { data } = await apiClient.put<ModuleDto>(`/courses/${id}`, moduleData);
      return data;
    } catch (error) {
      console.error(`Failed to update module ${id}:`, error);
      throw error;
    }
  }

  async deleteModule(id: string) {
    try {
      await apiClient.delete(`/courses/${id}`);
    } catch (error) {
      console.error(`Failed to delete module ${id}:`, error);
      throw error;
    }
  }

  async getModuleLessons(moduleId: string) {
    try {
      const { data } = await apiClient.get<Lesson[]>(`/courses/${moduleId}/lessons`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch lessons for module ${moduleId}:`, error);
      throw error;
    }
  }

  async duplicateModule(id: string) {
    try {
      const { data } = await apiClient.post(`/courses/${id}/duplicate`);
      return data;
    } catch (error) {
      console.error(`Failed to duplicate module ${id}:`, error);
      throw error;
    }
  }
}

export const modulesService = new ModulesService();
export default modulesService;
