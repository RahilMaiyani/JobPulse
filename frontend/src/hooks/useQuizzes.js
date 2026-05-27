import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useTestInfo = (applicationId) => {
  return useQuery({
    queryKey: ['test-info', applicationId],
    queryFn: async () => {
      const response = await api.get(`/quizzes/application/${applicationId}/test-info`);
      return response.data;
    },
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuizForJob = (jobId) => {
  return useQuery({
    queryKey: ['job-quiz', jobId],
    queryFn: async () => {
      const response = await api.get(`/quizzes/job/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5,
  });
};
