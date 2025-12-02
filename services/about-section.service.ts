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
}
