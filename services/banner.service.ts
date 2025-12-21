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

    async duplicateBanner(id: string) {
        const res = await axios.post<{ data: Banner }>(`/cms/home/banner/${id}/duplicate`)
        return res.data.data || res.data
    },

    async exportBanners(format: "json" | "pdf", ids?: string[]) {
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

        const queryParams = new URLSearchParams()
        queryParams.append('format', format)
        if (ids && ids.length > 0) {
            ids.forEach((id) => queryParams.append('ids', id))
        }

        const res = await fetch(`${API_BASE_URL}/cms/home/banner/export?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export banners')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `banners-export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },
}
