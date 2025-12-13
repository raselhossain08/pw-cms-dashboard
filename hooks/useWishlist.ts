import { useState, useEffect, useCallback } from "react";
import { wishlistService, WishlistResponse } from "@/services/wishlist.service";
import { Course } from "@/services/courses.service";
import { useToast } from "@/context/ToastContext";

interface UseWishlistResult {
    wishlist: WishlistResponse | null;
    courses: Course[];
    loading: boolean;
    error: string | null;
    fetchWishlist: () => Promise<void>;
    addToWishlist: (courseId: string) => Promise<boolean>;
    removeFromWishlist: (courseId: string) => Promise<boolean>;
    toggleWishlist: (courseId: string) => Promise<boolean>;
    isInWishlist: (courseId: string) => boolean;
    refreshWishlist: () => Promise<void>;
}

export function useWishlist(): UseWishlistResult {
    const { push } = useToast();
    const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await wishlistService.getWishlist();
            if (response.success && response.data) {
                setWishlist(response.data);
            } else {
                const errorMessage = response.error || "Failed to fetch wishlist";
                setError(errorMessage);
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || err?.message || "Failed to fetch wishlist";
            setError(errorMessage);
            push({
                message: errorMessage,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [push]);

    const addToWishlist = useCallback(
        async (courseId: string): Promise<boolean> => {
            setLoading(true);
            try {
                const response = await wishlistService.addToWishlist(courseId);
                if (response.success && response.data) {
                    setWishlist(response.data);
                    push({
                        message: "Course added to wishlist!",
                        type: "success",
                    });
                    return true;
                } else {
                    const errorMessage = response.error || "Failed to add to wishlist";
                    push({
                        message: errorMessage,
                        type: "error",
                    });
                    return false;
                }
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to add to wishlist";
                push({
                    message: errorMessage,
                    type: "error",
                });
                return false;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const removeFromWishlist = useCallback(
        async (courseId: string): Promise<boolean> => {
            setLoading(true);
            try {
                const response = await wishlistService.removeFromWishlist(courseId);
                if (response.success && response.data) {
                    setWishlist(response.data);
                    push({
                        message: "Course removed from wishlist!",
                        type: "success",
                    });
                    return true;
                } else {
                    const errorMessage = response.error || "Failed to remove from wishlist";
                    push({
                        message: errorMessage,
                        type: "error",
                    });
                    return false;
                }
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to remove from wishlist";
                push({
                    message: errorMessage,
                    type: "error",
                });
                return false;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const toggleWishlist = useCallback(
        async (courseId: string): Promise<boolean> => {
            const isCurrentlyInWishlist = wishlist?.courses.some(
                (course) => course._id === courseId || course.id === courseId
            );

            if (isCurrentlyInWishlist) {
                return await removeFromWishlist(courseId);
            } else {
                return await addToWishlist(courseId);
            }
        },
        [wishlist, addToWishlist, removeFromWishlist]
    );

    const isInWishlist = useCallback(
        (courseId: string): boolean => {
            if (!wishlist) return false;
            return wishlist.courses.some(
                (course) => course._id === courseId || course.id === courseId
            );
        },
        [wishlist]
    );

    const refreshWishlist = useCallback(async () => {
        await fetchWishlist();
    }, [fetchWishlist]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    return {
        wishlist,
        courses: wishlist?.courses || [],
        loading,
        error,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
    };
}
