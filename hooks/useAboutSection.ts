"use client"

import { useState, useEffect } from 'react'
import { aboutSectionService } from '@/services/about-section.service'
import type { AboutSection, UpdateAboutSectionDto } from '@/lib/types/about-section'
import { useToast } from '@/context/ToastContext'

export function useAboutSection() {
    const [aboutSection, setAboutSection] = useState<AboutSection | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)
    const { push } = useToast()

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        push({ message, type })
    }

    const fetchAboutSection = async () => {
        try {
            setLoading(true)
            const data = await aboutSectionService.getAboutSection()
            setAboutSection(data)
        } catch (error) {
            console.error('Failed to fetch about section:', error)
            showToast('Failed to fetch about section data.', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAboutSection()
    }, [])

    const updateAboutSection = async (data: UpdateAboutSectionDto) => {
        try {
            const updated = await aboutSectionService.updateAboutSection(data)
            setAboutSection(updated)
            showToast('About section updated successfully', 'success')
            return updated
        } catch (error) {
            showToast('Failed to update about section', 'error')
            throw error
        }
    }

    const updateAboutSectionWithMedia = async (formData: FormData) => {
        try {
            setUploadProgress(0)
            const response = await aboutSectionService.updateAboutSectionWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            )
            setAboutSection(response.data)
            showToast(response.message || 'About section updated successfully', 'success')
            setUploadProgress(0)
            return response.data
        } catch (error) {
            showToast('Failed to update about section with media', 'error')
            setUploadProgress(0)
            throw error
        }
    }

    const toggleActive = async () => {
        try {
            const updated = await aboutSectionService.toggleActive()
            setAboutSection(updated)
            showToast(
                updated.isActive
                    ? 'About section activated successfully'
                    : 'About section deactivated successfully',
                'success'
            )
            return updated
        } catch (error) {
            showToast('Failed to toggle about section status', 'error')
            throw error
        }
    }

    return {
        aboutSection,
        loading,
        uploadProgress,
        fetchAboutSection,
        updateAboutSection,
        updateAboutSectionWithMedia,
        toggleActive,
    }
}
