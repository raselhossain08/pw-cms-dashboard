"use client";

import { useState, useEffect, useCallback } from 'react';
import { testimonialsService } from '@/services/testimonials.service';
import type { Testimonials, UpdateTestimonialsDto } from '@/lib/types/testimonials';
import { useToast } from '@/context/ToastContext';

interface UseTestimonialsResult {
    testimonials: Testimonials | null;
    loading: boolean;
    saving: boolean;
    uploadProgress: number;
    error: string | null;
    fetchTestimonials: () => Promise<void>;
    updateTestimonials: (data: UpdateTestimonialsDto) => Promise<Testimonials | null>;
    updateTestimonialsWithMedia: (formData: FormData) => Promise<Testimonials | null>;
    toggleActive: () => Promise<Testimonials | null>;
    duplicateTestimonial: (index: number) => Promise<Testimonials | null>;
    exportTestimonials: (format: "json" | "pdf") => Promise<void>;
    refreshTestimonials: () => Promise<void>;
}

export function useTestimonials(): UseTestimonialsResult {
    const [testimonials, setTestimonials] = useState<Testimonials | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { push } = useToast();

    const fetchTestimonials = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await testimonialsService.getTestimonials();
            setTestimonials(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch testimonials data.';
            setError(errorMessage);
            push({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [push]);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const updateTestimonials = useCallback(async (data: UpdateTestimonialsDto): Promise<Testimonials | null> => {
        setSaving(true);
        try {
            const updated = await testimonialsService.updateTestimonials(data);
            setTestimonials(updated);
            push({ message: 'Testimonials updated successfully', type: 'success' });
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update testimonials';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const updateTestimonialsWithMedia = useCallback(async (formData: FormData): Promise<Testimonials | null> => {
        setSaving(true);
        setUploadProgress(0);
        try {
            const updated = await testimonialsService.updateTestimonialsWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            );
            setTestimonials(updated);
            push({ message: 'Testimonials updated successfully with media', type: 'success' });
            setUploadProgress(0);
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update testimonials with media';
            push({ message: errorMessage, type: 'error' });
            setUploadProgress(0);
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const toggleActive = useCallback(async (): Promise<Testimonials | null> => {
        setSaving(true);
        try {
            const updated = await testimonialsService.toggleActive();
            setTestimonials(updated);
            push({
                message: `Testimonials section ${updated.isActive ? 'activated' : 'deactivated'}`,
                type: 'success'
            });
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to toggle active status';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const duplicateTestimonial = useCallback(async (index: number): Promise<Testimonials | null> => {
        setSaving(true);
        try {
            const duplicated = await testimonialsService.duplicateTestimonial(index);
            setTestimonials(duplicated);
            push({ message: 'Testimonial duplicated successfully!', type: 'success' });
            return duplicated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to duplicate testimonial';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const exportTestimonials = useCallback(async (format: "json" | "pdf"): Promise<void> => {
        setSaving(true);
        try {
            await testimonialsService.exportTestimonials(format);
            push({ message: `Testimonials exported successfully as ${format.toUpperCase()}!`, type: 'success' });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export testimonials';
            push({ message: errorMessage, type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [push]);

    const refreshTestimonials = useCallback(async () => {
        await fetchTestimonials();
    }, [fetchTestimonials]);

    return {
        testimonials,
        loading,
        saving,
        uploadProgress,
        error,
        fetchTestimonials,
        updateTestimonials,
        updateTestimonialsWithMedia,
        toggleActive,
        duplicateTestimonial,
        exportTestimonials,
        refreshTestimonials,
    };
}
