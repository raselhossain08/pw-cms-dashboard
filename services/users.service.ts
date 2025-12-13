import { apiClient } from "@/lib/api-client";

export interface User {
    _id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: "super_admin" | "admin" | "instructor" | "student" | "affiliate";
    status: "active" | "inactive" | "suspended" | "pending";
    isActive: boolean;
    emailVerified: boolean;
    phone?: string;
    bio?: string;
    enrolledCourses?: number;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: "super_admin" | "admin" | "instructor" | "student" | "affiliate";
    status?: "active" | "inactive" | "suspended" | "pending";
    phone?: string;
    bio?: string;
    avatar?: string;
}

export interface UpdateUserDto {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: "super_admin" | "admin" | "instructor" | "student" | "affiliate";
    status?: "active" | "inactive" | "suspended" | "pending";
    phone?: string;
    bio?: string;
    isActive?: boolean;
    avatar?: string;
}

class UsersService {
    async getAllUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        isActive?: boolean;
    } = {}) {
        try {
            const { data } = await apiClient.get("/users", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch users:", error);
            throw error;
        }
    }

    async getUserById(id: string) {
        try {
            const { data } = await apiClient.get(`/users/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch user ${id}:`, error);
            throw error;
        }
    }

    async createUser(userData: CreateUserDto) {
        try {
            const { data } = await apiClient.post("/users", userData);
            return data;
        } catch (error) {
            console.error("Failed to create user:", error);
            throw error;
        }
    }

    async updateUser(id: string, userData: UpdateUserDto) {
        try {
            const { data } = await apiClient.put(`/users/${id}`, userData);
            return data;
        } catch (error) {
            console.error(`Failed to update user ${id}:`, error);
            throw error;
        }
    }

    async deleteUser(id: string) {
        try {
            await apiClient.delete(`/users/${id}`);
        } catch (error) {
            console.error(`Failed to delete user ${id}:`, error);
            throw error;
        }
    }

    async activateUser(id: string) {
        try {
            const { data } = await apiClient.patch(`/users/${id}/activate`);
            return data;
        } catch (error) {
            console.error(`Failed to activate user ${id}:`, error);
            throw error;
        }
    }

    async deactivateUser(id: string) {
        try {
            const { data } = await apiClient.patch(`/users/${id}/deactivate`);
            return data;
        } catch (error) {
            console.error(`Failed to deactivate user ${id}:`, error);
            throw error;
        }
    }

    async getUserStats() {
        try {
            const { data } = await apiClient.get("/users/stats");
            return data;
        } catch (error) {
            console.error("Failed to fetch user stats:", error);
            throw error;
        }
    }

    async getAllInstructors(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        specialization?: string;
        experience?: string;
    }) {
        try {
            const { data } = await apiClient.get("/users/instructors", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
            throw error;
        }
    }

    async updateStatus(id: string, status: "active" | "inactive" | "suspended" | "pending") {
        try {
            const { data } = await apiClient.patch(`/users/${id}/status`, { status });
            return data;
        } catch (error) {
            console.error(`Failed to update user status ${id}:`, error);
            throw error;
        }
    }

    async approveInstructor(id: string) {
        try {
            const { data } = await apiClient.post(`/admin/instructors/${id}/approve`);
            return data;
        } catch (error) {
            console.error(`Failed to approve instructor ${id}:`, error);
            throw error;
        }
    }

    async rejectInstructor(id: string, reason: string) {
        try {
            const { data } = await apiClient.post(`/admin/instructors/${id}/reject`, { reason });
            return data;
        } catch (error) {
            console.error(`Failed to reject instructor ${id}:`, error);
            throw error;
        }
    }

    async getInstructorById(id: string) {
        try {
            const { data } = await apiClient.get(`/users/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch instructor ${id}:`, error);
            throw error;
        }
    }

    async updateInstructor(id: string, userData: UpdateUserDto) {
        try {
            const { data } = await apiClient.patch(`/users/${id}`, userData);
            return data;
        } catch (error) {
            console.error(`Failed to update instructor ${id}:`, error);
            throw error;
        }
    }

    async deleteInstructor(id: string) {
        try {
            await apiClient.delete(`/users/${id}`);
        } catch (error) {
            console.error(`Failed to delete instructor ${id}:`, error);
            throw error;
        }
    }

    async verifyEmail(id: string) {
        try {
            const { data } = await apiClient.post(`/users/${id}/verify-email`);
            return data;
        } catch (error) {
            console.error(`Failed to verify email for user ${id}:`, error);
            throw error;
        }
    }
}

export const usersService = new UsersService();
export default usersService;
