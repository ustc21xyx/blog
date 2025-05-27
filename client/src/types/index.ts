export interface User {
  _id: string;
  id?: string; // 保留id字段以向后兼容
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  favoriteAnime: string[];
  socialLinks: {
    twitter?: string;
    github?: string;
    mal?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  tags: string[];
  category: 'anime-review' | 'manga-review' | 'news' | 'opinion' | 'tutorial' | 'other';
  featuredImage: string;
  animeRelated?: {
    title: string;
    malId: string;
    genre: string[];
    rating: number;
  };
  isPublished: boolean;
  publishedAt: string;
  views: number;
  likes: string[];
  comments: Comment[];
  slug: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  hasLiked?: boolean;
}

export interface Comment {
  _id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface BlogState {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  errors?: any[];
}

export interface LoginForm {
  login: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface CreatePostForm {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[] | string;
  featuredImage?: string;
  animeRelated?: {
    title: string;
    malId?: string;
    genre: string[] | string;
    rating?: number;
  };
  isPublished: boolean;
}

// ========== 评测系统类型定义 ==========

export interface EvaluationCategory {
  _id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationModel {
  _id: string;
  name: string;
  version: string;
  provider: string;
  description: string;
  color: string;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationQuestion {
  _id: string;
  title: string;
  description?: string;
  content: string;
  contentType: 'text' | 'latex' | 'html' | 'mixed';
  category: EvaluationCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  maxScore?: number;
  tags?: string[];
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ModelAnswer {
  _id: string;
  questionId: string;
  model: EvaluationModel;
  content: string;
  contentType: 'text' | 'latex' | 'html' | 'mixed';
  renderedContent?: string;
  score: number;
  scoredBy?: User;
  scoredAt?: string;
  version: number;
  isActive: boolean;
  submittedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ModelRanking {
  _id: string;
  modelName: string;
  modelVersion: string;
  modelProvider: string;
  modelColor: string;
  categoryScores: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    averageScore: number;
    questionCount: number;
  }[];
  totalScore: number;
  totalQuestions: number;
  rank: number;
}

export interface CreateCategoryForm {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateModelForm {
  name: string;
  version?: string;
  provider?: string;
  description?: string;
  color?: string;
}

export interface CreateQuestionForm {
  title: string;
  description?: string;
  content: string;
  contentType: 'text' | 'latex' | 'html' | 'mixed';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface SubmitAnswerForm {
  content: string;
  contentType: 'text' | 'latex' | 'html' | 'mixed';
  score: number;
}

export interface LeaderboardEntry {
  modelId: string;
  modelName: string;
  modelProvider: string;
  modelColor: string;
  categoryScores: {
    categoryId: string;
    categoryName: string;
    averageScore: number;
  }[];
  totalScore: number;
}