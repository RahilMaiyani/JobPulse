import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useProctoringEvents = (applicationId) => {
  return useQuery({
    queryKey: ['proctoring-events', applicationId],
    queryFn: async () => {
      if (!applicationId) return [];
      const response = await api.get(`/proctoring/events/application/${applicationId}`);
      return response.data.events;
    },
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useForgiveProctoring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId) => {
      const response = await api.post(`/proctoring/forgive/${applicationId}`);
      return response.data;
    },
    onSuccess: (data, applicationId) => {
      // Invalidate queries so UI updates instantly
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['proctoring-events', applicationId] });
    }
  });
};
