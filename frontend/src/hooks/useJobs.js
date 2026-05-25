import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getActiveJobs, deleteJob, toggleJobStatus, publishJobResults } from '../services/jobService';
import toast from 'react-hot-toast';

export const useJobs = () => {
  return useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: getJobs,
    staleTime: 1000 * 60 * 5,
  });
};

export const useActiveJobs = () => {
  return useQuery({
    queryKey: ['jobs', 'active'],
    queryFn: getActiveJobs,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: () => {
      toast.error('Failed to delete job');
    },
  });
};

export const useToggleJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleJobStatus,
    onSuccess: (newStatus) => {
      toast.success(`Job marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });
};

export const usePublishJobResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishJobResults,
    onSuccess: (data) => {
      toast.success(data.message || 'Results published successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to publish results');
    },
  });
};
