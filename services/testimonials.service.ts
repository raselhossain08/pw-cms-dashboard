import axios from '@/lib/axios';
import type { Testimonials, UpdateTestimonialsDto } from '@/lib/types/testimonials';

export const testimonialsService = {
    async getTestimonials() {
        const res = await axios.get<{ success: boolean; data: { success: boolean; data: Testimonials } }>('/cms/home/testimonials');
        return res.data.data.data;
    },

    async updateTestimonials(data: UpdateTestimonialsDto) {
        const res = await axios.patch<{ success: boolean; data: { success: boolean; data: Testimonials } }>('/cms/home/testimonials', data);
        return res.data.data.data;
    },

    async updateTestimonialsWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.patch<{ success: boolean; data: { success: boolean; data: Testimonials }; message: string }>(
            '/cms/home/testimonials',
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
        return res.data.data.data;
    },

    async toggleActive() {
        const res = await axios.patch<{ success: boolean; data: { success: boolean; data: Testimonials } }>('/cms/home/testimonials/toggle-active');
        return res.data.data.data;
    },

    async duplicateTestimonial(index: number) {
        const res = await axios.post<{ success: boolean; data: { success: boolean; data: Testimonials } }>(`/cms/home/testimonials/${index}/duplicate`);
        return res.data.data.data;
    },

    async exportTestimonials(format: "json" | "pdf") {
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

        const res = await fetch(`${API_BASE_URL}/cms/home/testimonials/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export testimonials')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `testimonials-export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },
};
