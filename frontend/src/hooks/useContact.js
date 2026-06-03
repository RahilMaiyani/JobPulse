import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useContactMessages = () => {
  return useQuery({
    queryKey: ['contactMessages'],
    queryFn: async () => {
      const response = await api.get('/contact');
      return response.data;
    }
  });
};

export const useUnreadContactCount = (enabled = true) => {
  return useQuery({
    queryKey: ['unreadContactCount'],
    queryFn: async () => {
      const response = await api.get('/contact/unread-count');
      return response.data.count;
    },
    enabled: enabled,
    refetchInterval: 60000 // Refetch every minute
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (messageData) => {
      const response = await api.post('/contact', messageData);
      return response.data;
    }
  });
};

export const useArchiveMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.put(`/contact/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadContactCount'] });
    }
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.put(`/contact/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadContactCount'] });
    }
  });
};
