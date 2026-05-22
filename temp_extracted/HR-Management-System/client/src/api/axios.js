import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor to append the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if(error.response.data.msg === "Session invalidated by another login") {
        window.location.href = '/?session=invalidated';
        return Promise.reject(error);
      }

      window.location.href = '/?session=expired';
    }
    return Promise.reject(error);
  }
);

export default API;