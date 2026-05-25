import api from './api';

export const getApplications = async () => {
  const res = await api.get('/applications');
  return res.data.applications || [];
};

export const applyForJob = async (jobId) => {
  const res = await api.post(`/applications/job/${jobId}`);
  return res.data;
};

export const revokeApplication = async (applicationId) => {
  const res = await api.delete(`/applications/${applicationId}/revoke`);
  return res.data;
};

export const getUserApplications = async (userId) => {
  const res = await api.get(`/applications/user/${userId}`);
  return res.data.applications || [];
};

export const getMyApplications = async () => {
  const res = await api.get('/applications/my-applications');
  return res.data.applications || [];
};
