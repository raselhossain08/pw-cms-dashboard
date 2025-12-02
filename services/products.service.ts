import { apiClient } from "@/lib/api-client";

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    category: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sku: string;
    isPublished: boolean;
    isFeatured: boolean;
    tags: string[];
    rating: number;
    reviewsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    description: string;
    images: string[];
    category: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sku: string;
    tags?: string[];
    isPublished?: boolean;
    isFeatured?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>

class ProductsService {
    async getAllProducts(params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        isPublished?: boolean;
    } = {}) {
        try {
            const { data } = await apiClient.get("/products", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch products:", error);
            throw error;
        }
    }

    async getProductById(id: string) {
        try {
            const { data } = await apiClient.get(`/products/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch product ${id}:`, error);
            throw error;
        }
    }

    async createProduct(productData: CreateProductDto) {
        try {
            const { data } = await apiClient.post("/products", productData);
            return data;
        } catch (error) {
            console.error("Failed to create product:", error);
            throw error;
        }
    }

    async updateProduct(id: string, productData: UpdateProductDto) {
        try {
            const { data } = await apiClient.put(`/products/${id}`, productData);
            return data;
        } catch (error) {
            console.error(`Failed to update product ${id}:`, error);
            throw error;
        }
    }

    async deleteProduct(id: string) {
        try {
            await apiClient.delete(`/products/${id}`);
        } catch (error) {
            console.error(`Failed to delete product ${id}:`, error);
            throw error;
        }
    }

    async publishProduct(id: string) {
        try {
            const { data } = await apiClient.patch(`/products/${id}/publish`);
            return data;
        } catch (error) {
            console.error(`Failed to publish product ${id}:`, error);
            throw error;
        }
    }

    async unpublishProduct(id: string) {
        try {
            const { data } = await apiClient.patch(`/products/${id}/unpublish`);
            return data;
        } catch (error) {
            console.error(`Failed to unpublish product ${id}:`, error);
            throw error;
        }
    }

    async updateStock(id: string, stock: number) {
        try {
            const { data } = await apiClient.patch(`/products/${id}/stock`, { stock });
            return data;
        } catch (error) {
            console.error(`Failed to update stock for product ${id}:`, error);
            throw error;
        }
    }
}

export const productsService = new ProductsService();
export default productsService;
