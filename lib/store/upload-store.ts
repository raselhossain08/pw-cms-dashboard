import { create } from 'zustand';
import { uploadService, UploadResponse } from '@/lib/api/upload-service';

interface UploadState {
    uploads: Record<string, {
        progress: number;
        status: 'idle' | 'uploading' | 'success' | 'error';
        error?: string;
        result?: UploadResponse;
    }>;
    uploadImage: (key: string, file: File, folder?: string) => Promise<UploadResponse>;
    uploadMultipleImages: (key: string, files: File[], folder?: string) => Promise<UploadResponse[]>;
    clearUpload: (key: string) => void;
    resetUploads: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
    uploads: {},

    uploadImage: async (key: string, file: File, folder: string = 'general') => {
        // Validate file before upload
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

        if (!allowedTypes.includes(file.type)) {
            const error = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
            set((state) => ({
                uploads: {
                    ...state.uploads,
                    [key]: {
                        progress: 0,
                        status: 'error',
                        error,
                    }
                }
            }));
            throw new Error(error);
        }

        if (file.size > maxSize) {
            const error = `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`;
            set((state) => ({
                uploads: {
                    ...state.uploads,
                    [key]: {
                        progress: 0,
                        status: 'error',
                        error,
                    }
                }
            }));
            throw new Error(error);
        }

        // Initialize upload state
        set((state) => ({
            uploads: {
                ...state.uploads,
                [key]: {
                    progress: 0,
                    status: 'uploading',
                }
            }
        }));

        try {
            console.log(`🔄 Starting upload for key: ${key}, folder: ${folder}`);
            const result = await uploadService.uploadImage(file, (progress) => {
                set((state) => ({
                    uploads: {
                        ...state.uploads,
                        [key]: {
                            ...state.uploads[key],
                            progress,
                        }
                    }
                }));
            }, folder);

            set((state) => ({
                uploads: {
                    ...state.uploads,
                    [key]: {
                        progress: 100,
                        status: 'success',
                        result,
                    }
                }
            }));

            return result;
        } catch (error: any) {
            let errorMessage = 'Upload failed';

            if (error.response?.status === 413) {
                errorMessage = 'File too large. Maximum size is 5MB.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid file or request.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Check your connection and backend server.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            set((state) => ({
                uploads: {
                    ...state.uploads,
                    [key]: {
                        progress: 0,
                        status: 'error',
                        error: errorMessage,
                    }
                }
            }));
            throw new Error(errorMessage);
        }
    },

    uploadMultipleImages: async (key: string, files: File[], folder: string = 'general') => {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        set((state) => ({
            uploads: {
                ...state.uploads,
                [key]: {
                    progress: 0,
                    status: 'uploading',
                }
            }
        }));

        try {
            console.log(`🔄 Starting multiple upload for key: ${key}, folder: ${folder}`);
            const response = await uploadService.uploadMultipleImages(files, (progress) => {
                set((state) => ({
                    uploads: {
                        ...state.uploads,
                        [key]: {
                            ...state.uploads[key],
                            progress,
                        }
                    }
                }));
            }, folder);

            set((state) => ({
                uploads: {
                    ...state.uploads,
                    [key]: {
                        progress: 100,
                        status: 'success',
                    }
                }
            }));

            return response.files;
        } catch (error: any) {
            let errorMessage = 'Upload failed';

            if (error.response?.status === 413) {
                errorMessage = 'One or more files are too large. Maximum size is 5MB each.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid files or request.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Check your connection and backend server.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            set((state) => ({
                uploads: {
                    ...state.uploads,
                    [key]: {
                        progress: 0,
                        status: 'error',
                        error: errorMessage,
                    }
                }
            }));
            throw new Error(errorMessage);
        }
    },

    clearUpload: (key: string) => {
        set((state) => {
            const { [key]: _, ...rest } = state.uploads;
            return { uploads: rest };
        });
    },

    resetUploads: () => set({ uploads: {} }),
}));
