import axios from '@/lib/axios';
import type { Blog, UpdateBlogDto } from '@/lib/types/blog';

export const blogService = {
    async getBlog() {
        const res = await axios.get<{ data: Blog }>('/cms/home/blog');
        return res.data.data;
    },

    async updateBlog(data: UpdateBlogDto) {
        const res = await axios.patch<{ data: Blog }>('/cms/home/blog', data);
        return res.data.data;
    },

    async updateBlogWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.patch<{ data: Blog; message?: string }>(
            '/cms/home/blog',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onUploadProgress?.(progress);
                    }
                },
            }
        );
        return res.data.data;
    },

    async toggleActive() {
        const res = await axios.patch<{ data: Blog }>('/cms/home/blog/toggle-active');
        return res.data.data;
    },

    async duplicateBlogPost(slug: string) {
        const res = await axios.post<{ data: Blog }>(`/cms/home/blog/${slug}/duplicate`);
        return res.data.data;
    },

    async exportBlog(format: "json" | "pdf") {
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

        const res = await fetch(`${API_BASE_URL}/cms/home/blog/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export blog')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `blog-export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },
};
