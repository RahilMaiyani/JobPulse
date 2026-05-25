import api from './api';

export const getJobs = async () => {
  const res = await api.get('/jobs');
  return res.data.jobs || [];
};

export const getActiveJobs = async () => {
  const res = await api.get('/jobs');
  return (res.data.jobs || []).filter(j => j.status === 'active' && j.is_published);
};

export const deleteJob = async (id) => {
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
};

export const toggleJobStatus = async ({ id, newStatus }) => {
  const res = await api.put(`/jobs/${id}`, { status: newStatus });
  return newStatus;
};

export const publishJobResults = async (jobId) => {
  const res = await api.post(`/quizzes/job/${jobId}/publish`);
  return res.data;
};
