import api from './api';

export const interviewService = {
  scheduleInterview: async (data) => {
    const response = await api.post('/interviews/schedule', data);
    return response.data;
  },
  getInterviewsByJob: async (jobId) => {
    const response = await api.get(`/interviews/job/${jobId}`);
    return response.data.interviews;
  },
  getInterviewByApplication: async (applicationId) => {
    const response = await api.get(`/interviews/application/${applicationId}`);
    return response.data.interview;
  }
};
