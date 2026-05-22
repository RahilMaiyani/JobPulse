import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnnouncements, createAnnouncement, updateAnnouncement, archiveAnnouncement } from "../api/announcementApi";
import toast from "react-hot-toast";

export const useAnnouncements = () => {
  return useQuery({ queryKey: ["announcements"], queryFn: getAnnouncements });
};

export const useCreateAnnouncement = (onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Broadcast successful!");
      if (onSuccess) onSuccess();
    }
  });
};

export const useUpdateAnnouncement = (onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Broadcast updated!");
      if (onSuccess) onSuccess();
    }
  });
};

export const useArchiveAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Moved to archive.");
    }
  });
};