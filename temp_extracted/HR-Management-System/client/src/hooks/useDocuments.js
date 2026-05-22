import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  uploadDocumentApi,
  getMyDocumentsApi,
  getUserDocumentsApi,
  deleteDocumentApi,
  updateDocumentApi,
} from "../api/documentApi.js";
import toast from "react-hot-toast";

export const useDocuments = () => {
  const queryClient = useQueryClient();

  const {
    data: documentsData,
    isLoading : isLoadingDocuments,
    error: documentsError,
    refetch :refetchDocuments,
    } = useQuery({
      queryKey: ["myDocuments"],
      queryFn: getMyDocumentsApi,
      select: (data) => data.data,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocumentApi,
    onSuccess: (data) => {
      toast.success(data.data.msg || "Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["myDocuments"] });
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || error.message;
      toast.error(errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocumentApi,
    onSuccess: (data) => {
      toast.success(data.data.msg || "Document deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["myDocuments"] });
      // console.log(data.data)
      queryClient.invalidateQueries({ queryKey: ["userDocuments", data.data.userId] });
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || error.message;
      toast.error(errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDocumentApi(id, data),
    onSuccess: (data) => {
      toast.success(data.data.msg || "Document updated successfully");
      queryClient.invalidateQueries({ queryKey: ["myDocuments"] });
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || error.message;
      toast.error(errorMsg);
    },
  });

  return {
    documents: documentsData?.documents || [],
    isLoadingDocuments,
    documentsError,
    refetchDocuments,

    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,

    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    updateDocument: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

 
export const useUserDocuments = (userId) => {
  const {
    data: documentsData,
    isLoading: isLoadingUserDocuments,
    error: userDocumentsError,
  } = useQuery({
    queryKey: ["userDocuments", userId],
    queryFn: () => getUserDocumentsApi(userId),
    select: (data) => data.data,
    enabled: !!userId,
});

  return {
    documents: documentsData?.documents || [],
    isLoadingUserDocuments,
    userDocumentsError,
  };

};
