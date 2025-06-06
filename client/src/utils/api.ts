import axios from 'axios';
import type { 
  LoginForm, 
  RegisterForm, 
  User, 
  CreatePostForm,
  BookSearchParams,
  BookRecommendationParams,
  CreateBookRecommendationForm 
} from '../types';

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
  
  getPostForEdit: (id: string) => api.get(`/blog/edit/${id}`),
  
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

export const notionApi = {
  getStatus: () => api.get('/notion/status'),
  getAuthUrl: () => api.get('/notion/auth-url'),
  handleCallback: (code: string) => api.post('/notion/callback', { code }),
  disconnect: () => api.delete('/notion/disconnect'),
  exportToNotion: (postId?: string) => 
    api.post('/notion/export', postId ? { postId } : {}),
  importFromNotion: (pageId?: string) => api.post('/notion/import', pageId ? { pageId } : {}),
  getSyncHistory: () => api.get('/notion/sync-history'),
  getPages: () => api.get('/notion/pages'),
  testConnection: () => api.get('/notion/test'),
};

export const bookApi = {
  // 搜索书籍 (Google Books API)
  searchBooks: (params: BookSearchParams) => 
    api.get('/book/search', { params }),
  
  // 获取书籍详情
  getBookDetails: (googleBooksId: string) => 
    api.get(`/book/details/${googleBooksId}`),
  
  // 获取所有书籍推荐
  getRecommendations: (params?: BookRecommendationParams) => 
    api.get('/book', { params }),
  
  // 获取单个书籍推荐
  getRecommendation: (id: string) => 
    api.get(`/book/${id}`),
  
  // 创建书籍推荐
  createRecommendation: (data: CreateBookRecommendationForm) => 
    api.post('/book', data),
  
  // 更新书籍推荐
  updateRecommendation: (id: string, data: Partial<CreateBookRecommendationForm>) => 
    api.put(`/book/${id}`, data),
  
  // 删除书籍推荐
  deleteRecommendation: (id: string) => 
    api.delete(`/book/${id}`),
  
  // 点赞/取消点赞
  likeRecommendation: (id: string) => 
    api.post(`/book/${id}/like`),
  
  // 添加评论
  addComment: (id: string, content: string) => 
    api.post(`/book/${id}/comments`, { content }),
  
  // 获取用户的书籍推荐
  getUserRecommendations: (username: string, params?: {
    page?: number;
    limit?: number;
  }) => api.get(`/book/user/${username}`, { params }),
};

export default api;