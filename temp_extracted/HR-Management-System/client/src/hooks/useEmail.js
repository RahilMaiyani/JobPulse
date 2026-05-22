import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sendEmail } from "../api/emailApi";

export const useSendEmail = () => {
  return useMutation({
    mutationFn: sendEmail,
    onSuccess : () => {
        toast.success("Email sent successfully")
    },
    onError : (error) => {
      const errorMsg = error.response?.data?.msg || "Failed to send email";
      toast.error(errorMsg)
    }
  });
}