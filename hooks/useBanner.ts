"use client"

import { useState, useEffect } from 'react'
import { bannerService } from '@/services/banner.service'
import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/lib/types/banner'
import { useToast } from '@/context/ToastContext'

export function useBanners() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)
    const { push } = useToast()

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        push({ message, type })
    }

    const fetchBanners = async () => {
        try {
            setLoading(true)
            const data = await bannerService.getAllBanners()
            // Ensure data is always an array
            setBanners(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch banners:', error)
            setBanners([]) // Set empty array on error
            showToast('Failed to fetch banners. Please check if the backend is running.', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBanners()
    }, [])

    const createBanner = async (data: CreateBannerDto) => {
        try {
            const newBanner = await bannerService.createBanner(data)
            setBanners((prev) => [...prev, newBanner])
            showToast('Banner created successfully', 'success')
            return newBanner
        } catch (error) {
            showToast('Failed to create banner', 'error')
            throw error
        }
    }

    const createBannerWithMedia = async (formData: FormData) => {
        try {
            setUploadProgress(0)
            const result = await bannerService.createBannerWithMedia(formData, (progress) => {
                setUploadProgress(progress)
            })
            setBanners((prev) => [...prev, result.data])
            showToast(result.message || 'Banner created successfully', 'success')
            setUploadProgress(0)
            return result.data
        } catch (error) {
            showToast('Failed to create banner with media', 'error')
            setUploadProgress(0)
            throw error
        }
    }

    const updateBanner = async (id: string, data: UpdateBannerDto) => {
        try {
            const updatedBanner = await bannerService.updateBanner(id, data)
            setBanners((prev) => prev.map((b) => (b._id === id ? updatedBanner : b)))
            showToast('Banner updated successfully', 'success')
            return updatedBanner
        } catch (error) {
            showToast('Failed to update banner', 'error')
            throw error
        }
    }

    const updateBannerWithMedia = async (id: string, formData: FormData) => {
        try {
            setUploadProgress(0)
            const result = await bannerService.updateBannerWithMedia(id, formData, (progress) => {
                setUploadProgress(progress)
            })
            setBanners((prev) => prev.map((b) => (b._id === id ? result.data : b)))
            showToast(result.message || 'Banner updated successfully', 'success')
            setUploadProgress(0)
            return result.data
        } catch (error) {
            showToast('Failed to update banner with media', 'error')
            setUploadProgress(0)
            throw error
        }
    }

    const deleteBanner = async (id: string) => {
        try {
            await bannerService.deleteBanner(id)
            setBanners((prev) => prev.filter((b) => b._id !== id))
            showToast('Banner deleted successfully', 'success')
        } catch (error) {
            showToast('Failed to delete banner', 'error')
            throw error
        }
    }

    const updateBannerOrder = async (orders: { id: string; order: number }[]) => {
        try {
            await bannerService.updateBannerOrder(orders)
            await fetchBanners()
            showToast('Banner order updated successfully', 'success')
        } catch (error) {
            showToast('Failed to update banner order', 'error')
            throw error
        }
    }

    return {
        banners,
        loading,
        uploadProgress,
        fetchBanners,
        createBanner,
        createBannerWithMedia,
        updateBanner,
        updateBannerWithMedia,
        deleteBanner,
        updateBannerOrder,
    }
}
