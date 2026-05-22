import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser, updateUser, createUser } from "../api/userApi";
import toast from "react-hot-toast";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    staleTime: 1000 * 60 * 5 
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully")
      queryClient.invalidateQueries(["users"]);
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User added and Welcome Email successfully")
      queryClient.invalidateQueries(["users"]);
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success("User updated successfully")
      queryClient.invalidateQueries(["users"]);
    }
  });
};