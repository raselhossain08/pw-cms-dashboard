import { useState, useEffect, useCallback } from "react";
import { couponsService, Coupon, CreateCouponDto, UpdateCouponDto, CouponsResponse, CouponAnalytics } from "@/services/coupons.service";
import { useToast } from "@/context/ToastContext";

interface UseCouponsResult {
    coupons: Coupon[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
    analytics: CouponAnalytics | null;
    analyticsLoading: boolean;
    fetchCoupons: (page?: number, limit?: number, search?: string) => Promise<void>;
    createCoupon: (data: CreateCouponDto) => Promise<Coupon | null>;
    updateCoupon: (id: string, data: UpdateCouponDto) => Promise<Coupon | null>;
    deleteCoupon: (id: string) => Promise<boolean>;
    toggleCouponStatus: (id: string) => Promise<Coupon | null>;
    duplicateCoupon: (id: string) => Promise<Coupon | null>;
    getCouponById: (id: string) => Promise<Coupon | null>;
    refreshCoupons: () => Promise<void>;
    bulkDeleteCoupons: (ids: string[]) => Promise<boolean>;
    bulkToggleStatus: (ids: string[]) => Promise<boolean>;
    fetchAnalytics: () => Promise<void>;
}

export function useCoupons(): UseCouponsResult {
    const { push } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<UseCouponsResult['pagination']>(null);
    const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

    const fetchCoupons = useCallback(async (page: number = 1, limit: number = 100, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await couponsService.getAllCoupons(page, limit, search);
            setCoupons(response.data);
            setPagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                totalPages: response.totalPages,
            });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch coupons";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [push]);

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const data = await couponsService.getCouponsAnalytics();
            setAnalytics(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch analytics";
            push({
                message: errorMessage,
                type: "error",
            });
        } finally {
            setAnalyticsLoading(false);
        }
    }, [push]);

    const createCoupon = useCallback(async (data: CreateCouponDto): Promise<Coupon | null> => {
        setLoading(true);
        try {
            const newCoupon = await couponsService.createCoupon(data);
            setCoupons((prev) => [newCoupon, ...prev]);
            push({
                message: "Coupon created successfully!",
                type: "success",
            });
            return newCoupon;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to create coupon";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const updateCoupon = useCallback(async (id: string, data: UpdateCouponDto): Promise<Coupon | null> => {
        setLoading(true);
        try {
            const updatedCoupon = await couponsService.updateCoupon(id, data);
            setCoupons((prev) => prev.map((c) => (c._id === id ? updatedCoupon : c)));
            push({
                message: "Coupon updated successfully!",
                type: "success",
            });
            return updatedCoupon;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update coupon";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const deleteCoupon = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        try {
            await couponsService.deleteCoupon(id);
            setCoupons((prev) => prev.filter((c) => c._id !== id));
            push({
                message: "Coupon deleted successfully!",
                type: "success",
            });
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete coupon";
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const toggleCouponStatus = useCallback(async (id: string): Promise<Coupon | null> => {
        setLoading(true);
        try {
            const updatedCoupon = await couponsService.toggleCouponStatus(id);
            setCoupons((prev) => prev.map((c) => (c._id === id ? updatedCoupon : c)));
            push({
                message: `Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'} successfully!`,
                type: "success",
            });
            return updatedCoupon;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to toggle coupon status";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const duplicateCoupon = useCallback(async (id: string): Promise<Coupon | null> => {
        setLoading(true);
        try {
            const originalCoupon = await couponsService.getCouponById(id);
            const duplicateData: CreateCouponDto = {
                code: `${originalCoupon.code}_COPY`,
                type: originalCoupon.type,
                value: originalCoupon.value,
                expiresAt: originalCoupon.expiresAt,
                maxUses: originalCoupon.maxUses,
                minPurchaseAmount: originalCoupon.minPurchaseAmount,
                isActive: false,
            };
            const newCoupon = await couponsService.createCoupon(duplicateData);
            setCoupons((prev) => [newCoupon, ...prev]);
            push({
                message: "Coupon duplicated successfully!",
                type: "success",
            });
            return newCoupon;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to duplicate coupon";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const getCouponById = useCallback(async (id: string): Promise<Coupon | null> => {
        try {
            const coupon = await couponsService.getCouponById(id);
            return coupon;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch coupon";
            push({
                message: errorMessage,
                type: "error",
            });
            return null;
        }
    }, [push]);

    const refreshCoupons = useCallback(async () => {
        await fetchCoupons();
    }, [fetchCoupons]);

    const bulkDeleteCoupons = useCallback(async (ids: string[]): Promise<boolean> => {
        setLoading(true);
        try {
            const result = await couponsService.bulkDeleteCoupons(ids);
            setCoupons((prev) => prev.filter((c) => !ids.includes(c._id)));
            push({
                message: result.message,
                type: "success",
            });
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete coupons";
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [push]);

    const bulkToggleStatus = useCallback(async (ids: string[]): Promise<boolean> => {
        setLoading(true);
        try {
            const result = await couponsService.bulkToggleStatus(ids);
            // Refresh coupons to get updated status
            await fetchCoupons();
            push({
                message: result.message,
                type: "success",
            });
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to toggle coupon status";
            push({
                message: errorMessage,
                type: "error",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [push, fetchCoupons]);

    useEffect(() => {
        fetchCoupons();
        fetchAnalytics();
    }, [fetchCoupons, fetchAnalytics]);

    return {
        coupons,
        loading,
        error,
        pagination,
        analytics,
        analyticsLoading,
        fetchCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        duplicateCoupon,
        getCouponById,
        refreshCoupons,
        bulkDeleteCoupons,
        bulkToggleStatus,
        fetchAnalytics,
    };
}
