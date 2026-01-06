import axios from '@/lib/axios'
import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/lib/types/banner'

interface ApiResponse<T> {
    data?: T
    message?: string
    success?: boolean
}

export const bannerService = {
    async getAllBanners(): Promise<Banner[]> {
        try {
            const res = await axios.get<ApiResponse<Banner[]>>('/cms/home/banner')
            const data = res.data.data || (res.data as any)
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Failed to fetch banners:', error)
            throw error
        }
    },

    async getActiveBanners(): Promise<Banner[]> {
        try {
            const res = await axios.get<ApiResponse<Banner[]>>('/cms/home/banner/active')
            const data = res.data.data || (res.data as any)
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Failed to fetch active banners:', error)
            throw error
        }
    },

    async getBannerById(id: string): Promise<Banner> {
        try {
            const res = await axios.get<ApiResponse<Banner>>(`/cms/home/banner/${id}`)
            return res.data.data || (res.data as any)
        } catch (error) {
            console.error(`Failed to fetch banner ${id}:`, error)
            throw error
        }
    },

    async createBanner(data: CreateBannerDto): Promise<Banner> {
        try {
            const res = await axios.post<ApiResponse<Banner>>('/cms/home/banner', data)
            return res.data.data || (res.data as any)
        } catch (error) {
            console.error('Failed to create banner:', error)
            throw error
        }
    },

    async createBannerWithMedia(formData: FormData, onUploadProgress?: (progress: number) => void): Promise<{ data: Banner; message: string }> {
        try {
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
        } catch (error) {
            console.error('Failed to create banner with media:', error)
            throw error
        }
    },

    async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
        try {
            const res = await axios.put<ApiResponse<Banner>>(`/cms/home/banner/${id}`, data)
            return res.data.data || (res.data as any)
        } catch (error) {
            console.error(`Failed to update banner ${id}:`, error)
            throw error
        }
    },

    async updateBannerWithMedia(
        id: string,
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ): Promise<{ data: Banner; message: string }> {
        try {
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
        } catch (error) {
            console.error(`Failed to update banner ${id} with media:`, error)
            throw error
        }
    },

    async updateBannerOrder(orders: { id: string; order: number }[]): Promise<void> {
        try {
            await axios.put('/cms/home/banner/reorder/bulk', orders)
        } catch (error) {
            console.error('Failed to update banner order:', error)
            throw error
        }
    },

    async deleteBanner(id: string): Promise<void> {
        try {
            await axios.delete(`/cms/home/banner/${id}`)
        } catch (error) {
            console.error(`Failed to delete banner ${id}:`, error)
            throw error
        }
    },

    async duplicateBanner(id: string): Promise<Banner> {
        try {
            const res = await axios.post<ApiResponse<Banner>>(`/cms/home/banner/${id}/duplicate`)
            return res.data.data || (res.data as any)
        } catch (error) {
            console.error(`Failed to duplicate banner ${id}:`, error)
            throw error
        }
    },

    async exportBanners(format: "json" | "pdf", ids?: string[]): Promise<void> {
        try {
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
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || `Failed to export banners: ${res.status}`)
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
        } catch (error) {
            console.error('Failed to export banners:', error)
            throw error
        }
    },

    async bulkDelete(ids: string[]): Promise<void> {
        try {
            await Promise.all(ids.map((id) => this.deleteBanner(id)))
        } catch (error) {
            console.error('Failed to bulk delete banners:', error)
            throw error
        }
    },

    async bulkToggleStatus(ids: string[], isActive: boolean): Promise<void> {
        try {
            await Promise.all(ids.map((id) => this.updateBanner(id, { isActive })))
        } catch (error) {
            console.error('Failed to bulk toggle banner status:', error)
            throw error
        }
    },
}
