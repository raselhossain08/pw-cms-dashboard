import axios from '@/lib/axios'
import type { AboutSection, CreateAboutSectionDto, UpdateAboutSectionDto } from '@/lib/types/about-section'

export const aboutSectionService = {
    async getAboutSection() {
        const res = await axios.get<{ data: AboutSection }>('/cms/home/about-section')
        return res.data.data || res.data
    },

    async updateAboutSection(data: UpdateAboutSectionDto) {
        const res = await axios.put<{ data: AboutSection }>('/cms/home/about-section', data)
        return (res.data as any).data || res.data
    },

    async updateAboutSectionWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.put<{ data: AboutSection; message: string }>(
            '/cms/home/about-section/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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

    async toggleActive() {
        const res = await axios.post<{ data: AboutSection }>('/cms/home/about-section/toggle-active')
        return res.data.data || res.data
    },

    async duplicateAboutSection() {
        const res = await axios.post<{ data: AboutSection }>('/cms/home/about-section/duplicate')
        return res.data.data || res.data
    },

    async exportAboutSection(format: "json" | "pdf") {
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

        const res = await fetch(`${API_BASE_URL}/cms/home/about-section/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export about section')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `about-section-export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },
}
