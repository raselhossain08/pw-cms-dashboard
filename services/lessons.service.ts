import { apiClient } from "@/lib/api-client";

export enum LessonType {
    VIDEO = 'video',
    TEXT = 'text',
    QUIZ = 'quiz',
    ASSIGNMENT = 'assignment',
    DOWNLOAD = 'download',
}

export enum LessonStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

export interface LessonDto {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    type: LessonType;
    status: LessonStatus;
    order: number;
    videoUrl?: string;
    content?: string;
    duration: number; // in seconds
    isFree: boolean;
    thumbnail?: string;
    quizQuestions?: string[];
    downloads?: string[];
    course: string | {
        _id: string;
        title: string;
        instructor?: string;
    };
    module?: string | {
        _id: string;
        title: string;
    };
    passingScore: number;
    completionCount: number;
    averageScore: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface LessonAnalytics {
    lessonId: string;
    title: string;
    type: LessonType;
    status: LessonStatus;
    views: number;
    completions: number;
    averageProgress: number;
    averageTimeSpent: number;
    averageScore: number;
    lastAccessed?: string;
}

export interface CreateLessonPayload {
    title: string;
    description?: string;
    type: LessonType | string;
    content?: string;
    videoUrl?: string;
    thumbnail?: string;
    duration?: number;
    order?: number;
    isFree?: boolean;
    status?: LessonStatus | string;
    moduleId?: string;
}

export interface UpdateLessonPayload {
    title?: string;
    description?: string;
    type?: LessonType | string;
    content?: string;
    videoUrl?: string;
    thumbnail?: string;
    duration?: number;
    order?: number;
    isFree?: boolean;
    status?: LessonStatus | string;
    moduleId?: string;
}

class LessonsService {
    async getCourseLessons(courseId: string): Promise<LessonDto[]> {
        try {
            const { data } = await apiClient.get<{ lessons?: LessonDto[] } | LessonDto[]>(`/courses/${courseId}/lessons`);
            if (Array.isArray(data)) {
                return data;
            }
            if (data && typeof data === 'object' && 'lessons' in data && Array.isArray((data as { lessons?: LessonDto[] }).lessons)) {
                return (data as { lessons?: LessonDto[] }).lessons || [];
            }
            return [];
        } catch (error) {
            throw error;
        }
    }

    async getLessonById(lessonId: string): Promise<LessonDto> {
        const { data } = await apiClient.get<LessonDto>(`/courses/lessons/${lessonId}`);
        return data;
    }

    async createLesson(courseId: string, payload: CreateLessonPayload): Promise<LessonDto> {
        const { data } = await apiClient.post<LessonDto>(`/courses/${courseId}/lessons`, payload);
        return data;
    }

    async updateLesson(lessonId: string, payload: UpdateLessonPayload): Promise<LessonDto> {
        const { data } = await apiClient.patch<LessonDto>(`/courses/lessons/${lessonId}`, payload);
        return data;
    }

    async deleteLesson(lessonId: string): Promise<{ message: string }> {
        const { data } = await apiClient.delete<{ message: string }>(`/courses/lessons/${lessonId}`);
        return data;
    }

    async reorderLessons(courseId: string, lessonIds: string[], moduleId?: string): Promise<{ message: string }> {
        const { data } = await apiClient.patch<{ message: string }>(
            `/courses/${courseId}/lessons/reorder`,
            { lessonIds, moduleId }
        );
        return data;
    }

    async duplicateLesson(lessonId: string): Promise<LessonDto> {
        const { data } = await apiClient.post<LessonDto>(`/courses/lessons/${lessonId}/duplicate`);
        return data;
    }

    async getLessonAnalytics(lessonId: string): Promise<LessonAnalytics> {
        const { data } = await apiClient.get<LessonAnalytics>(`/courses/lessons/${lessonId}/analytics`);
        return data;
    }

    async getCourseAnalytics(courseId: string): Promise<any> {
        const { data } = await apiClient.get<any>(`/courses/${courseId}/analytics`);
        return data;
    }

    async toggleLessonStatus(lessonId: string): Promise<LessonDto> {
        const { data } = await apiClient.patch<LessonDto>(`/courses/lessons/${lessonId}/toggle-status`);
        return data;
    }

    async bulkDeleteLessons(ids: string[]): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/courses/lessons/bulk-delete", { ids });
        return data;
    }

    async bulkToggleStatus(ids: string[]): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/courses/lessons/bulk-toggle-status", { ids });
        return data;
    }

    async exportLessons(format: "csv" | "xlsx" | "pdf", params?: { courseId?: string; moduleId?: string }): Promise<Blob> {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const { getAccessToken } = await import('@/lib/cookies');
        const token = getAccessToken();

        const queryParams = new URLSearchParams();
        if (params?.courseId) {
            queryParams.append('courseId', params.courseId);
        }
        if (params?.moduleId) {
            queryParams.append('moduleId', params.moduleId);
        }
        const queryString = queryParams.toString();
        const url = `${BASE_URL}/courses/lessons/export/${format}${queryString ? `?${queryString}` : ''}`;

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
            throw new Error(`Failed to export lessons: ${response.statusText}`);
        }

        return await response.blob();
    }
}

export const lessonsService = new LessonsService();

