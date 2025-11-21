// src/lib/api/header-service.ts
import { apiClient } from './client';
import type { Header, UpdateHeaderDto } from '@/types/header';

export class HeaderService {
    /**
     * Get the active header (singleton)
     */
    async getActiveHeader(): Promise<Header> {
        const response = await apiClient.get<Header>('/header/active');
        return response.data;
    }

    /**
     * Update the entire active header
     */
    async updateActiveHeader(data: UpdateHeaderDto): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active', data);
        return response.data;
    }

    /**
     * Update only the logo section
     */
    async updateLogo(logoData: { dark: string; light: string; alt: string }): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/logo', logoData);
        return response.data;
    }

    /**
     * Update only the topbar section
     */
    async updateTopBar(topBarData: any): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/topbar', {
            topBar: topBarData
        });
        return response.data;
    }

    /**
     * Update only the navigation section
     */
    async updateNavigation(navigationData: any): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/navigation', {
            navigation: navigationData
        });
        return response.data;
    }

    /**
     * Update only the cart section
     */
    async updateCart(cartData: any): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/cart', cartData);
        return response.data;
    }

    /**
     * Update only the user menu section
     */
    async updateUserMenu(userMenuData: any): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/user-menu', userMenuData);
        return response.data;
    }

    /**
     * Update only the SEO section
     */
    async updateSEO(seoData: any): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/seo', {
            seo: seoData
        });
        return response.data;
    }

    /**
     * Update only the theme section
     */
    async updateTheme(themeData: any): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/theme', themeData);
        return response.data;
    }

    /**
     * Reorder navigation menu items
     */
    async updateMenuOrder(menuItems: Array<{ id: string; position: number }>): Promise<Header> {
        const response = await apiClient.patch<Header>('/header/active/menu-order', {
            menuItems
        });
        return response.data;
    }
}

export const headerService = new HeaderService();