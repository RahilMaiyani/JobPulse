import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '../services/interviewService';

export const useInterviewsByJob = (jobId) => {
  return useQuery({
    queryKey: ['interviews', jobId],
    queryFn: () => interviewService.getInterviewsByJob(jobId),
    enabled: !!jobId,
  });
};

export const useInterviewByApplication = (applicationId) => {
  return useQuery({
    queryKey: ['interview', applicationId],
    queryFn: () => interviewService.getInterviewByApplication(applicationId),
    enabled: !!applicationId,
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewService.scheduleInterview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });
};
