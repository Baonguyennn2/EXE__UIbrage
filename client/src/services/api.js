import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://exe-uibrage.onrender.com/api');

const api = axios.create({
  baseURL: API_URL,
});

// Socket.io instance
export const socket = io(API_URL.replace('/api', ''), {
  autoConnect: false
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getCreators: () => api.get('/admin/creators'),
  getPending: () => api.get('/admin/pending-assets'),
  approve: (id, data) => api.patch(`/admin/approve/${id}`, data),
  deleteAsset: (id) => api.delete(`/admin/assets/${id}`),
};

export const userService = {
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProfile: (username) => api.get(`/users/profile/${username}`),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (assetId) => api.post('/users/wishlist/toggle', { assetId }),
  getEarnings: () => api.get('/users/earnings'),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (data) => api.post('/messages/send', data),
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const metadataService = {
  getCategories: () => api.get('/categories'),
  getTags: () => api.get('/tags'),
};

export const commentService = {
  getByAssetId: (assetId) => api.get(`/comments/asset/${assetId}`),
  add: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const postService = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  like: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  uploadImage: (formData) => api.post('/posts/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
