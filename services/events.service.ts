import axios from '@/lib/axios'
import type { Events, CreateEventsDto, UpdateEventsDto } from '@/lib/types/events'

export const eventsService = {
    async getEvents() {
        const res = await axios.get<{ data: Events }>('/cms/home/events')
        return res.data.data || res.data
    },

    async updateEvents(data: UpdateEventsDto) {
        const res = await axios.put<{ data: Events }>('/cms/home/events', data)
        return (res.data as any).data || res.data
    },

    async updateEventsWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.put<{ data: Events; message: string }>(
            '/cms/home/events/upload',
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
        const res = await axios.post<{ data: Events }>('/cms/home/events/toggle-active')
        return res.data.data || res.data
    },

    async createEvents(data: CreateEventsDto) {
        const res = await axios.post<{ data: Events }>('/cms/home/events', data)
        return res.data.data || res.data
    },
}
