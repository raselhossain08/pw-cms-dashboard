import api from '@/lib/axios';
import type {
    HeaderNavigation,
    TopBar,
    Footer,
    ApiResponse,
} from '@/types/cms';

type ProgressEvent = { loaded: number; total?: number };

const CMS_BASE_URL = '/cms';

// Header Navigation API
export const headerNavigationApi = {
    // Get active header navigation (public)
    getActive: async (): Promise<HeaderNavigation> => {
        const response = await api.get<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/active`
        );
        return response.data.data;
    },

    // Get all header navigations (admin)
    getAll: async (): Promise<HeaderNavigation[]> => {
        const response = await api.get<ApiResponse<HeaderNavigation[]>>(
            `${CMS_BASE_URL}/header-navigation`
        );
        return response.data.data;
    },

    // Get header navigation by ID (admin)
    getById: async (id: string): Promise<HeaderNavigation> => {
        const response = await api.get<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}`
        );
        return response.data.data;
    },

    // Create header navigation (admin)
    create: async (data: Partial<HeaderNavigation>): Promise<HeaderNavigation> => {
        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation`,
            data
        );
        return response.data.data;
    },

    // Update header navigation (admin)
    update: async (
        id: string,
        data: Partial<HeaderNavigation>
    ): Promise<HeaderNavigation> => {
        // Strip out readonly fields
        const { _id, createdAt, updatedAt, ...updateData } = data;
        const response = await api.put<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}`,
            updateData
        );
        return response.data.data;
    },

    // Set header navigation as active (admin)
    setActive: async (id: string): Promise<HeaderNavigation> => {
        const response = await api.put<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/activate`
        );
        return response.data.data;
    },

    // Delete header navigation (admin)
    delete: async (id: string): Promise<void> => {
        await api.delete(`${CMS_BASE_URL}/header-navigation/${id}`);
    },

    // Upload logo (admin)
    uploadLogo: async (
        id: string,
        file: File,
        type: 'dark' | 'light',
        onProgress?: (progress: number) => void
    ): Promise<HeaderNavigation> => {
        const formData = new FormData();
        formData.append(type, file);

        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/logo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data;
    },

    // Upload featured course image (admin)
    uploadFeaturedImage: async (
        id: string,
        menuIndex: number,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<HeaderNavigation> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/featured/${menuIndex}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data;
    },

    // Upload user avatar (admin)
    uploadAvatar: async (
        id: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<HeaderNavigation> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/avatar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data;
    },

    // Toggle active status (admin)
    toggleActive: async (id: string): Promise<HeaderNavigation> => {
        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/toggle-active`
        );
        return response.data.data;
    },

    // Duplicate header navigation (admin)
    duplicate: async (id: string): Promise<HeaderNavigation> => {
        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/duplicate`
        );
        return response.data.data;
    },

    // Export header navigation (admin)
    export: async (id: string, format: "json" | "pdf" = "json"): Promise<void> => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        // Get token from cookies
        let token = ''
        try {
            const { cookieService } = await import('@/lib/cookie.service')
            token = cookieService.get('token') || ''
        } catch {
            // Fallback to localStorage if cookie service not available
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('token') || ''
            }
        }

        const res = await fetch(`${API_BASE_URL}/cms/header-navigation/${id}/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export header navigation')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `header-navigation_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },

    // Upload SEO OG image (admin)
    uploadSeoImage: async (
        id: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<HeaderNavigation> => {
        const formData = new FormData();
        formData.append('ogImage', file);

        const response = await api.post<ApiResponse<HeaderNavigation>>(
            `${CMS_BASE_URL}/header-navigation/${id}/seo-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data;
    },
};

// Top Bar API
export const topBarApi = {
    // Get active top bar (public)
    getActive: async (): Promise<TopBar> => {
        const response = await api.get<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/active`
        );
        return response.data.data;
    },

    // Get all top bars (admin)
    getAll: async (): Promise<TopBar[]> => {
        const response = await api.get<ApiResponse<TopBar[]>>(
            `${CMS_BASE_URL}/top-bar`
        );
        return response.data.data;
    },

    // Get top bar by ID (admin)
    getById: async (id: string): Promise<TopBar> => {
        const response = await api.get<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}`
        );
        return response.data.data;
    },

    // Create top bar (admin)
    create: async (data: Partial<TopBar>): Promise<TopBar> => {
        const response = await api.post<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar`,
            data
        );
        return response.data.data;
    },

    // Update top bar (admin)
    update: async (id: string, data: Partial<TopBar>): Promise<TopBar> => {
        // Strip out readonly fields
        const { _id, createdAt, updatedAt, ...updateData } = data;
        const response = await api.put<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}`,
            updateData
        );
        return response.data.data;
    },

    // Set top bar as active (admin)
    setActive: async (id: string): Promise<TopBar> => {
        const response = await api.put<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}/activate`
        );
        return response.data.data;
    },

    // Delete top bar (admin)
    delete: async (id: string): Promise<void> => {
        await api.delete(`${CMS_BASE_URL}/top-bar/${id}`);
    },

    // Upload news icon (admin)
    uploadNewsIcon: async (
        id: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<TopBar> => {
        const formData = new FormData();
        formData.append('icon', file);

        const response = await api.post<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}/news-icon`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data;
    },

    // Toggle active status (admin)
    toggleActive: async (id: string): Promise<TopBar> => {
        const response = await api.post<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}/toggle-active`
        );
        return response.data.data;
    },

    // Duplicate top bar (admin)
    duplicate: async (id: string): Promise<TopBar> => {
        const response = await api.post<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}/duplicate`
        );
        return response.data.data;
    },

    // Export top bar (admin)
    export: async (id: string, format: "json" | "pdf" = "json"): Promise<void> => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        // Get token from cookies
        let token = ''
        try {
            const { cookieService } = await import('@/lib/cookie.service')
            token = cookieService.get('token') || ''
        } catch {
            // Fallback to localStorage if cookie service not available
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('token') || ''
            }
        }

        const res = await fetch(`${API_BASE_URL}/cms/top-bar/${id}/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export top bar')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `top-bar_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },

    // Upload language flag (admin)
    uploadLanguageFlag: async (
        id: string,
        languageCode: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<TopBar> => {
        const formData = new FormData();
        formData.append('flag', file);

        const response = await api.post<ApiResponse<TopBar>>(
            `${CMS_BASE_URL}/top-bar/${id}/language-flag/${languageCode}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data;
    },
};

// Footer API
export const footerApi = {
    // Get active footer (public)
    getActive: async (): Promise<Footer> => {
        const response = await api.get<any>(
            `${CMS_BASE_URL}/footer/active`
        );
        // Backend returns double-nested: { data: { data: footer } }
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Get all footers (admin)
    getAll: async (): Promise<Footer[]> => {
        const response = await api.get<any>(
            `${CMS_BASE_URL}/footer`
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Get footer by ID (admin)
    getById: async (id: string): Promise<Footer> => {
        const response = await api.get<any>(
            `${CMS_BASE_URL}/footer/${id}`
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Create footer (admin)
    create: async (data: Partial<Footer>): Promise<Footer> => {
        const response = await api.post<any>(
            `${CMS_BASE_URL}/footer`,
            data
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Update footer (admin)
    update: async (id: string, data: Partial<Footer>): Promise<Footer> => {
        // Strip out readonly fields
        const { _id, createdAt, updatedAt, ...updateData } = data;
        const response = await api.put<any>(
            `${CMS_BASE_URL}/footer/${id}`,
            updateData
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Set footer as active (admin)
    setActive: async (id: string): Promise<Footer> => {
        const response = await api.put<any>(
            `${CMS_BASE_URL}/footer/${id}/activate`
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Delete footer (admin)
    delete: async (id: string): Promise<void> => {
        await api.delete(`${CMS_BASE_URL}/footer/${id}`);
    },

    // Upload footer logo (admin)
    uploadLogo: async (
        id: string,
        file: File,
        metadata?: { alt?: string; width?: number; height?: number },
        onProgress?: (progress: number) => void
    ): Promise<Footer> => {
        const formData = new FormData();
        formData.append('logo', file);
        if (metadata?.alt) formData.append('alt', metadata.alt);
        if (metadata?.width) formData.append('width', metadata.width.toString());
        if (metadata?.height) formData.append('height', metadata.height.toString());

        const response = await api.post<any>(
            `${CMS_BASE_URL}/footer/${id}/logo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Toggle active status (admin)
    toggleActive: async (id: string): Promise<Footer> => {
        const response = await api.post<any>(
            `${CMS_BASE_URL}/footer/${id}/toggle-active`
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Duplicate footer (admin)
    duplicate: async (id: string): Promise<Footer> => {
        const response = await api.post<any>(
            `${CMS_BASE_URL}/footer/${id}/duplicate`
        );
        return response.data?.data?.data || response.data?.data || response.data;
    },

    // Export footer (admin)
    export: async (id: string, format: "json" | "pdf" = "json"): Promise<void> => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        // Get token from cookies
        let token = ''
        try {
            const { cookieService } = await import('@/lib/cookie.service')
            token = cookieService.get('token') || ''
        } catch {
            // Fallback to localStorage if cookie service not available
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('token') || ''
            }
        }

        const res = await fetch(`${API_BASE_URL}/cms/footer/${id}/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export footer')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `footer_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },
};
