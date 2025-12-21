import axios from '@/lib/axios';
import type {
    ActivityLog,
    ErrorLog,
    AiLog,
    ChatLog,
    SystemLog,
    LogsResponse,
    ActivityStats,
    ErrorStats,
    AiStats,
    ChatStats,
    SystemStats,
    LogFilters,
} from '@/types/activity-logs';

const BASE_URL = '/activity-logs';

export const activityLogsService = {
    // ==================== ACTIVITY LOGS ====================
    async getActivityLogs(filters?: LogFilters): Promise<LogsResponse<ActivityLog>> {
        const res = await axios.get<LogsResponse<ActivityLog>>(`${BASE_URL}/activity`, { params: filters as any });
        return res.data;
    },

    async getActivityStats(): Promise<ActivityStats> {
        const res = await axios.get<ActivityStats>(`${BASE_URL}/activity/stats`);
        return res.data;
    },

    // ==================== ERROR LOGS ====================
    async getErrorLogs(filters?: LogFilters): Promise<LogsResponse<ErrorLog>> {
        const res = await axios.get<LogsResponse<ErrorLog>>(`${BASE_URL}/errors`, { params: filters as any });
        return res.data;
    },

    async getErrorStats(): Promise<ErrorStats> {
        const res = await axios.get<ErrorStats>(`${BASE_URL}/errors/stats`);
        return res.data;
    },

    // ==================== AI LOGS ====================
    async getAiLogs(filters?: LogFilters): Promise<LogsResponse<AiLog>> {
        const res = await axios.get<LogsResponse<AiLog>>(`${BASE_URL}/ai`, { params: filters as any });
        return res.data;
    },

    async getAiStats(): Promise<AiStats> {
        const res = await axios.get<AiStats>(`${BASE_URL}/ai/stats`);
        return res.data;
    },

    // ==================== CHAT LOGS ====================
    async getChatLogs(filters?: LogFilters): Promise<LogsResponse<ChatLog>> {
        const res = await axios.get<LogsResponse<ChatLog>>(`${BASE_URL}/chat`, { params: filters as any });
        return res.data;
    },

    async getChatStats(): Promise<ChatStats> {
        const res = await axios.get<ChatStats>(`${BASE_URL}/chat/stats`);
        return res.data;
    },

    // ==================== SYSTEM LOGS ====================
    async getSystemLogs(filters?: LogFilters): Promise<LogsResponse<SystemLog>> {
        const res = await axios.get<LogsResponse<SystemLog>>(`${BASE_URL}/system`, { params: filters as any });
        return res.data;
    },

    async getSystemStats(): Promise<SystemStats> {
        const res = await axios.get<SystemStats>(`${BASE_URL}/system/stats`);
        return res.data;
    },

    // ==================== EXPORT ====================
    async exportLogs(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', filters?: LogFilters) {
        const res = await axios.get<unknown>(`${BASE_URL}/export/${type}`, {
            params: filters as any,
        });
        return res.data;
    },

    // ==================== LOG ACTIONS ====================
    async getLogById(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', id: string) {
        const res = await axios.get(`${BASE_URL}/${type}/${id}`);
        return res.data;
    },

    async markErrorAsResolved(id: string, solution?: string) {
        const res = await axios.post(`${BASE_URL}/errors/${id}/resolve`, { solution });
        return res.data;
    },

    async markErrorAsUnresolved(id: string) {
        const res = await axios.post(`${BASE_URL}/errors/${id}/unresolve`);
        return res.data;
    },

    async bulkMarkErrorsAsResolved(ids: string[], solution?: string) {
        const res = await axios.post(`${BASE_URL}/errors/bulk-resolve`, { ids, solution });
        return res.data;
    },

    async deleteLog(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', id: string) {
        const res = await axios.delete(`${BASE_URL}/${type}/${id}`);
        return res.data;
    },

    async bulkDeleteLogs(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', ids: string[]) {
        const res = await axios.post(`${BASE_URL}/${type}/bulk-delete`, { ids });
        return res.data;
    },
};
