import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { applyLeave,
  getActiveLeaves,
  getAllLeaves, 
  getMyLeaves, 
  updateLeaveRequest, 
  getPendingLeavesCount,
  getRecentLeaves
 } from "../api/leaveApi";

export const useApplyLeave = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: applyLeave,

    onSuccess: () => {
      toast.success("Leave applied successfully");
      qc.invalidateQueries(["myLeaves"]);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.msg || "Failed to apply leave");
    }
  });
};

export const useMyLeaves = () => {
  return useQuery({
    queryKey: ["myLeaves"],
    queryFn: getMyLeaves,
  });
};

export const useAllLeaves = () => {
  return useQuery({
    queryKey: ["allLeaves"],
    queryFn: getAllLeaves,
  });
};

export const useRecentLeaves = () => {
  return useQuery({
    queryKey : ["recentLeaves"],
    queryFn : getRecentLeaves
  });
};

export const useUpdateLeave = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateLeaveRequest,

    onSuccess: (data) => {
      toast.success(`Leave ${data.status} successfully`);

      // 2. Clear all related caches
      qc.invalidateQueries(["allLeaves"]);
      qc.invalidateQueries(["activeLeaves"]);
      qc.invalidateQueries(["myLeaves"]);
      
      // 3. IMPORTANT: Clear the pending count if you have a sidebar badge
      qc.invalidateQueries(["pendingLeavesCount"]);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.msg || "Failed to update leave");
    }
  });
};

export const useActiveLeaves = () => {
  return useQuery({
    queryKey: ["activeLeaves"], 
    queryFn: getActiveLeaves
  });
};

export const usePendingLeavesCount = (enabled = false) =>
  useQuery({
    queryKey: ["pendingLeavesCount"],
    queryFn: getPendingLeavesCount,
    enabled,
    refetchInterval: enabled ? 10000 : false,
});