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

    // Get product statistics
    async getProductStats(): Promise<{
        totalProducts: number;
        publishedProducts: number;
        totalAircraft: number;
        totalSold: number;
        totalRevenue: number;
        averagePrice: number;
    }> {
        try {
            const response = await axios.get<ApiResponse<{
                totalProducts: number;
                publishedProducts: number;
                totalAircraft: number;
                totalSold: number;
                totalRevenue: number;
                averagePrice: number;
            }>>('/products/stats');
            return response.data.data;
        } catch (error) {
            console.error("Failed to fetch product stats:", error);
            throw error;
        }
    },

    // Bulk delete products
    async bulkDeleteProducts(ids: string[]): Promise<void> {
        try {
            await Promise.all(ids.map(id => axios.delete(`/products/${id}`)));
        } catch (error) {
            console.error("Failed to bulk delete products:", error);
            throw error;
        }
    },

    // Bulk update product status
    async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
        try {
            await Promise.all(ids.map(id => axios.patch(`/products/${id}`, { status })));
        } catch (error) {
            console.error("Failed to bulk update status:", error);
            throw error;
        }
    },

    // Export products to CSV (client-side)
    async exportProducts(params?: GetProductsParams): Promise<void> {
        try {
            // Fetch all products for export
            const response = await this.getAllProducts({
                ...params,
                limit: 10000, // Get all products
            });

            // Convert to CSV
            const headers = ['ID', 'Title', 'Type', 'Status', 'Price', 'Currency', 'Rating', 'Reviews', 'Views', 'Inquiries', 'Sold Count', 'Created At'];
            const rows = response.products.map(p => [
                p._id,
                p.title,
                p.type,
                p.status,
                p.price,
                p.currency || 'USD',
                p.rating || 0,
                p.reviewCount || 0,
                p.viewCount || 0,
                p.inquiryCount || 0,
                p.soldCount || 0,
                new Date(p.createdAt).toLocaleDateString(),
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export products:", error);
            throw error;
        }
    },
};

export default productsService;
