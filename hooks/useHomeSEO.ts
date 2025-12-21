"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/context/ToastContext'

export interface HomeSEOData {
    _id?: string
    title: string
    description: string
    keywords: string[]
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    twitterCard?: string
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: string
    canonical?: string
    robots?: string
    author?: string
    locale?: string
    siteName?: string
    structuredData?: any
    createdAt?: string
    updatedAt?: string
}

interface UseHomeSEOResult {
    seoData: HomeSEOData | null
    loading: boolean
    saving: boolean
    error: string | null
    fetchSEO: () => Promise<void>
    updateSEO: (data: Partial<HomeSEOData>) => Promise<HomeSEOData | null>
    resetToDefaults: () => Promise<HomeSEOData | null>
    refreshSEO: () => Promise<void>
}

const defaultSEO: HomeSEOData = {
    title: 'Home - Your Learning Platform',
    description: 'Welcome to our learning platform. Discover courses, enhance your skills, and achieve your goals.',
    keywords: ['learning', 'courses', 'education', 'training', 'online learning'],
    ogTitle: 'Home - Your Learning Platform',
    ogDescription: 'Welcome to our learning platform. Discover courses, enhance your skills, and achieve your goals.',
    robots: 'index, follow',
    locale: 'en_US',
    siteName: 'Your Learning Platform',
}

export function useHomeSEO(): UseHomeSEOResult {
    const [seoData, setSeoData] = useState<HomeSEOData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { push } = useToast()

    const fetchSEO = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Try to fetch from the backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/home/seo`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (!response.ok) {
                // If endpoint doesn't exist or returns 404, use defaults
                if (response.status === 404) {
                    setSeoData(defaultSEO)
                    return
                }
                throw new Error('Failed to fetch SEO data')
            }

            const data = await response.json()
            setSeoData(data.data || data || defaultSEO)
        } catch (err: any) {
            console.warn('SEO endpoint not available, using defaults:', err.message)
            // Use default SEO data if endpoint doesn't exist yet
            setSeoData(defaultSEO)
            setError(null) // Don't show error for missing endpoint
        } finally {
            setLoading(false)
        }
    }, [push])

    useEffect(() => {
        fetchSEO()
    }, [fetchSEO])

    const updateSEO = useCallback(async (data: Partial<HomeSEOData>): Promise<HomeSEOData | null> => {
        setSaving(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/home/seo`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to update SEO data')
            }

            const result = await response.json()
            const updatedData = result.data || result
            setSeoData(updatedData)
            push({ message: 'Homepage SEO updated successfully', type: 'success' })
            return updatedData
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to update SEO data'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const resetToDefaults = useCallback(async (): Promise<HomeSEOData | null> => {
        setSaving(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/home/seo/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (!response.ok) {
                // If reset endpoint doesn't exist, just use defaults locally
                setSeoData(defaultSEO)
                push({ message: 'SEO data reset to defaults', type: 'success' })
                return defaultSEO
            }

            const result = await response.json()
            const resetData = result.data || defaultSEO
            setSeoData(resetData)
            push({ message: 'SEO data reset to defaults successfully', type: 'success' })
            return resetData
        } catch (err: any) {
            // Fallback to local defaults
            setSeoData(defaultSEO)
            push({ message: 'SEO data reset to defaults', type: 'success' })
            return defaultSEO
        } finally {
            setSaving(false)
        }
    }, [push])

    const refreshSEO = useCallback(async () => {
        await fetchSEO()
    }, [fetchSEO])

    return {
        seoData,
        loading,
        saving,
        error,
        fetchSEO,
        updateSEO,
        resetToDefaults,
        refreshSEO,
    }
}
