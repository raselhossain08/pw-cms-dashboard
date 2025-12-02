import { apiClient } from "@/lib/api-client";

// Training Program is essentially a specialized view of courses
// with additional metadata for training-specific features
export interface TrainingProgram {
    _id: string;
    title: string;
    slug: string;
    description: string;
    excerpt?: string;
    instructor: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
    } | string;
    type: "theoretical" | "practical" | "simulator" | "combined";
    level: "beginner" | "intermediate" | "advanced" | "expert";
    price: number;
    duration?: number;
    durationHours?: number;
    maxStudents?: number;
    studentCount?: number;
    enrollmentCount?: number;
    rating?: number;
    reviewCount?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    status?: "published" | "draft" | "archived";
    certificateAvailable?: boolean;
    categories?: string[];
    tags?: string[];
    thumbnail?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTrainingProgramDto {
    title: string;
    slug?: string;
    description: string;
    excerpt?: string;
    type: "theoretical" | "practical" | "simulator" | "combined";
    level: "beginner" | "intermediate" | "advanced" | "expert";
    price: number;
    duration?: number;
    durationHours?: number;
    maxStudents: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    categories?: string[];
    tags?: string[];
    thumbnail?: string;
    instructor?: string;
    certificateAvailable?: boolean;
}

export type UpdateTrainingProgramDto = Partial<CreateTrainingProgramDto>;

class TrainingService {
    /**
     * Get all training programs (uses courses API)
     */
    async getAllPrograms(params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
        level?: string;
        isPublished?: boolean;
    } = {}) {
        try {
            const { data } = await apiClient.get("/courses", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch training programs:", error);
            throw error;
        }
    }

    /**
     * Get a single training program by ID
     */
    async getProgramById(id: string) {
        try {
            const { data } = await apiClient.get(`/courses/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new training program
     */
    async createProgram(programData: CreateTrainingProgramDto) {
        try {
            const { data } = await apiClient.post("/courses", programData);
            return data;
        } catch (error) {
            console.error("Failed to create training program:", error);
            throw error;
        }
    }

    /**
     * Update an existing training program
     */
    async updateProgram(id: string, updates: UpdateTrainingProgramDto) {
        try {
            const { data } = await apiClient.patch(`/courses/${id}`, updates);
            return data;
        } catch (error) {
            console.error(`Failed to update training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a training program
     */
    async deleteProgram(id: string) {
        try {
            const { data } = await apiClient.delete(`/courses/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to delete training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get featured training programs
     */
    async getFeaturedPrograms(limit = 6) {
        try {
            const { data } = await apiClient.get("/courses", {
                params: { isFeatured: true, limit, isPublished: true },
            });
            return data;
        } catch (error) {
            console.error("Failed to fetch featured programs:", error);
            throw error;
        }
    }

    /**
     * Get programs by type (theoretical, practical, simulator, combined)
     */
    async getProgramsByType(type: string, params: Record<string, any> = {}) {
        try {
            const { data } = await apiClient.get("/courses", {
                params: { type, ...params },
            });
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${type} programs:`, error);
            throw error;
        }
    }
}

export const trainingService = new TrainingService();
