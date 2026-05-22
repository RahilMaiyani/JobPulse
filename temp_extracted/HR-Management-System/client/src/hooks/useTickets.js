import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createTicket, 
  getMyTickets, 
  getAllTickets, 
  addReply, 
  updateTicketStatus 
} from "../api/ticketApi";

export const useCreateTicket = (onSuccess, onError) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      onSuccess?.(data);
    },
    onError
  });
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ["my-tickets"],
    queryFn: getMyTickets,
  });
};

export const useAllTickets = () => {
  return useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
  });
};

export const useAddReply = (onSuccess, onError) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: addReply,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["all-tickets"] });
      onSuccess?.(data);
    },
    onError
  });
};

export const useUpdateTicketStatus = (onSuccess, onError) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["all-tickets"] });
      onSuccess?.(data);
    },
    onError
  });
};

// Add/Replace at the bottom of client/src/hooks/useTickets.js

export const useActiveTicketCount = (isAdmin) => {
  // We call both hooks but only "enable" the one we need
  const myTickets = useQuery({
    queryKey: ["my-tickets"],
    queryFn: getMyTickets,
    enabled: !isAdmin,
  });

  const allTickets = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    enabled: isAdmin,
  });

  const targetData = isAdmin ? allTickets.data : myTickets.data;

  if (!targetData || !Array.isArray(targetData)) return 0;

  return targetData.filter(
    (ticket) => ticket.status === "Open" || ticket.status === "In-Progress"
  ).length;
};
