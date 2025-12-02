"use client"

import { useState, useEffect } from 'react'
import { eventsService } from '@/services/events.service'
import type { Events, UpdateEventsDto } from '@/lib/types/events'
import { useToast } from '@/context/ToastContext'

export function useEvents() {
    const [events, setEvents] = useState<Events | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)
    const { push } = useToast()

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        push({ message, type })
    }

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const data = await eventsService.getEvents()
            setEvents(data)
        } catch (error) {
            console.error('Failed to fetch events:', error)
            showToast('Failed to fetch events data.', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const updateEvents = async (data: UpdateEventsDto) => {
        try {
            const updated = await eventsService.updateEvents(data)
            setEvents(updated)
            showToast('Events updated successfully', 'success')
            return updated
        } catch (error) {
            showToast('Failed to update events', 'error')
            throw error
        }
    }

    const updateEventsWithMedia = async (formData: FormData) => {
        try {
            setUploadProgress(0)
            const response = await eventsService.updateEventsWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            )
            setEvents(response.data)
            showToast('Events updated successfully with media', 'success')
            return response
        } catch (error) {
            showToast('Failed to update events with media', 'error')
            throw error
        } finally {
            setUploadProgress(0)
        }
    }

    const toggleActive = async () => {
        try {
            const updated = await eventsService.toggleActive()
            setEvents(updated)
            showToast(
                `Events section ${updated.isActive ? 'activated' : 'deactivated'}`,
                'success'
            )
            return updated
        } catch (error) {
            showToast('Failed to toggle active status', 'error')
            throw error
        }
    }

    return {
        events,
        loading,
        uploadProgress,
        fetchEvents,
        updateEvents,
        updateEventsWithMedia,
        toggleActive,
    }
}
