import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkIn, checkOut, todayAttn, getAllAttendance, getFilterAttendance, getUserAttendance, getAttendanceHistory } from "../api/attendanceApi";

export const useCheckIn = (onSuccess, onError) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: checkIn,

    onSuccess: (data) => {
      qc.invalidateQueries(["today-attendance"]);
      onSuccess?.(data);
    },

    onError
  });
};

export const useCheckOut = (onSuccess, onError) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: checkOut,

    onSuccess: (data) => {
      qc.invalidateQueries(["today-attendance"]);
      onSuccess?.(data);
    },

    onError
  });
};

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ["today-attendance"],
    queryFn: todayAttn,
    staleTime: 0
  });
};

export const useAttendanceHistory = (selectedMonth, selectedYear, page) => {
  return useQuery({
    queryKey: ["my-attendance", selectedMonth, selectedYear, page],
    queryFn: () => getAttendanceHistory(selectedMonth, selectedYear, page),
    keepPreviousData: true,
    enabled: !!selectedMonth && !!selectedYear 
  });
};

export const useAllAttendance = () => {
  return useQuery({
    queryKey : ["all-attendance"],
    queryFn : getAllAttendance,
  })
}

export const useFilterAttendance = () => {
  return useQuery({
    queryKey : ["attendance-filters"],
    queryFn : getFilterAttendance,
  });
};

export const useUserAttendance = (id) => {
  return useQuery({
    queryKey : ["user-attendance", id],
    queryFn : () => getUserAttendance(id),
    enabled: !!id && id !== 0, 
    retry: false,
  });
};