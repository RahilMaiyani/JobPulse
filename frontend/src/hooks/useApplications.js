import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, applyForJob, revokeApplication, getUserApplications, getMyApplications, getJobApplications } from '../services/applicationService';
import toast from 'react-hot-toast';

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUserApplications = (userId) => {
  return useQuery({
    queryKey: ['applications', 'user', userId],
    queryFn: () => getUserApplications(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['applications', 'my'],
    queryFn: getMyApplications,
    staleTime: 1000 * 60 * 5,
  });
};

export const useApplicationsForJob = (jobId) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => getJobApplications(jobId),
    enabled: !!jobId,
  });
};

export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyForJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Successfully applied for job');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to apply for job');
    },
  });
};

export const useRevokeApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeApplication,
    onSuccess: () => {
      toast.success('Application revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: () => {
      toast.error('Failed to revoke application');
    },
  });
};
