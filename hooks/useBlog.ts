"use client";

import { useState, useEffect, useCallback } from 'react';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/lib/types/blog';
import { useToast } from '@/context/ToastContext';

interface UseBlogResult {
    blog: Blog | null;
    loading: boolean;
    saving: boolean;
    uploadProgress: number;
    error: string | null;
    fetchBlog: () => Promise<void>;
    updateBlog: (data: any) => Promise<Blog | null>;
    updateBlogWithMedia: (formData: FormData) => Promise<Blog | null>;
    toggleActive: () => Promise<Blog | null>;
    duplicateBlogPost: (slug: string) => Promise<Blog | null>;
    exportBlog: (format: "json" | "pdf") => Promise<void>;
    refreshBlog: () => Promise<void>;
}

export const useBlog = (): UseBlogResult => {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { push } = useToast();

    const fetchBlog = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await blogService.getBlog();
            setBlog(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch blog';
            setError(errorMessage);
            push({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [push]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    const updateBlog = useCallback(async (data: any): Promise<Blog | null> => {
        setSaving(true);
        try {
            const updated = await blogService.updateBlog(data);
            setBlog(updated);
            push({ message: 'Blog updated successfully', type: 'success' });
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update blog';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const updateBlogWithMedia = useCallback(async (formData: FormData): Promise<Blog | null> => {
        setSaving(true);
        setUploadProgress(0);
        try {
            const data = await blogService.updateBlogWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            );

            setBlog(data);
            setUploadProgress(100);
            push({ message: 'Blog updated successfully', type: 'success' });

            setTimeout(() => setUploadProgress(0), 1000);
            return data;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update blog';
            push({ message: errorMessage, type: 'error' });
            setUploadProgress(0);
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const toggleActive = useCallback(async (): Promise<Blog | null> => {
        setSaving(true);
        try {
            const data = await blogService.toggleActive();
            setBlog(data);
            push({ message: `Blog is now ${data.isActive ? 'active' : 'inactive'}`, type: 'success' });
            return data;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to toggle blog status';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const duplicateBlogPost = useCallback(async (slug: string): Promise<Blog | null> => {
        setSaving(true);
        try {
            const duplicated = await blogService.duplicateBlogPost(slug);
            setBlog(duplicated);
            push({ message: 'Blog post duplicated successfully!', type: 'success' });
            return duplicated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to duplicate blog post';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [push]);

    const exportBlog = useCallback(async (format: "json" | "pdf"): Promise<void> => {
        setSaving(true);
        try {
            await blogService.exportBlog(format);
            push({ message: `Blog exported successfully as ${format.toUpperCase()}!`, type: 'success' });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export blog';
            push({ message: errorMessage, type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [push]);

    const refreshBlog = useCallback(async () => {
        await fetchBlog();
    }, [fetchBlog]);

    return {
        blog,
        loading,
        saving,
        uploadProgress,
        error,
        fetchBlog,
        updateBlog,
        updateBlogWithMedia,
        toggleActive,
        duplicateBlogPost,
        exportBlog,
        refreshBlog,
    };
};
