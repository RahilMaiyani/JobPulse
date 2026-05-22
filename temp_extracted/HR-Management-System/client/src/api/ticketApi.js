import API from "./axios";

export const createTicket = async (ticketData) => {
  const res = await API.post("/tickets", ticketData);
  return res.data;
};

export const getMyTickets = async () => {
  const res = await API.get("/tickets/my");
  return res.data;
};

export const getAllTickets = async () => {
  const res = await API.get("/tickets/all");
  return res.data;
};

export const addReply = async ({ id, message, userName }) => {
  const res = await API.post(`/tickets/${id}/reply`, { message, userName });
  return res.data;
};

export const updateTicketStatus = async ({ id, status }) => {
  const res = await API.patch(`/tickets/${id}/status`, { status });
  return res.data;
};

export const useActiveTicketCount = (isAdmin) => {
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

  // Calculate count: Only "Open" or "In-Progress" tickets
  if (!targetData || !Array.isArray(targetData)) return 0;

  return targetData.filter(
    (ticket) => ticket.status === "Open" || ticket.status === "In-Progress"
  ).length;
};