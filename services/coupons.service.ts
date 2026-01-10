import { apiClient } from "@/lib/api-client";

export enum CouponType {
    PERCENTAGE = "percentage",
    FIXED = "fixed",
}

export enum CouponStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    SCHEDULED = "scheduled",
}

export interface Coupon {
    _id: string;
    code: string;
    type: CouponType;
    value: number;
    isActive: boolean;
    expiresAt?: string | null;
    maxUses: number;
    usedCount: number;
    minPurchaseAmount: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    expiresAt?: string | null;
    maxUses?: number;
    minPurchaseAmount?: number;
    isActive?: boolean;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

export interface CouponsResponse {
    data: Coupon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CouponAnalytics {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    scheduled: number;
    totalUses: number;
    totalRevenueSaved: number;
    mostUsed: Coupon[];
    recentCoupons: Coupon[];
}

class CouponsService {
    async getAllCoupons(page: number = 1, limit: number = 100, search?: string) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) {
                params.append('search', search);
            }
            const { data } = await apiClient.get<CouponsResponse>(`/coupons?${params.toString()}`);
            return data;
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
            throw error;
        }
    }

    async getCouponsAnalytics() {
        try {
            const { data } = await apiClient.get<CouponAnalytics>("/coupons/analytics");
            return data;
        } catch (error) {
            console.error("Failed to fetch coupon analytics:", error);
            throw error;
        }
    }

    async getCouponById(id: string) {
        try {
            const { data } = await apiClient.get<Coupon>(`/coupons/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch coupon ${id}:`, error);
            throw error;
        }
    }

    async createCoupon(couponData: CreateCouponDto) {
        try {
            const { data } = await apiClient.post<Coupon>("/coupons", couponData);
            return data;
        } catch (error) {
            console.error("Failed to create coupon:", error);
            throw error;
        }
    }

    async updateCoupon(id: string, couponData: UpdateCouponDto) {
        try {
            const { data } = await apiClient.put<Coupon>(`/coupons/${id}`, couponData);
            return data;
        } catch (error) {
            console.error(`Failed to update coupon ${id}:`, error);
            throw error;
        }
    }

    async toggleCouponStatus(id: string) {
        try {
            const { data } = await apiClient.patch<Coupon>(`/coupons/${id}/toggle-status`);
            return data;
        } catch (error) {
            console.error(`Failed to toggle coupon status ${id}:`, error);
            throw error;
        }
    }

    async deleteCoupon(id: string) {
        try {
            const { data } = await apiClient.delete<{ message: string }>(`/coupons/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to delete coupon ${id}:`, error);
            throw error;
        }
    }

    async validateCoupon(code: string, amount: number) {
        try {
            const { data } = await apiClient.post<{ valid: boolean; discount: number; coupon?: Coupon }>("/coupons/validate", { code, amount });
            return data;
        } catch (error) {
            console.error("Failed to validate coupon:", error);
            throw error;
        }
    }

    async bulkDeleteCoupons(ids: string[]) {
        try {
            const { data } = await apiClient.post<{ deletedCount: number; message: string }>("/coupons/bulk/delete", { ids });
            return data;
        } catch (error) {
            console.error("Failed to bulk delete coupons:", error);
            throw error;
        }
    }

    async bulkToggleStatus(ids: string[]) {
        try {
            const { data } = await apiClient.post<{ updatedCount: number; message: string }>("/coupons/bulk/toggle-status", { ids });
            return data;
        } catch (error) {
            console.error("Failed to bulk toggle coupon status:", error);
            throw error;
        }
    }
}

export const couponsService = new CouponsService();
