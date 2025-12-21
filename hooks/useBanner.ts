"use client"

import { useState, useEffect, useCallback } from 'react'
import { bannerService } from '@/services/banner.service'
import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/lib/types/banner'
import { useToast } from '@/context/ToastContext'

interface UseBannersResult {
    banners: Banner[]
    loading: boolean
    saving: boolean
    uploadProgress: number
    error: string | null
    fetchBanners: () => Promise<void>
    createBanner: (data: CreateBannerDto) => Promise<Banner | null>
    createBannerWithMedia: (formData: FormData) => Promise<Banner | null>
    updateBanner: (id: string, data: UpdateBannerDto) => Promise<Banner | null>
    updateBannerWithMedia: (id: string, formData: FormData) => Promise<Banner | null>
    deleteBanner: (id: string) => Promise<boolean>
    duplicateBanner: (id: string) => Promise<Banner | null>
    toggleActiveStatus: (id: string) => Promise<Banner | null>
    bulkDelete: (ids: string[]) => Promise<boolean>
    bulkToggleStatus: (ids: string[], isActive: boolean) => Promise<boolean>
    exportBanners: (format: "json" | "pdf", ids?: string[]) => Promise<void>
    updateBannerOrder: (orders: { id: string; order: number }[]) => Promise<void>
    refreshBanners: () => Promise<void>
}

export function useBanners(): UseBannersResult {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const { push } = useToast()

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await bannerService.getAllBanners()
            // Ensure data is always an array
            setBanners(Array.isArray(data) ? data : [])
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch banners. Please check if the backend is running.'
            setError(errorMessage)
            setBanners([]) // Set empty array on error
            push({ message: errorMessage, type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [push])

    useEffect(() => {
        fetchBanners()
    }, [fetchBanners])

    const createBanner = useCallback(async (data: CreateBannerDto): Promise<Banner | null> => {
        setSaving(true)
        try {
            const newBanner = await bannerService.createBanner(data)
            setBanners((prev) => [...prev, newBanner])
            push({ message: 'Banner created successfully', type: 'success' })
            return newBanner
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create banner'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const createBannerWithMedia = useCallback(async (formData: FormData): Promise<Banner | null> => {
        setSaving(true)
        setUploadProgress(0)
        try {
            const result = await bannerService.createBannerWithMedia(formData, (progress) => {
                setUploadProgress(progress)
            })
            setBanners((prev) => [...prev, result.data])
            push({ message: result.message || 'Banner created successfully', type: 'success' })
            setUploadProgress(0)
            return result.data
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create banner with media'
            push({ message: errorMessage, type: 'error' })
            setUploadProgress(0)
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const updateBanner = useCallback(async (id: string, data: UpdateBannerDto): Promise<Banner | null> => {
        setSaving(true)
        try {
            const updatedBanner = await bannerService.updateBanner(id, data)
            setBanners((prev) => prev.map((b) => (b._id === id ? updatedBanner : b)))
            push({ message: 'Banner updated successfully', type: 'success' })
            return updatedBanner
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update banner'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const updateBannerWithMedia = useCallback(async (id: string, formData: FormData): Promise<Banner | null> => {
        setSaving(true)
        setUploadProgress(0)
        try {
            const result = await bannerService.updateBannerWithMedia(id, formData, (progress) => {
                setUploadProgress(progress)
            })
            setBanners((prev) => prev.map((b) => (b._id === id ? result.data : b)))
            push({ message: result.message || 'Banner updated successfully', type: 'success' })
            setUploadProgress(0)
            return result.data
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update banner with media'
            push({ message: errorMessage, type: 'error' })
            setUploadProgress(0)
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const deleteBanner = useCallback(async (id: string): Promise<boolean> => {
        setSaving(true)
        try {
            await bannerService.deleteBanner(id)
            setBanners((prev) => prev.filter((b) => b._id !== id))
            push({ message: 'Banner deleted successfully', type: 'success' })
            return true
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete banner'
            push({ message: errorMessage, type: 'error' })
            return false
        } finally {
            setSaving(false)
        }
    }, [push])

    const duplicateBanner = useCallback(async (id: string): Promise<Banner | null> => {
        setSaving(true)
        try {
            const duplicated = await bannerService.duplicateBanner(id)
            push({ message: 'Banner duplicated successfully!', type: 'success' })
            return duplicated
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to duplicate banner'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const toggleActiveStatus = useCallback(async (id: string): Promise<Banner | null> => {
        setSaving(true)
        try {
            const banner = banners.find((b) => b._id === id)
            if (!banner) return null
            const updated = await bannerService.updateBanner(id, { isActive: !banner.isActive })
            setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)))
            push({
                message: updated.isActive ? 'Banner activated successfully' : 'Banner deactivated successfully',
                type: 'success'
            })
            return updated
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to toggle banner status'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [banners, push])

    const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
        setSaving(true)
        try {
            await Promise.all(ids.map((id) => bannerService.deleteBanner(id)))
            setBanners((prev) => prev.filter((b) => !ids.includes(b._id)))
            push({ message: `${ids.length} banner(s) deleted successfully`, type: 'success' })
            return true
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete banners'
            push({ message: errorMessage, type: 'error' })
            return false
        } finally {
            setSaving(false)
        }
    }, [push])

    const bulkToggleStatus = useCallback(async (ids: string[], isActive: boolean): Promise<boolean> => {
        setSaving(true)
        try {
            await Promise.all(ids.map((id) => bannerService.updateBanner(id, { isActive })))
            setBanners((prev) => prev.map((b) => (ids.includes(b._id) ? { ...b, isActive } : b)))
            push({ message: `${ids.length} banner(s) ${isActive ? 'activated' : 'deactivated'} successfully`, type: 'success' })
            return true
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update banner status'
            push({ message: errorMessage, type: 'error' })
            return false
        } finally {
            setSaving(false)
        }
    }, [push])

    const exportBanners = useCallback(async (format: "json" | "pdf", ids?: string[]): Promise<void> => {
        setSaving(true)
        try {
            await bannerService.exportBanners(format, ids)
            push({ message: `Banner(s) exported successfully as ${format.toUpperCase()}!`, type: 'success' })
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export banners'
            push({ message: errorMessage, type: 'error' })
        } finally {
            setSaving(false)
        }
    }, [push])

    const updateBannerOrder = useCallback(async (orders: { id: string; order: number }[]): Promise<void> => {
        setSaving(true)
        try {
            await bannerService.updateBannerOrder(orders)
            await fetchBanners()
            push({ message: 'Banner order updated successfully', type: 'success' })
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update banner order'
            push({ message: errorMessage, type: 'error' })
        } finally {
            setSaving(false)
        }
    }, [fetchBanners, push])

    const refreshBanners = useCallback(async () => {
        await fetchBanners()
    }, [fetchBanners])

    return {
        banners,
        loading,
        saving,
        uploadProgress,
        error,
        fetchBanners,
        createBanner,
        createBannerWithMedia,
        updateBanner,
        updateBannerWithMedia,
        deleteBanner,
        duplicateBanner,
        toggleActiveStatus,
        bulkDelete,
        bulkToggleStatus,
        exportBanners,
        updateBannerOrder,
        refreshBanners,
    }
}
