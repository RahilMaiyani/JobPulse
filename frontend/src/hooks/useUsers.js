import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, toggleUserStatus, deleteUser } from '../services/userService';
import { getProfile } from '../services/profileService';
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

export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ['user', userId, 'profile'],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
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
      
      // Update cache instantly
      queryClient.setQueryData(['admin', 'users'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(user => 
          user.id === variables.userId ? { ...user, is_active: data.is_active } : user
        );
      });

      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (err, variables) => {
      toast.error(err.response?.data?.error || `Failed to ${variables.action} user`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, userId) => {
      toast.success(`User deleted successfully`);
      
      // Remove from cache instantly
      queryClient.setQueryData(['admin', 'users'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter(user => user.id !== userId);
      });

      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || `Failed to delete user`);
    },
  });
};
