import { apiClient } from "@/lib/api-client";

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "instructor" | "student";
    isActive: boolean;
    emailVerified: boolean;
    phone?: string;
    bio?: string;
    enrolledCourses?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: "admin" | "instructor" | "student";
    phone?: string;
    bio?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: "admin" | "instructor" | "student";
    phone?: string;
    bio?: string;
    isActive?: boolean;
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

    async getAllInstructors() {
        try {
            const { data } = await apiClient.get("/users/instructors");
            return data;
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
            throw error;
        }
    }
}

export const usersService = new UsersService();
export default usersService;
