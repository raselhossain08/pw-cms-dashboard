"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/context/ToastContext";

interface SystemConfig {
    _id: string;
    key: string;
    value: string;
    category: string;
    label: string;
    description?: string;
    isSecret: boolean;
    isRequired: boolean;
    placeholder?: string;
    metadata?: Record<string, any>;
    isActive: boolean;
}

interface GroupedConfigs {
    [category: string]: SystemConfig[];
}

export function useSystemSettings() {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [groupedConfigs, setGroupedConfigs] = useState<GroupedConfigs>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { push } = useToast();

    const fetchAllConfigs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<SystemConfig[]>("/system-config");
            setConfigs(response.data as SystemConfig[]);
            return response.data;
        } catch (error: any) {
            push({
                message: error?.message || "Failed to fetch settings",
                type: "error",
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [push]);

    const fetchGroupedConfigs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<GroupedConfigs>("/system-config/grouped");
            setGroupedConfigs(response.data as GroupedConfigs);
            return response.data;
        } catch (error: any) {
            push({
                message: error?.message || "Failed to fetch grouped settings",
                type: "error",
            });
            return {};
        } finally {
            setIsLoading(false);
        }
    }, [push]);

    const fetchByCategory = useCallback(
        async (category: string) => {
            setIsLoading(true);
            try {
                const response = await apiClient.get<SystemConfig[]>(
                    `/system-config?category=${category}`
                );
                return response.data;
            } catch (error: any) {
                push({
                    message: error?.message || "Failed to fetch category settings",
                    type: "error",
                });
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [push]
    );

    const updateConfig = useCallback(
        async (key: string, value: string) => {
            try {
                const response = await apiClient.put(`/system-config/${key}`, {
                    value,
                });
                push({ message: "Setting updated successfully", type: "success" });
                return response.data;
            } catch (error: any) {
                push({
                    message: error?.message || "Failed to update setting",
                    type: "error",
                });
                throw error;
            }
        },
        [push]
    );

    const bulkUpdateConfigs = useCallback(
        async (updates: { key: string; value: string }[]) => {
            setIsSaving(true);
            try {
                const response = await apiClient.put("/system-config/bulk/update", updates);
                push({ message: "Settings saved successfully", type: "success" });
                await fetchAllConfigs();
                return response.data;
            } catch (error: any) {
                push({
                    message: error?.message || "Failed to save settings",
                    type: "error",
                });
                throw error;
            } finally {
                setIsSaving(false);
            }
        },
        [push, fetchAllConfigs]
    );

    const createConfig = useCallback(
        async (configData: Partial<SystemConfig>) => {
            try {
                const response = await apiClient.post("/system-config", configData);
                push({ message: "Setting created successfully", type: "success" });
                await fetchAllConfigs();
                return response.data;
            } catch (error: any) {
                push({
                    message: error?.message || "Failed to create setting",
                    type: "error",
                });
                throw error;
            }
        },
        [push, fetchAllConfigs]
    );

    const deleteConfig = useCallback(
        async (key: string) => {
            try {
                await apiClient.delete(`/system-config/${key}`);
                push({ message: "Setting deleted successfully", type: "success" });
                await fetchAllConfigs();
            } catch (error: any) {
                push({
                    message: error?.message || "Failed to delete setting",
                    type: "error",
                });
                throw error;
            }
        },
        [push, fetchAllConfigs]
    );

    const testConnection = useCallback(
        async (key: string) => {
            try {
                const response = await apiClient.post(`/system-config/${key}/test`);
                push({
                    message: (response.data as any)?.message || "Connection test successful",
                    type: "success",
                });
                return response.data;
            } catch (error: any) {
                push({
                    message: error?.message || "Connection test failed",
                    type: "error",
                });
                throw error;
            }
        },
        [push]
    ); return {
        configs,
        groupedConfigs,
        isLoading,
        isSaving,
        fetchAllConfigs,
        fetchGroupedConfigs,
        fetchByCategory,
        updateConfig,
        bulkUpdateConfigs,
        createConfig,
        deleteConfig,
        testConnection,
    };
}
