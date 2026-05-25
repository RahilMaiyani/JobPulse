import { useQuery } from '@tanstack/react-query';
import { getCandidateStats, getAdminStats } from '../services/dashboardService';

export const useCandidateDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'candidate'],
    queryFn: getCandidateStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: getAdminStats,
    staleTime: 1000 * 60 * 5,
  });
};
