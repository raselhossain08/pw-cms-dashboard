import { useState, useEffect, useCallback } from "react";
import { productsService, GetProductsParams } from "@/lib/services/products.service";
import type { Product, ProductFormData } from "@/lib/types/product";
import { useToast } from "@/context/ToastContext";

interface ProductStats {
    totalProducts: number;
    publishedProducts: number;
    totalAircraft: number;
    totalSold: number;
    totalRevenue: number;
    averagePrice: number;
}

interface UseProductsResult {
    products: Product[];
    loading: boolean;
    error: string | null;
    stats: ProductStats | null;
    statsLoading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    fetchProducts: (params?: GetProductsParams) => Promise<void>;
    createProduct: (data: ProductFormData) => Promise<Product | null>;
    updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product | null>;
    deleteProduct: (id: string) => Promise<boolean>;
    bulkDeleteProducts: (ids: string[]) => Promise<boolean>;
    bulkUpdateStatus: (ids: string[], status: string) => Promise<boolean>;
    getProductById: (id: string) => Promise<Product | null>;
    refreshProducts: () => Promise<void>;
    fetchStats: () => Promise<void>;
    exportProducts: (params?: GetProductsParams) => Promise<void>;
    totalProducts: number;
}

export function useProducts(initialParams?: GetProductsParams): UseProductsResult {
    const { push } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [stats, setStats] = useState<ProductStats | null>(null);
    const [statsLoading, setStatsLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState({
        page: initialParams?.page || 1,
        limit: initialParams?.limit || 10,
        total: 0,
        totalPages: 0,
    });

    const fetchProducts = useCallback(async (params?: GetProductsParams) => {
        setLoading(true);
        setError(null);
        try {
            const fetchParams = {
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                ...params
            };
            const response = await productsService.getAllProducts(fetchParams);
            setProducts(response.products || []);
            setTotalProducts(response.total || 0);
            const totalPages = Math.ceil((response.total || 0) / (fetchParams.limit || 10));
            setPagination({
                page: fetchParams.page || 1,
                limit: fetchParams.limit || 10,
                total: response.total || 0,
                totalPages,
            });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch products";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [push, pagination.page, pagination.limit]);

    const createProduct = useCallback(async (data: ProductFormData): Promise<Product | null> => {
        setLoading(true);
        try {
            const newProduct = await productsService.createProduct(data);
            setProducts((prev) => [newProduct, ...prev]);
            setTotalProducts((prev) => prev + 1);
            push({
                message: "Product created successfully!",
                type: "success",
            });
            return newProduct;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to create product";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const updateProduct = useCallback(async (id: string, data: Partial<ProductFormData>): Promise<Product | null> => {
        setLoading(true);
        try {
            const updatedProduct = await productsService.updateProduct(id, data);
            setProducts((prev) => prev.map((p) => (p._id === id ? updatedProduct : p)));
            push({
                message: "Product updated successfully!",
                type: "success",
            });
            return updatedProduct;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update product";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        try {
            await productsService.deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
            setTotalProducts((prev) => prev - 1);
            push({
                message: "Product deleted successfully!",
                type: "success",
            });
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete product";
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const getProductById = useCallback(async (id: string): Promise<Product | null> => {
        try {
            const product = await productsService.getProductById(id);
            return product;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch product";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        }
    }, [push]);

    const bulkDeleteProducts = useCallback(async (ids: string[]): Promise<boolean> => {
        setLoading(true);
        try {
            await productsService.bulkDeleteProducts(ids);
            setProducts((prev) => prev.filter((p) => !ids.includes(p._id)));
            setTotalProducts((prev) => prev - ids.length);
            push({
                message: `${ids.length} product(s) deleted successfully!`,
                type: "success",
            });
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete products";
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const bulkUpdateStatus = useCallback(async (ids: string[], status: string): Promise<boolean> => {
        setLoading(true);
        try {
            await productsService.bulkUpdateStatus(ids, status);
            setProducts((prev) => prev.map((p) => ids.includes(p._id) ? { ...p, status: status as any } : p));
            push({
                message: `${ids.length} product(s) status updated successfully!`,
                type: "success",
            });
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update product status";
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const statsData = await productsService.getProductStats();
            setStats(statsData);
        } catch (err: any) {
            console.error("Failed to fetch product stats:", err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const exportProducts = useCallback(async (params?: GetProductsParams) => {
        try {
            await productsService.exportProducts(params);
            push({
                message: "Products exported successfully!",
                type: "success",
            });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to export products";
            push({
                message: errorMessage,
                type: "error",
            });
        }
    }, [push]);

    const refreshProducts = useCallback(async () => {
        await fetchProducts(initialParams);
    }, [fetchProducts, initialParams]);

    // Initial fetch
    useEffect(() => {
        fetchProducts(initialParams);
        fetchStats();
    }, [fetchProducts, fetchStats, initialParams]);

    return {
        products,
        loading,
        error,
        stats,
        statsLoading,
        pagination,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        bulkDeleteProducts,
        bulkUpdateStatus,
        getProductById,
        refreshProducts,
        fetchStats,
        exportProducts,
        totalProducts,
    };
}
