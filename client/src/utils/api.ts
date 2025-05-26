import axios from 'axios';
import type { LoginForm, RegisterForm, User, CreatePostForm } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const token = authStore?.state?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginForm) => api.post('/auth/login', data),
  register: (data: RegisterForm) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const blogApi = {
  getPosts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  }) => api.get('/blog', { params }),
  
  getPost: (slug: string) => api.get(`/blog/${slug}`),
  
  createPost: (data: CreatePostForm) => api.post('/blog', data),
  
  updatePost: (id: string, data: Partial<CreatePostForm>) => 
    api.put(`/blog/${id}`, data),
  
  deletePost: (id: string) => api.delete(`/blog/${id}`),
  
  likePost: (id: string) => api.post(`/blog/${id}/like`),
  
  addComment: (id: string, content: string) => 
    api.post(`/blog/${id}/comments`, { content }),
  
  getUserPosts: (username: string, params?: {
    page?: number;
    limit?: number;
  }) => api.get(`/blog/user/${username}`, { params }),
};

export const userApi = {
  getProfile: (username: string) => api.get(`/user/${username}`),
  
  updateProfile: (data: Partial<User>) => api.put('/user/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/user/password', { currentPassword, newPassword }),
  
  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get('/user', { params }),
};

export default api;