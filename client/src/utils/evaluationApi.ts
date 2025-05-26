import api from './api';
import type { 
  CreateCategoryForm,
  CreateModelForm, 
  CreateQuestionForm,
  SubmitAnswerForm
} from '../types';

export const evaluationApi = {
  // ========== 分类管理 ==========
  getCategories: () => api.get('/evaluation/categories'),
  
  createCategory: (data: CreateCategoryForm) => 
    api.post('/evaluation/categories', data),
  
  updateCategory: (id: string, data: Partial<CreateCategoryForm>) => 
    api.put(`/evaluation/categories/${id}`, data),
  
  deleteCategory: (id: string) => api.delete(`/evaluation/categories/${id}`),

  // ========== 模型管理 ==========
  getModels: () => api.get('/evaluation/models'),
  
  createModel: (data: CreateModelForm) => 
    api.post('/evaluation/models', data),
  
  updateModel: (id: string, data: Partial<CreateModelForm>) => 
    api.put(`/evaluation/models/${id}`, data),
  
  deleteModel: (id: string) => api.delete(`/evaluation/models/${id}`),

  // ========== 题目管理 ==========
  getQuestions: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: string;
    search?: string;
  }) => api.get('/evaluation/questions', { params }),
  
  getQuestion: (id: string) => api.get(`/evaluation/questions/${id}`),
  
  createQuestion: (data: CreateQuestionForm) => 
    api.post('/evaluation/questions', data),
  
  updateQuestion: (id: string, data: Partial<CreateQuestionForm>) => 
    api.put(`/evaluation/questions/${id}`, data),
  
  deleteQuestion: (id: string) => api.delete(`/evaluation/questions/${id}`),

  // ========== 答案管理 ==========
  getQuestionAnswers: (questionId: string) => 
    api.get(`/evaluation/questions/${questionId}/answers`),
  
  submitAnswer: (data: SubmitAnswerForm) => 
    api.post('/evaluation/answers', data),
  
  updateAnswer: (id: string, data: Partial<SubmitAnswerForm>) => 
    api.put(`/evaluation/answers/${id}`, data),
  
  scoreAnswer: (id: string, score: number) => 
    api.put(`/evaluation/answers/${id}/score`, { score }),

  // ========== 统计数据 ==========
  getLeaderboard: () => api.get('/evaluation/leaderboard'),
};