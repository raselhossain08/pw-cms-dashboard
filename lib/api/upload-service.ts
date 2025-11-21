import { apiClient } from './client';

export interface UploadResponse {
    url: string;
    originalName: string;
    size: number;
    mimeType: string;
}

export class UploadService {
    /**
     * Upload a single image with progress tracking and folder specification
     */
    async uploadImage(
        file: File,
        onProgress?: (progress: number) => void,
        folder: string = 'general'
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        // Add folder as query parameter
        const url = `/upload/image?folder=${encodeURIComponent(folder)}`;
        
        console.log(`📤 Uploading ${file.name} to folder: ${folder}`);

        const response = await apiClient.post<UploadResponse>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });

        console.log(`✅ Upload complete: ${response.data.url}`);
        return response.data;
    }

    /**
     * Upload multiple images with folder specification
     */
    async uploadMultipleImages(
        files: File[],
        onProgress?: (progress: number) => void,
        folder: string = 'general'
    ): Promise<{ files: UploadResponse[] }> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        // Add folder as query parameter
        const url = `/upload/images?folder=${encodeURIComponent(folder)}`;
        
        console.log(`📤 Uploading ${files.length} files to folder: ${folder}`);

        const response = await apiClient.post<{ files: UploadResponse[] }>(
            url,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(progress);
                    }
                },
            }
        );

        console.log(`✅ Multiple upload complete: ${response.data.files.length} files`);
        return response.data;
    }

    /**
     * Get full URL for an uploaded image
     */
    getImageUrl(path: string): string {
        if (!path || path.length === 0) {
            console.warn('Empty path provided to getImageUrl');
            return '';
        }
        
        // If it's already a full URL (HTTP/HTTPS or data URL), return as-is
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return path;
        }

        // Get the backend base URL (without /api suffix)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const backendBaseUrl = apiUrl.replace('/api', '');

        // Normalize the path to ensure proper format
        let normalizedPath = path;
        
        if (path.startsWith('/uploads/')) {
            // Path is already in correct format (e.g., "/uploads/images/123-logo.webp")
            normalizedPath = path;
        } else if (path.startsWith('uploads/')) {
            // Missing leading slash (e.g., "uploads/images/123-logo.webp")
            normalizedPath = `/${path}`;
        } else if (path.startsWith('/')) {
            // Legacy absolute path format (e.g., "/logo.svg")
            // For backward compatibility
            normalizedPath = path;
        } else {
            // Relative path - assume it should be in uploads/images/
            normalizedPath = `/uploads/images/${path}`;
        }

        // Construct full URL for static files
        const fullUrl = `${backendBaseUrl}${normalizedPath}`;

        // Debug log for development (only in development mode)
        if (process.env.NODE_ENV === 'development') {
            console.log('Image URL Generation:', {
                originalPath: path,
                apiUrl,
                backendBaseUrl,
                normalizedPath,
                fullUrl,
                pathType: path.startsWith('/uploads/') ? 'correct' : 
                         path.startsWith('uploads/') ? 'missing-slash' :
                         path.startsWith('/') ? 'legacy' : 'relative'
            });
        }

        return fullUrl;
    }    /**
     * Check if the backend upload service is available
     */
    async checkHealth(): Promise<{ available: boolean; message: string }> {
        try {
            const response = await apiClient.get('/health');
            return {
                available: true,
                message: 'Backend is available'
            };
        } catch (error: any) {
            return {
                available: false,
                message: `Backend unavailable: ${error.message || 'Connection failed'}`
            };
        }
    }

    /**
     * Test if an image URL is accessible
     */
    async testImageUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('Image URL test failed:', { url, error: error instanceof Error ? error.message : 'Unknown error' });
            return false;
        }
    }

    /**
     * Validate and fix image path
     */
    validateAndFixPath(path: string): { 
        isValid: boolean; 
        correctedPath: string; 
        suggestions: string[]; 
        issues: string[] 
    } {
        const issues: string[] = [];
        const suggestions: string[] = [];
        let correctedPath = path;

        if (!path || path.trim().length === 0) {
            return {
                isValid: false,
                correctedPath: '',
                suggestions: ['Upload a new image'],
                issues: ['Empty path provided']
            };
        }

        // Check for common issues
        if (path.includes(' ')) {
            issues.push('Path contains spaces');
            correctedPath = path.replace(/\s+/g, '-');
            suggestions.push('Spaces in filenames should be replaced with hyphens');
        }

        if (path.includes('../') || path.includes('..\\\\')) {
            issues.push('Path traversal detected');
            suggestions.push('Use absolute paths or relative paths from uploads directory');
        }

        if (!path.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
            issues.push('No valid image extension detected');
            suggestions.push('Ensure the file has a valid image extension (.jpg, .png, .webp, etc.)');
        }

        // Validate URL format
        if (path.startsWith('http')) {
            try {
                new URL(path);
            } catch {
                issues.push('Invalid URL format');
                suggestions.push('Check the URL syntax');
            }
        }

        return {
            isValid: issues.length === 0,
            correctedPath,
            suggestions,
            issues
        };
    }
}

export const uploadService = new UploadService();
