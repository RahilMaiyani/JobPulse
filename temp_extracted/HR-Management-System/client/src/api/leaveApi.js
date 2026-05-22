import API from "./axios";

export const applyLeave = async (data) => {
    const res = await API.post("/leaves", data);
    return res.data;
};

export const  getMyLeaves = async () => {
    const res = await API.get("/leaves/me");
    return res.data;
};

export const getAllLeaves = async () => {
    const res = await API.get("/leaves");
    return res.data;
};

export const getRecentLeaves = async () => {
    const res = await API.get("/leaves/recent");
    return res.data;
};

export const updateLeaveRequest = async ({ id, status, adminComment }) => {
  const response = await API.patch(`/leaves/${id}`, {
    status,
    adminComment
  });
  return response.data;
};

export const getActiveLeaves = async () => {
    const { data } = await API.get("/leaves/active");
    return data;
};

export const getPendingLeavesCount =  async () => {
    const { data } = await API.get("/leaves/pending-count");
    return data.count;
};