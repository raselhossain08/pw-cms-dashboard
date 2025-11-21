// src/lib/api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds for file uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Enhanced error handling
        let message = 'An error occurred';

        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            message = 'Cannot connect to backend server. Make sure the server is running.';
            error.code = 'NETWORK_ERROR';
        } else if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }

        console.error('API Error:', {
            status: error.response?.status,
            message,
            url: error.config?.url,
        });

        // Preserve original error but enhance message
        error.message = message;
        return Promise.reject(error);
    }
);