import axios from '@/lib/axios';
import type { Blog, UpdateBlogDto } from '@/lib/types/blog';

export const blogService = {
    async getBlog() {
        const res = await axios.get<{ success: boolean; data: { success: boolean; data: Blog } }>('/cms/home/blog');
        return res.data.data.data;
    },

    async updateBlog(data: UpdateBlogDto) {
        const res = await axios.patch<{ success: boolean; data: { success: boolean; data: Blog } }>('/cms/home/blog', data);
        return res.data.data.data;
    },

    async updateBlogWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.patch<{ success: boolean; data: { success: boolean; data: Blog }; message: string }>(
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
        return res.data.data.data;
    },

    async toggleActive() {
        const res = await axios.patch<{ success: boolean; data: { success: boolean; data: Blog } }>('/cms/home/blog/toggle-active');
        return res.data.data.data;
    },
};
