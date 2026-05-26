import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, toggleUserStatus } from '../services/userService';
import toast from 'react-hot-toast';

export const useUsers = (currentUserId) => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const data = await getUsers();
      return data.filter(u => u.id !== currentUserId);
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateUser = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('User created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to create user');
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (data, variables) => {
      toast.success(`User ${variables.action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (err, variables) => {
      toast.error(err.response?.data?.error || `Failed to ${variables.action} user`);
    },
  });
};
