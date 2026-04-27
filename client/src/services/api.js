import axios from 'axios';

const API_URL = 'https://exe-uibrage.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const assetService = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  add: (data) => api.post('/assets', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const commentService = {
  getByAsset: (assetId) => api.get(`/comments/${assetId}`),
  add: (data) => api.post('/comments', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getPending: () => api.get('/admin/pending-assets'),
  approve: (id, status) => api.patch(`/admin/approve/${id}`, { status }),
  upload: (formData) => api.post('/admin/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (email, code) => api.post('/auth/verify-email', { email, code }),
  resendCode: (email) => api.post('/auth/resend-code', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, code, newPassword) => api.post('/auth/reset-password', { email, code, newPassword }),
};

export default api;
