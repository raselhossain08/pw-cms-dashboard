"use client";

import { useState, useEffect } from "react";
import { usersService, User, CreateUserDto, UpdateUserDto } from "@/services/users.service";
import { useToast } from "@/context/ToastContext";

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  students: number;
  instructors: number;
  recentUsers: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const { push } = useToast();

  // Fetch all users with filters
  const fetchUsers = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}) => {
    setLoading(true);
    try {
      const data = await usersService.getAllUsers(params) as UsersResponse;
      setUsers(data.users);
      setTotal(data.total);
      return data;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to fetch users",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await usersService.getUserStats() as UserStats;
      setStats(data);
      return data;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to fetch stats",
      });
      throw error;
    } finally {
      setStatsLoading(false);
    }
  };

  // Create user
  const createUser = async (userData: CreateUserDto) => {
    setLoading(true);
    try {
      const newUser = await usersService.createUser(userData) as User;
      setUsers((prev) => [newUser, ...prev]);
      setTotal((prev) => prev + 1);
      push({
        type: "success",
        message: `User ${userData.name} created successfully`,
      });
      return newUser;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to create user",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (id: string, userData: UpdateUserDto) => {
    setLoading(true);
    try {
      const updatedUser = await usersService.updateUser(id, userData) as User;
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? updatedUser : user))
      );
      push({
        type: "success",
        message: "User updated successfully",
      });
      return updatedUser;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to update user",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    setLoading(true);
    try {
      await usersService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      setTotal((prev) => prev - 1);
      push({
        type: "success",
        message: "User deleted successfully",
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to delete user",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Activate user
  const activateUser = async (id: string) => {
    setLoading(true);
    try {
      const updatedUser = await usersService.activateUser(id) as User;
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? updatedUser : user))
      );
      push({
        type: "success",
        message: "User activated successfully",
      });
      return updatedUser;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to activate user",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deactivate user
  const deactivateUser = async (id: string) => {
    setLoading(true);
    try {
      const updatedUser = await usersService.deactivateUser(id) as User;
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? updatedUser : user))
      );
      push({
        type: "success",
        message: "User deactivated successfully",
      });
      return updatedUser;
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to deactivate user",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete users
  const bulkDeleteUsers = async (ids: string[]) => {
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => usersService.deleteUser(id)));
      setUsers((prev) => prev.filter((user) => !ids.includes(user._id)));
      setTotal((prev) => prev - ids.length);
      push({
        type: "success",
        message: `${ids.length} users deleted successfully`,
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to delete users",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Export users (returns CSV data)
  const exportUsers = async () => {
    try {
      push({
        type: "info",
        message: "Preparing export...",
      });

      // Fetch all users without pagination
      const data = await usersService.getAllUsers({ limit: 10000 }) as UsersResponse;

      // Convert to CSV
      const headers = ["ID", "Name", "Email", "Role", "Status", "Created At"];
      const rows = data.users.map((user) => [
        user._id,
        user.name,
        user.email,
        user.role,
        user.isActive ? "Active" : "Inactive",
        new Date(user.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      push({
        type: "success",
        message: "Users exported successfully",
      });
    } catch (error: any) {
      push({
        type: "error",
        message: error.response?.data?.message || "Failed to export users",
      });
      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  return {
    users,
    stats,
    loading,
    statsLoading,
    total,
    fetchUsers,
    fetchStats,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    bulkDeleteUsers,
    exportUsers,
  };
}
