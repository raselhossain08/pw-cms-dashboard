import axios from 'axios';
import {
    Integration,
    CreateIntegrationDto,
    UpdateIntegrationDto,
    IntegrationConfigDto,
    IntegrationStats,
    IntegrationQuery,
    IntegrationTestResult,
} from '@/types/integrations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: `${API_URL}/integrations`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const integrationsService = {
    // Get all integrations with optional filters
    async getAll(query?: IntegrationQuery): Promise<Integration[]> {
        const params = new URLSearchParams();
        if (query?.search) params.append('search', query.search);
        if (query?.category) params.append('category', query.category);
        if (query?.status) params.append('status', query.status);

        const { data } = await api.get<Integration[]>(`?${params.toString()}`);
        return data;
    },

    // Get integration stats
    async getStats(): Promise<IntegrationStats> {
        const { data } = await api.get<IntegrationStats>('/stats');
        return data;
    },

    // Get single integration by ID
    async getById(id: string): Promise<Integration> {
        const { data } = await api.get<Integration>(`/${id}`);
        return data;
    },

    // Get integration by slug
    async getBySlug(slug: string): Promise<Integration> {
        const { data } = await api.get<Integration>(`/slug/${slug}`);
        return data;
    },

    // Create new integration
    async create(dto: CreateIntegrationDto): Promise<Integration> {
        const { data } = await api.post<Integration>('/', dto);
        return data;
    },

    // Update integration
    async update(id: string, dto: UpdateIntegrationDto): Promise<Integration> {
        const { data } = await api.put<Integration>(`/${id}`, dto);
        return data;
    },

    // Update integration config
    async updateConfig(
        id: string,
        config: IntegrationConfigDto
    ): Promise<Integration> {
        const { data } = await api.patch<Integration>(`/${id}/config`, config);
        return data;
    },

    // Connect integration
    async connect(id: string): Promise<Integration> {
        const { data } = await api.post<Integration>(`/${id}/connect`);
        return data;
    },

    // Disconnect integration
    async disconnect(id: string): Promise<Integration> {
        const { data } = await api.post<Integration>(`/${id}/disconnect`);
        return data;
    },

    // Test connection
    async testConnection(id: string): Promise<IntegrationTestResult> {
        const { data } = await api.post<IntegrationTestResult>(`/${id}/test`);
        return data;
    },

    // Delete integration
    async delete(id: string): Promise<void> {
        await api.delete(`/${id}`);
    },

    // Seed initial data (admin only)
    async seed(): Promise<void> {
        await api.post('/seed');
    },
};
