import api from './api';

export const getCandidateStats = async () => {
  const res = await api.get('/dashboard/candidate');
  return res.data;
};

export const getAdminStats = async () => {
  const res = await api.get('/dashboard/admin');
  return res.data;
};
