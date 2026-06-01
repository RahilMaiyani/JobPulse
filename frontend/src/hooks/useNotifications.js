import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old) => 
        old ? old.filter(n => n.id !== notificationId) : []
      );
      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old) => 
        old ? old.map(n => ({ ...n, is_read: true })) : []
      );
      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
