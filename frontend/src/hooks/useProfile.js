import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, getResumes, updateProfile, uploadResume, deleteResume, resetPassword } from '../services/profileService';
import toast from 'react-hot-toast';

export const useProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useResumes = () => {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: getResumes,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      toast.success('Resume uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to upload resume');
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      toast.success('Resume deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete resume');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    },
  });
};
