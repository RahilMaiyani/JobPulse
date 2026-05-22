import API from "./axios";

export const getUsers = async (params) => {
  const res = await API.get("/users", { params });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/users/${id}`);
  return res.data;
};

export const createUser = async (data) => {
  const res = await API.post("/users", data);
  return res.data;
};

export const updateUser = async ({ id, data }) => {
  const res = await API.put(`/users/${id}`, data);
  return res.data;
};