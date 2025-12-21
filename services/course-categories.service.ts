import { apiClient } from "@/lib/api-client";

export interface CourseCategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string;
    courseCount?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    image?: string;
    icon?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    image?: string;
    icon?: string;
    isActive?: boolean;
}

export interface GetCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: 'name' | 'courseCount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface GetCategoriesResponse {
    success: boolean;
    data: {
        categories: CourseCategory[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface CategoryResponse {
    success: boolean;
    data: CourseCategory;
    message?: string;
}

class CourseCategoriesService {
    async getAllCategories(params?: GetCategoriesParams): Promise<GetCategoriesResponse> {
        try {
            const { data } = await apiClient.get<GetCategoriesResponse>("/course-categories", { params: params as any });
            return data;
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            throw error;
        }
    }

    async getCategoryNames(): Promise<string[]> {
        try {
            const { data } = await apiClient.get<string[]>("/course-categories/names");
            return data;
        } catch (error) {
            console.error("Failed to fetch category names:", error);
            throw error;
        }
    }

    async getFeaturedCategories(limit = 5): Promise<CourseCategory[]> {
        try {
            const { data } = await apiClient.get<GetCategoriesResponse>("/course-categories/featured", {
                params: { limit }
            });
            return data.data.categories;
        } catch (error) {
            console.error("Failed to fetch featured categories:", error);
            throw error;
        }
    }

    async getCategoryBySlug(slug: string): Promise<CourseCategory> {
        try {
            const { data } = await apiClient.get<CategoryResponse>(`/course-categories/${slug}`);
            return data.data;
        } catch (error) {
            console.error(`Failed to fetch category ${slug}:`, error);
            throw error;
        }
    }

    async getCategoryById(id: string): Promise<CourseCategory> {
        try {
            const { data } = await apiClient.get<CategoryResponse>(`/course-categories/id/${id}`);
            return data.data;
        } catch (error) {
            console.error(`Failed to fetch category ${id}:`, error);
            throw error;
        }
    }

    async createCategory(categoryData: CreateCategoryDto): Promise<CourseCategory> {
        try {
            const { data } = await apiClient.post<CategoryResponse>("/course-categories", categoryData);
            return data.data;
        } catch (error) {
            console.error("Failed to create category:", error);
            throw error;
        }
    }

    async updateCategory(slug: string, categoryData: UpdateCategoryDto): Promise<CourseCategory> {
        try {
            const { data } = await apiClient.patch<CategoryResponse>(`/course-categories/${slug}`, categoryData);
            return data.data;
        } catch (error) {
            console.error(`Failed to update category ${slug}:`, error);
            throw error;
        }
    }

    async deleteCategory(slug: string): Promise<void> {
        try {
            await apiClient.delete(`/course-categories/${slug}`);
        } catch (error) {
            console.error(`Failed to delete category ${slug}:`, error);
            throw error;
        }
    }

    async toggleCategoryStatus(slug: string): Promise<CourseCategory> {
        try {
            const { data } = await apiClient.patch<CategoryResponse>(`/course-categories/${slug}/toggle-status`);
            return data.data;
        } catch (error) {
            console.error(`Failed to toggle category status ${slug}:`, error);
            throw error;
        }
    }

    async duplicateCategory(slug: string): Promise<CourseCategory> {
        try {
            const { data } = await apiClient.post<CategoryResponse>(`/course-categories/${slug}/duplicate`);
            return data.data;
        } catch (error) {
            console.error(`Failed to duplicate category ${slug}:`, error);
            throw error;
        }
    }

    async bulkDeleteCategories(slugs: string[]): Promise<void> {
        try {
            await apiClient.post('/course-categories/bulk-delete', { slugs });
        } catch (error) {
            console.error('Failed to bulk delete categories:', error);
            throw error;
        }
    }

    async bulkToggleStatus(slugs: string[]): Promise<void> {
        try {
            await apiClient.post('/course-categories/bulk-toggle-status', { slugs });
        } catch (error) {
            console.error('Failed to bulk toggle category status:', error);
            throw error;
        }
    }

    async getCategoryStats(): Promise<any> {
        try {
            const { data } = await apiClient.get<any>('/course-categories/stats');
            return (data as any)?.data || data;
        } catch (error) {
            console.error('Failed to fetch category stats:', error);
            throw error;
        }
    }

    async exportCategories(format: "csv" | "xlsx" | "pdf", params?: { isActive?: boolean }) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
            queryParams.append('format', format);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/course-categories/export?${queryParams.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to export categories');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `course_categories_export_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export categories:', error);
            throw error;
        }
    }
}

export const courseCategoriesService = new CourseCategoriesService();
export default courseCategoriesService;
