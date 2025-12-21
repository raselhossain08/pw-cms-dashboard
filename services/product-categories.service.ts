import { apiClient } from "@/lib/api-client";

export interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image?: string;
    parentCategory?: string;
    status: "active" | "inactive";
    productCount?: number;
    subcategoryCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductCategoryDto {
    name: string;
    description: string;
    image?: string;
    parentCategory?: string;
    status?: "active" | "inactive";
}

export interface UpdateProductCategoryDto {
    name?: string;
    description?: string;
    image?: string;
    parentCategory?: string;
    status?: "active" | "inactive";
}

export interface GetProductCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "inactive";
    parentCategory?: string;
}

export interface GetProductCategoriesResponse {
    success: boolean;
    data: {
        categories: ProductCategory[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class ProductCategoriesService {
    async getAllCategories(params?: GetProductCategoriesParams): Promise<GetProductCategoriesResponse> {
        try {
            const { data } = await apiClient.get<GetProductCategoriesResponse>("/products/categories", {
                params: params as any
            });
            return data;
        } catch (error) {
            console.error("Failed to fetch product categories:", error);
            throw error;
        }
    }

    async getCategoryById(id: string): Promise<ProductCategory> {
        try {
            const { data } = await apiClient.get<{ data: ProductCategory }>(`/products/categories/${id}`);
            return data.data;
        } catch (error) {
            console.error(`Failed to fetch category ${id}:`, error);
            throw error;
        }
    }

    async createCategory(categoryData: CreateProductCategoryDto): Promise<ProductCategory> {
        try {
            const { data } = await apiClient.post<{ data: ProductCategory }>("/products/categories", categoryData);
            return data.data;
        } catch (error) {
            console.error("Failed to create category:", error);
            throw error;
        }
    }

    async updateCategory(id: string, categoryData: UpdateProductCategoryDto): Promise<ProductCategory> {
        try {
            const { data } = await apiClient.put<{ data: ProductCategory }>(`/products/categories/${id}`, categoryData);
            return data.data;
        } catch (error) {
            console.error(`Failed to update category ${id}:`, error);
            throw error;
        }
    }

    async deleteCategory(id: string): Promise<void> {
        try {
            await apiClient.delete(`/products/categories/${id}`);
        } catch (error) {
            console.error(`Failed to delete category ${id}:`, error);
            throw error;
        }
    }

    async getTopLevelCategories(): Promise<ProductCategory[]> {
        try {
            const { data } = await apiClient.get<{ data: ProductCategory[] }>("/products/categories/top-level");
            return data.data;
        } catch (error) {
            console.error("Failed to fetch top-level categories:", error);
            throw error;
        }
    }

    async getSubcategories(parentId: string): Promise<ProductCategory[]> {
        try {
            const { data } = await apiClient.get<{ data: ProductCategory[] }>(`/products/categories/${parentId}/subcategories`);
            return data.data;
        } catch (error) {
            console.error(`Failed to fetch subcategories for ${parentId}:`, error);
            throw error;
        }
    }

    async bulkUpdateStatus(ids: string[], status: "active" | "inactive"): Promise<{ updated: number }> {
        try {
            const { data } = await apiClient.post<{ data: { updated: number } }>("/products/categories/bulk/status", { ids, status });
            return data.data;
        } catch (error) {
            console.error("Failed to bulk update category status:", error);
            throw error;
        }
    }

    async bulkDelete(ids: string[]): Promise<{ deleted: number; errors: string[] }> {
        try {
            const { data } = await apiClient.post<{ data: { deleted: number; errors: string[] } }>("/products/categories/bulk/delete", { ids });
            return data.data;
        } catch (error) {
            console.error("Failed to bulk delete categories:", error);
            throw error;
        }
    }
}

export const productCategoriesService = new ProductCategoriesService();
export default productCategoriesService;
