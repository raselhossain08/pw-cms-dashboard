import axios from "../axios";
import type { Product, ProductFormData } from "@/lib/types/product";

export interface GetProductsParams {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    category?: string;
    search?: string;
    [key: string]: string | number | boolean | undefined;
}

export interface GetProductsResponse {
    products: Product[];
    total: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const productsService = {
    // Get all products (for dashboard - includes all statuses)
    async getAllProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
        try {
            const response = await axios.get<ApiResponse<GetProductsResponse>>('/products', { params });
            return response.data.data; // Extract data.data because API returns { success, message, data: { products, total } }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            throw error;
        }
    },

    // Get product by ID
    async getProductById(id: string): Promise<Product> {
        try {
            const response = await axios.get<Product>(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch product:", error);
            throw error;
        }
    },

    // Get product by slug
    async getProductBySlug(slug: string): Promise<Product> {
        try {
            const response = await axios.get<Product>(`/products/slug/${slug}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch product by slug:", error);
            throw error;
        }
    },

    // Create product
    async createProduct(data: ProductFormData): Promise<Product> {
        try {
            const response = await axios.post<Product>('/products', data);
            return response.data;
        } catch (error) {
            console.error("Failed to create product:", error);
            throw error;
        }
    },

    // Update product
    async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
        try {
            const response = await axios.patch<Product>(`/products/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Failed to update product:", error);
            throw error;
        }
    },

    // Delete product
    async deleteProduct(id: string): Promise<void> {
        try {
            await axios.delete(`/products/${id}`);
        } catch (error) {
            console.error("Failed to delete product:", error);
            throw error;
        }
    },

    // Get featured products
    async getFeaturedProducts(limit = 6): Promise<Product[]> {
        try {
            const response = await axios.get<{ products: Product[] }>('/products/featured', {
                params: { limit },
            });
            return response.data.products;
        } catch (error) {
            console.error("Failed to fetch featured products:", error);
            throw error;
        }
    },

    // Search products
    async searchProducts(query: string, limit = 10): Promise<Product[]> {
        try {
            const response = await axios.get<GetProductsResponse>('/products', {
                params: { search: query, limit },
            });
            return response.data.products;
        } catch (error) {
            console.error("Failed to search products:", error);
            throw error;
        }
    },
};

export default productsService;
