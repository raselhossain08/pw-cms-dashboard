"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaqsService } from '@/lib/services/faqs.service';
import type { Faqs } from '@/lib/services/faqs.service';
import { useToast } from '@/context/ToastContext';

interface UseFAQsResult {
    faqs: Faqs | null;
    loading: boolean;
    saving: boolean;
    uploadProgress: number;
    error: string | null;
    fetchFaqs: () => Promise<void>;
    updateFaqs: (data: Partial<Faqs>) => Promise<Faqs | null>;
    updateFaqsWithUpload: (formData: FormData) => Promise<Faqs | null>;
    toggleActive: () => Promise<Faqs | null>;
    duplicateFaqs: () => Promise<Faqs | null>;
    exportFaqs: (format: "json" | "pdf") => Promise<void>;
    refreshFaqs: () => Promise<void>;
}

export function useFAQs(): UseFAQsResult {
    const [faqs, setFaqs] = useState<Faqs | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { push } = useToast();

    const fetchFaqs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching FAQs from backend...');
            const response = await FaqsService.getDefaultFaqs();
            console.log('FAQs Response:', { success: response.success, hasData: !!response.data });

            if (response.success && response.data) {
                setFaqs(response.data);
                console.log('FAQs loaded successfully:', response.data._id);
            } else {
                const errorMessage = response.message || 'Failed to fetch FAQs - No data returned';
                console.error('FAQs fetch failed:', errorMessage);
                setError(errorMessage);
                push({ message: errorMessage, type: 'error' });
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch FAQs - Network error';
            console.error('FAQs fetch error:', err);
            setError(errorMessage);
            push({ message: `Error loading FAQs: ${errorMessage}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [push]);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const updateFaqs = useCallback(async (data: Partial<Faqs>): Promise<Faqs | null> => {
        if (!faqs?._id) {
            push({ message: 'No FAQs data found', type: 'error' });
            return null;
        }

        setSaving(true);
        try {
            const response = await FaqsService.updateFaqs(faqs._id, data);
            if (response.success && response.data) {
                setFaqs(response.data);
                push({ message: 'FAQs updated successfully', type: 'success' });
                return response.data;
            } else {
                const errorMessage = response.message || 'Failed to update FAQs';
                push({ message: errorMessage, type: 'error' });
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update FAQs';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [faqs, push]);

    const updateFaqsWithUpload = useCallback(async (formData: FormData): Promise<Faqs | null> => {
        if (!faqs?._id) {
            push({ message: 'No FAQs data found', type: 'error' });
            return null;
        }

        setSaving(true);
        setUploadProgress(0);
        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const response = await FaqsService.updateFaqsWithUpload(faqs._id, formData);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.success && response.data) {
                setFaqs(response.data);
                push({ message: 'FAQs updated successfully with image', type: 'success' });
                setTimeout(() => setUploadProgress(0), 1000);
                return response.data;
            } else {
                const errorMessage = response.message || 'Failed to update FAQs';
                push({ message: errorMessage, type: 'error' });
                setUploadProgress(0);
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update FAQs';
            push({ message: errorMessage, type: 'error' });
            setUploadProgress(0);
            return null;
        } finally {
            setSaving(false);
        }
    }, [faqs, push]);

    const toggleActive = useCallback(async (): Promise<Faqs | null> => {
        if (!faqs?._id) {
            push({ message: 'No FAQs data found', type: 'error' });
            return null;
        }

        setSaving(true);
        try {
            const response = await FaqsService.toggleActive(faqs._id);
            if (response.success && response.data) {
                setFaqs(response.data);
                push({
                    message: `FAQs ${response.data.isActive ? 'activated' : 'deactivated'}`,
                    type: 'success'
                });
                return response.data;
            } else {
                const errorMessage = response.message || 'Failed to toggle active status';
                push({ message: errorMessage, type: 'error' });
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to toggle active status';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [faqs, push]);

    const duplicateFaqs = useCallback(async (): Promise<Faqs | null> => {
        if (!faqs?._id) {
            push({ message: 'No FAQs data found', type: 'error' });
            return null;
        }

        setSaving(true);
        try {
            const response = await FaqsService.duplicateFaqs(faqs._id);
            if (response.success && response.data) {
                setFaqs(response.data);
                push({ message: 'FAQs duplicated successfully!', type: 'success' });
                return response.data;
            } else {
                const errorMessage = response.message || 'Failed to duplicate FAQs';
                push({ message: errorMessage, type: 'error' });
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to duplicate FAQs';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [faqs, push]);

    const exportFaqs = useCallback(async (format: "json" | "pdf"): Promise<void> => {
        if (!faqs?._id) {
            push({ message: 'No FAQs data found', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            await FaqsService.exportFaqs(faqs._id, format);
            push({ message: `FAQs exported successfully as ${format.toUpperCase()}!`, type: 'success' });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export FAQs';
            push({ message: errorMessage, type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [faqs, push]);

    const refreshFaqs = useCallback(async () => {
        await fetchFaqs();
    }, [fetchFaqs]);

    return {
        faqs,
        loading,
        saving,
        uploadProgress,
        error,
        fetchFaqs,
        updateFaqs,
        updateFaqsWithUpload,
        toggleActive,
        duplicateFaqs,
        exportFaqs,
        refreshFaqs,
    };
}
