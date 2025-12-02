import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalCourses: number;
    revenueGrowth: number;
    ordersGrowth: number;
    usersGrowth: number;
    coursesGrowth: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopCourse {
    _id: string;
    title: string;
    enrollments: number;
    revenue: number;
}

export interface TopProduct {
    _id: string;
    name: string;
    sales: number;
    revenue: number;
}

class AnalyticsService {
    async getDashboardStats(params: { startDate?: string; endDate?: string } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/dashboard-stats", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            throw error;
        }
    }

    async getRevenueData(params: { period?: "7days" | "30days" | "90days" | "year" } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/revenue", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch revenue data:", error);
            throw error;
        }
    }

    async getTopCourses(params: { limit?: number } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/top-courses", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch top courses:", error);
            throw error;
        }
    }

    async getTopProducts(params: { limit?: number } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/top-products", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch top products:", error);
            throw error;
        }
    }

    async getUserGrowth(params: { period?: "7days" | "30days" | "90days" | "year" } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/user-growth", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch user growth:", error);
            throw error;
        }
    }

    async getCourseEnrollments(params: { period?: "7days" | "30days" | "90days" | "year" } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/course-enrollments", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch course enrollments:", error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
