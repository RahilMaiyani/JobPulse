import API from "./axios";

export const getAnnouncements = async () => {
  const res = await API.get("/announcements");
  return res.data;
};

export const createAnnouncement = async (announcementData) => {
  const res = await API.post("/announcements", announcementData);
  return res.data;
};

export const updateAnnouncement = async ({ id, data }) => {
  const res = await API.put(`/announcements/${id}`, data);
  return res.data;
};

export const archiveAnnouncement = async (id) => {
  const res = await API.put(`/announcements/${id}/archive`);
  return res.data;
};