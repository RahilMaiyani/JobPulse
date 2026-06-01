import api from './api';

export const getUsers = async () => {
  const res = await api.get('/users');
  return res.data.users || [];
};

export const createUser = async (data) => {
  const res = await api.post('/users', data);
  return res.data;
};

export const toggleUserStatus = async ({ userId }) => {
  const res = await api.patch(`/users/${userId}/toggle-status`);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};
