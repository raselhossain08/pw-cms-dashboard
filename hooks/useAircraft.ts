"use client";

import { useState, useEffect, useCallback } from "react";
import {
    aircraftService,
    Aircraft,
    AircraftFilters,
    CreateAircraftDto,
    UpdateAircraftDto,
    AircraftStatistics,
} from "@/services/aircraft.service";
import { useToast } from "@/context/ToastContext";

interface UseAircraftState {
    aircraft: Aircraft[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    statistics: AircraftStatistics | null;
}

interface UseAircraftActions {
    fetchAircraft: (filters?: AircraftFilters) => Promise<void>;
    createAircraft: (data: CreateAircraftDto) => Promise<Aircraft | null>;
    updateAircraft: (id: string, data: UpdateAircraftDto) => Promise<Aircraft | null>;
    deleteAircraft: (id: string) => Promise<boolean>;
    getAircraftById: (id: string) => Promise<Aircraft | null>;
    incrementViews: (id: string) => Promise<void>;
    incrementInquiries: (id: string) => Promise<void>;
    fetchStatistics: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useAircraft(initialFilters?: AircraftFilters) {
    const { push: showToast } = useToast();
    const [filters, setFilters] = useState<AircraftFilters>(initialFilters || {});

    const [state, setState] = useState<UseAircraftState>({
        aircraft: [],
        loading: true,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        },
        statistics: null,
    });

    const fetchAircraft = useCallback(
        async (newFilters?: AircraftFilters) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const filtersToUse = newFilters || filters;
                const response = await aircraftService.getAircraft(filtersToUse);
                setState((prev) => ({
                    ...prev,
                    aircraft: response.data,
                    pagination: response.pagination,
                    loading: false,
                }));
                if (newFilters) {
                    setFilters(filtersToUse);
                }
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || "Failed to fetch aircraft";
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                }));
                showToast({
                    type: "error",
                    message: errorMessage,
                });
            }
        },
        [filters, showToast]
    );

    const createAircraft = useCallback(
        async (data: CreateAircraftDto): Promise<Aircraft | null> => {
            const loadingToast = showToast({
                type: "loading",
                message: "Creating aircraft listing...",
            });
            try {
                const newAircraft = await aircraftService.createAircraft(data);
                showToast({
                    type: "success",
                    message: "Aircraft listing created successfully!",
                });
                // Refresh the list
                await fetchAircraft();
                return newAircraft;
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || "Failed to create aircraft";
                showToast({
                    type: "error",
                    message: errorMessage,
                });
                return null;
            }
        },
        [showToast, fetchAircraft]
    );

    const updateAircraft = useCallback(
        async (id: string, data: UpdateAircraftDto): Promise<Aircraft | null> => {
            const loadingToast = showToast({
                type: "loading",
                message: "Updating aircraft listing...",
            });
            try {
                const updatedAircraft = await aircraftService.updateAircraft(id, data);
                showToast({
                    type: "success",
                    message: "Aircraft listing updated successfully!",
                });
                // Update the local state
                setState((prev) => ({
                    ...prev,
                    aircraft: prev.aircraft.map((a) =>
                        a._id === id ? updatedAircraft : a
                    ),
                }));
                return updatedAircraft;
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || "Failed to update aircraft";
                showToast({
                    type: "error",
                    message: errorMessage,
                });
                return null;
            }
        },
        [showToast]
    );

    const deleteAircraft = useCallback(
        async (id: string): Promise<boolean> => {
            const loadingToast = showToast({
                type: "loading",
                message: "Deleting aircraft listing...",
            });
            try {
                await aircraftService.deleteAircraft(id);
                showToast({
                    type: "success",
                    message: "Aircraft listing deleted successfully!",
                });
                // Remove from local state
                setState((prev) => ({
                    ...prev,
                    aircraft: prev.aircraft.filter((a) => a._id !== id),
                    pagination: {
                        ...prev.pagination,
                        total: prev.pagination.total - 1,
                    },
                }));
                return true;
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || "Failed to delete aircraft";
                showToast({
                    type: "error",
                    message: errorMessage,
                });
                return false;
            }
        },
        [showToast]
    );

    const getAircraftById = useCallback(
        async (id: string): Promise<Aircraft | null> => {
            try {
                const aircraft = await aircraftService.getAircraftById(id);
                return aircraft;
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || "Failed to fetch aircraft details";
                showToast({
                    type: "error",
                    message: errorMessage,
                });
                return null;
            }
        },
        [showToast]
    );

    const incrementViews = useCallback(async (id: string) => {
        try {
            await aircraftService.incrementViews(id);
            // Update local state
            setState((prev) => ({
                ...prev,
                aircraft: prev.aircraft.map((a) =>
                    a._id === id ? { ...a, views: a.views + 1 } : a
                ),
            }));
        } catch (error) {
            // Silent fail for view tracking
            console.error("Failed to increment views:", error);
        }
    }, []);

    const incrementInquiries = useCallback(async (id: string) => {
        try {
            await aircraftService.incrementInquiries(id);
            // Update local state
            setState((prev) => ({
                ...prev,
                aircraft: prev.aircraft.map((a) =>
                    a._id === id ? { ...a, inquiries: a.inquiries + 1 } : a
                ),
            }));
            showToast({
                type: "success",
                message: "Inquiry sent successfully!",
            });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to send inquiry";
            showToast({
                type: "error",
                message: errorMessage,
            });
        }
    }, [showToast]);

    const fetchStatistics = useCallback(async () => {
        try {
            const stats = await aircraftService.getStatistics();
            setState((prev) => ({
                ...prev,
                statistics: stats,
            }));
        } catch (error: any) {
            console.error("Failed to fetch statistics:", error);
        }
    }, []);

    const refresh = useCallback(async () => {
        await Promise.all([fetchAircraft(), fetchStatistics()]);
    }, [fetchAircraft, fetchStatistics]);

    useEffect(() => {
        fetchAircraft();
        fetchStatistics();
    }, []);

    const actions: UseAircraftActions = {
        fetchAircraft,
        createAircraft,
        updateAircraft,
        deleteAircraft,
        getAircraftById,
        incrementViews,
        incrementInquiries,
        fetchStatistics,
        refresh,
    };

    return {
        ...state,
        ...actions,
        filters,
        setFilters,
    };
}
