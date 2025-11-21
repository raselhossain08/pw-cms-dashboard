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