export interface User {
  id: string;
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