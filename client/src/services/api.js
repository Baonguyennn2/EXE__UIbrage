import axios from 'axios';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://exe-uibrage.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor to handle 401 errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear user data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // We can't use useNavigate here as it's not a React component,
      // so we use window.location.href
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

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

export const metadataService = {
  getCategories: () => api.get('/categories'),
  getTags: () => api.get('/tags'),
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (email, code) => api.post('/auth/verify-email', { email, code }),
  resendCode: (email) => api.post('/auth/resend-code', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, code, newPassword) => api.post('/auth/reset-password', { email, code, newPassword }),
};

export const userService = {
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (assetId) => api.post('/users/wishlist/toggle', { assetId }),
};

export const postService = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadImage: (formData) => api.post('/posts/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
};

export default api;
