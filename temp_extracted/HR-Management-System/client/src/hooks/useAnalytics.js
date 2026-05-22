import { useQuery } from '@tanstack/react-query';
import API from '../api/axios'; 

export const usePunctualityAnalytics = (filters) => {
  return useQuery({
    queryKey: ['punctualityAnalytics', filters],
    queryFn: async () => {
      const { data } = await API.get('/analytics/punctuality', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000, 
  });
};