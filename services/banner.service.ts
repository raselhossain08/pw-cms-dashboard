import axios from '@/lib/axios'
import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/lib/types/banner'

export const bannerService = {
    async getAllBanners() {
        const res = await axios.get<{ data: Banner[] }>('/cms/home/banner')
        return res.data.data || res.data
    },

    async getActiveBanners() {
        const res = await axios.get<{ data: Banner[] }>('/cms/home/banner/active')
        return res.data.data || res.data
    },

    async getBannerById(id: string) {
        const res = await axios.get<{ data: Banner }>(`/cms/home/banner/${id}`)
        return res.data.data || res.data
    },

    async createBanner(data: CreateBannerDto) {
        const res = await axios.post<Banner>('/cms/home/banner', data)
        return res.data
    },

    async createBannerWithMedia(formData: FormData, onUploadProgress?: (progress: number) => void) {
        const res = await axios.post<{ data: Banner; message: string }>(
            '/cms/home/banner/upload',
            formData,
            {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        onUploadProgress?.(progress)
                    }
                },
            }
        )
        return res.data
    },

    async updateBanner(id: string, data: UpdateBannerDto) {
        const res = await axios.put<{ data: Banner } | Banner>(`/cms/home/banner/${id}`, data)
        return (res.data as any).data || res.data
    },

    async updateBannerWithMedia(
        id: string,
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.put<{ data: Banner; message: string }>(
            `/cms/home/banner/${id}/upload`,
            formData,
            {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        onUploadProgress?.(progress)
                    }
                },
            }
        )
        return res.data
    },

    async updateBannerOrder(orders: { id: string; order: number }[]) {
        const res = await axios.put('/cms/home/banner/reorder/bulk', orders)
        return res.data
    },

    async deleteBanner(id: string) {
        const res = await axios.delete(`/cms/home/banner/${id}`)
        return res.data
    },
}
