import { apiFetch } from "@/lib/api-client";
import { Course } from "./courses.service";

export interface WishlistItem {
    _id: string;
    user: string;
    courses: Course[];
    createdAt?: string;
    updatedAt?: string;
}

export interface WishlistResponse {
    _id: string;
    user: string;
    courses: Course[];
    createdAt?: string;
    updatedAt?: string;
}

class WishlistService {
    /**
     * Get user's wishlist with populated course data
     */
    async getWishlist() {
        return apiFetch<WishlistResponse>("/wishlist", {
            method: "GET",
        });
    }

    /**
     * Add a course to wishlist
     */
    async addToWishlist(courseId: string) {
        return apiFetch<WishlistResponse>(`/wishlist/${courseId}`, {
            method: "POST",
        });
    }

    /**
     * Remove a course from wishlist
     */
    async removeFromWishlist(courseId: string) {
        return apiFetch<WishlistResponse>(`/wishlist/${courseId}`, {
            method: "DELETE",
        });
    }

    /**
     * Check if a course is in the wishlist
     */
    async isInWishlist(courseId: string, wishlistCourses: Course[]): Promise<boolean> {
        return wishlistCourses.some(
            (course) => course._id === courseId || course.id === courseId
        );
    }

    /**
     * Toggle wishlist status for a course
     */
    async toggleWishlist(courseId: string, isCurrentlyInWishlist: boolean) {
        if (isCurrentlyInWishlist) {
            return this.removeFromWishlist(courseId);
        } else {
            return this.addToWishlist(courseId);
        }
    }
}

export const wishlistService = new WishlistService();
