"use client";

import { useState, useEffect } from 'react';
import { testimonialsService } from '@/services/testimonials.service';
import type { Testimonials, UpdateTestimonialsDto } from '@/lib/types/testimonials';
import { useToast } from '@/context/ToastContext';

export function useTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonials | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { push } = useToast();

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        push({ message, type });
    };

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const data = await testimonialsService.getTestimonials();
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
            showToast('Failed to fetch testimonials data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const updateTestimonials = async (data: UpdateTestimonialsDto) => {
        try {
            const updated = await testimonialsService.updateTestimonials(data);
            setTestimonials(updated);
            showToast('Testimonials updated successfully', 'success');
            return updated;
        } catch (error) {
            showToast('Failed to update testimonials', 'error');
            throw error;
        }
    };

    const updateTestimonialsWithMedia = async (formData: FormData) => {
        try {
            setUploadProgress(0);
            const updated = await testimonialsService.updateTestimonialsWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            );
            setTestimonials(updated);
            showToast('Testimonials updated successfully with media', 'success');
            return updated;
        } catch (error) {
            showToast('Failed to update testimonials with media', 'error');
            throw error;
        } finally {
            setUploadProgress(0);
        }
    };

    const toggleActive = async () => {
        try {
            const updated = await testimonialsService.toggleActive();
            setTestimonials(updated);
            showToast(
                `Testimonials section ${updated.isActive ? 'activated' : 'deactivated'}`,
                'success'
            );
            return updated;
        } catch (error) {
            showToast('Failed to toggle active status', 'error');
            throw error;
        }
    };

    return {
        testimonials,
        loading,
        uploadProgress,
        fetchTestimonials,
        updateTestimonials,
        updateTestimonialsWithMedia,
        toggleActive,
    };
}
