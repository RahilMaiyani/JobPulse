import API from "./axios";

export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};