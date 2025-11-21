import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

const mediaApi = {
  async getMediaCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/upload/files?limit=1');
    return { count: response.data.total || 0 };
  }
};

export const useMediaCount = () => {
  return useQuery({
    queryKey: ['media-count'],
    queryFn: () => mediaApi.getMediaCount(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
};