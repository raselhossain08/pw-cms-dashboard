import { useCallback } from 'react';
import { useUploadStore } from '@/lib/store/upload-store';
import { toast } from 'sonner';

export const useImageUpload = (key: string, folder: string = 'general') => {
    const { uploads, uploadImage, uploadMultipleImages, clearUpload } = useUploadStore();
    const uploadState = uploads[key] || { progress: 0, status: 'idle' };

    const upload = useCallback(
        async (file: File) => {
            try {
                console.log(`📤 Uploading file: ${file.name} to folder: ${folder}`);
                const result = await uploadImage(key, file, folder);
                console.log(`✅ Upload successful: ${result.url}`);
                toast.success('Image uploaded successfully');
                return result;
            } catch (error: any) {
                console.error(`❌ Upload failed for ${file.name}:`, error);
                toast.error(error.message || 'Failed to upload image');
                throw error;
            }
        },
        [key, uploadImage, folder]
    );

    const uploadMultiple = useCallback(
        async (files: File[]) => {
            try {
                console.log(`📤 Uploading ${files.length} files to folder: ${folder}`);
                const results = await uploadMultipleImages(key, files, folder);
                console.log(`✅ Multiple upload successful: ${results.length} files`);
                toast.success(`${results.length} images uploaded successfully`);
                return results;
            } catch (error: any) {
                console.error(`❌ Multiple upload failed:`, error);
                toast.error(error.message || 'Failed to upload images');
                throw error;
            }
        },
        [key, uploadMultipleImages, folder]
    );

    const clear = useCallback(() => {
        clearUpload(key);
    }, [key, clearUpload]);

    return {
        upload,
        uploadMultiple,
        clear,
        progress: uploadState.progress,
        status: uploadState.status,
        error: uploadState.error,
        result: uploadState.result,
        isUploading: uploadState.status === 'uploading',
        isSuccess: uploadState.status === 'success',
        isError: uploadState.status === 'error',
    };
};
