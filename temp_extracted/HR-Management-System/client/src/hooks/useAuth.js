import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/authApi";

export const useLogin = (onSuccess, onError) => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess,
    onError
  });
};