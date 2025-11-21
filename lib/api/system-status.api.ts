import { apiClient } from './client';

export interface SystemStatus {
  storage: {
    used: string;
    total: string;
    percentage: number;
  };
  performance: {
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    cpuUsage: number;
    memoryUsage: number;
    uptime: string;
  };
  health: {
    status: 'healthy' | 'warning' | 'error';
    lastChecked: string;
  };
}

export const systemStatusApi = {
  async getStatus(): Promise<SystemStatus> {
    const response = await apiClient.get('/system-status');
    return response.data;
  },
};