import { useState, useEffect, useCallback } from "react";
import { productCategoriesService, ProductCategory, CreateProductCategoryDto, UpdateProductCategoryDto, GetProductCategoriesParams } from "@/services/product-categories.service";
import { useToast } from "@/context/ToastContext";

interface BulkOperationResult {
    updated?: number;
    deleted?: number;
    errors?: string[];
}

interface UseProductCategoriesResult {
    categories: ProductCategory[];
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    totalPages: number;
    fetchCategories: (params?: GetProductCategoriesParams) => Promise<void>;
    createCategory: (data: CreateProductCategoryDto) => Promise<ProductCategory | null>;
    updateCategory: (id: string, data: UpdateProductCategoryDto) => Promise<ProductCategory | null>;
    deleteCategory: (id: string) => Promise<boolean>;
    getCategoryById: (id: string) => Promise<ProductCategory | null>;
    refreshCategories: () => Promise<void>;
    bulkUpdateStatus: (ids: string[], status: "active" | "inactive") => Promise<BulkOperationResult | null>;
    bulkDelete: (ids: string[]) => Promise<BulkOperationResult | null>;
}

export function useProductCategories(initialParams?: GetProductCategoriesParams): UseProductCategoriesResult {
    const { push } = useToast();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentParams, setCurrentParams] = useState<GetProductCategoriesParams | undefined>(initialParams);

    const fetchCategories = useCallback(async (params?: GetProductCategoriesParams) => {
        setLoading(true);
        setError(null);
        try {
            const result = await productCategoriesService.getAllCategories(params);
            setCategories(result.data.categories);
            setTotal(result.data.total);
            setPage(result.data.page);
            setTotalPages(result.data.totalPages);
            setCurrentParams(params);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch categories";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (data: CreateProductCategoryDto): Promise<ProductCategory | null> => {
        setLoading(true);
        setError(null);
        try {
            const newCategory = await productCategoriesService.createCategory(data);
            push({
                message: "Category created successfully",
                type: "success",
            });
            await fetchCategories(currentParams);
            return newCategory;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to create category";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCategories]);

    const updateCategory = useCallback(async (id: string, data: UpdateProductCategoryDto): Promise<ProductCategory | null> => {
        setLoading(true);
        setError(null);
        try {
            const updatedCategory = await productCategoriesService.updateCategory(id, data);
            push({
                message: "Category updated successfully",
                type: "success",
            });
            await fetchCategories(currentParams);
            return updatedCategory;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update category";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCategories]);

    const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await productCategoriesService.deleteCategory(id);
            push({
                message: "Category deleted successfully",
                type: "success",
            });
            await fetchCategories(currentParams);
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete category";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCategories]);

    const getCategoryById = useCallback(async (id: string): Promise<ProductCategory | null> => {
        setLoading(true);
        setError(null);
        try {
            const category = await productCategoriesService.getCategoryById(id);
            return category;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch category";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCategories = useCallback(async () => {
        await fetchCategories(currentParams);
    }, [currentParams, fetchCategories]);

    const bulkUpdateStatus = useCallback(async (ids: string[], status: "active" | "inactive"): Promise<BulkOperationResult | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await productCategoriesService.bulkUpdateStatus(ids, status);
            push({
                message: `${result.updated} categories updated successfully`,
                type: "success",
            });
            await fetchCategories(currentParams);
            return result;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update categories";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCategories, push]);

    const bulkDelete = useCallback(async (ids: string[]): Promise<BulkOperationResult | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await productCategoriesService.bulkDelete(ids);
            push({
                message: `${result.deleted} categories deleted successfully${result.errors && result.errors.length > 0 ? `. ${result.errors.length} failed.` : ""}`,
                type: result.errors && result.errors.length > 0 ? "info" : "success",
            });
            await fetchCategories(currentParams);
            return result;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete categories";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCategories, push]);

    useEffect(() => {
        fetchCategories(initialParams);
    }, []);

    return {
        categories,
        loading,
        error,
        total,
        page,
        totalPages,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        refreshCategories,
        bulkUpdateStatus,
        bulkDelete,
    };
}
