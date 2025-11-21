import { useQuery } from '@tanstack/react-query';
import { systemStatusApi, SystemStatus } from '@/lib/api/system-status.api';

export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: () => systemStatusApi.getStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 3,
  });
};