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
    expiresAt?: string;
    maxUses: number;
    usedCount: number;
    minPurchaseAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    expiresAt?: string;
    maxUses?: number;
    minPurchaseAmount?: number;
    isActive?: boolean;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

class CouponsService {
    async getAllCoupons() {
        try {
            const { data } = await apiClient.get<Coupon[]>("/coupons");
            return data;
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
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
}

export const couponsService = new CouponsService();
