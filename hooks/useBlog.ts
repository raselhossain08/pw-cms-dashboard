import { useState, useEffect } from 'react';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/lib/types/blog';
import { useToast } from '@/context/ToastContext';

export const useBlog = () => {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { push } = useToast();

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        push({ message, type });
    };

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const data = await blogService.getBlog();
            setBlog(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch blog', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateBlogWithMedia = async (formData: FormData) => {
        try {
            setLoading(true);
            setUploadProgress(0);

            const data = await blogService.updateBlogWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            );

            setBlog(data);
            setUploadProgress(100);

            showToast('Blog updated successfully', 'success');

            setTimeout(() => setUploadProgress(0), 1000);
        } catch (error: any) {
            showToast(error.message || 'Failed to update blog', 'error');
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async () => {
        try {
            const data = await blogService.toggleActive();
            setBlog(data);
            showToast(`Blog is now ${data.isActive ? 'active' : 'inactive'}`, 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to toggle blog status', 'error');
        }
    };

    useEffect(() => {
        fetchBlog();
    }, []);

    return {
        blog,
        loading,
        uploadProgress,
        fetchBlog,
        updateBlogWithMedia,
        toggleActive,
    };
};
