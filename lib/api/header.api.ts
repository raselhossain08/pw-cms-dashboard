// src/lib/api/header.api.ts
import { apiClient } from './client';

export interface HeaderData {
    _id?: string;
    enabled: boolean;
    logo: {
        dark: string;
        light: string;
        alt: string;
    };
    cart: any;
    search: any;
    navigation: any;
    userMenu: any;
    notifications: any;
    theme: any;
    language: any;
    announcement: any;
    cta: any;
    topBar: any;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        ogImage?: string;
        ogType?: string;
        twitterCard?: string;
        canonicalUrl?: string;
        structuredData?: any;
    };
}

/**
 * Header CMS API Service for Dashboard
 */
export const headerCmsApi = {
    /**
     * Get active header configuration
     */
    getActiveHeader: async (): Promise<HeaderData> => {
        const response = await apiClient.get<HeaderData>('/header/active');
        return response.data;
    },

    /**
     * Update active header configuration
     */
    updateHeader: async (data: Partial<HeaderData>): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active', data);
        return response.data;
    },

    /**
     * Update logo section
     */
    updateLogo: async (logoData: HeaderData['logo']): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/logo', logoData);
        return response.data;
    },

    /**
     * Update topbar section
     */
    updateTopBar: async (topBarData: any): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/topbar', {
            topBar: topBarData,
        });
        return response.data;
    },

    /**
     * Update navigation section
     */
    updateNavigation: async (navigationData: any): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/navigation', {
            navigation: navigationData,
        });
        return response.data;
    },

    /**
     * Update cart section
     */
    updateCart: async (cartData: any): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/cart', cartData);
        return response.data;
    },

    /**
     * Update user menu section
     */
    updateUserMenu: async (userMenuData: any): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/user-menu', userMenuData);
        return response.data;
    },

    /**
     * Update SEO section
     */
    updateSEO: async (seoData: any): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/seo', {
            seo: seoData,
        });
        return response.data;
    },

    /**
     * Update menu order
     */
    updateMenuOrder: async (menuItems: { id: string; position: number }[]): Promise<HeaderData> => {
        const response = await apiClient.patch<HeaderData>('/header/active/menu-order', {
            menuItems,
        });
        return response.data;
    },
};

export default headerCmsApi;
