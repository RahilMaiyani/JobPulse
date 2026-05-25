import api from './api';

export const getProfile = async (userId) => {
  const res = await api.get(`/users/${userId}/profile`);
  return res.data.user;
};

export const getResumes = async () => {
  const res = await api.get('/resumes');
  return res.data.resumes || [];
};

export const updateProfile = async (data) => {
  const res = await api.put('/users/profile', data);
  return res.data;
};

export const uploadResume = async (formData) => {
  const res = await api.post('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteResume = async (resumeId) => {
  const res = await api.delete(`/resumes/${resumeId}`);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.put('/users/reset-password', data);
  return res.data;
};
