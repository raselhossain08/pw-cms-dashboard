import { useState, useEffect, useCallback } from "react";
import { productsService, GetProductsParams } from "@/lib/services/products.service";
import type { Product, ProductFormData } from "@/lib/types/product";
import { useToast } from "@/context/ToastContext";

interface UseProductsResult {
    products: Product[];
    loading: boolean;
    error: string | null;
    fetchProducts: (params?: GetProductsParams) => Promise<void>;
    createProduct: (data: ProductFormData) => Promise<Product | null>;
    updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product | null>;
    deleteProduct: (id: string) => Promise<boolean>;
    getProductById: (id: string) => Promise<Product | null>;
    refreshProducts: () => Promise<void>;
    totalProducts: number;
}

export function useProducts(initialParams?: GetProductsParams): UseProductsResult {
    const { push } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalProducts, setTotalProducts] = useState<number>(0);

    const fetchProducts = useCallback(async (params?: GetProductsParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsService.getAllProducts({
                limit: 100,
                ...params
            });
            setProducts(response.products || []);
            setTotalProducts(response.total || 0);
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
    }, [push]);

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

    const refreshProducts = useCallback(async () => {
        await fetchProducts(initialParams);
    }, [fetchProducts, initialParams]);

    // Initial fetch
    useEffect(() => {
        fetchProducts(initialParams);
    }, [fetchProducts, initialParams]);

    return {
        products,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        refreshProducts,
        totalProducts,
    };
}
