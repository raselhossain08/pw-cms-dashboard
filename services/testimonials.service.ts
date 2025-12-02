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
};
