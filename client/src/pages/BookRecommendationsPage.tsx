import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Eye, Heart, MessageCircle, Star, Book, Sparkles, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { bookApi } from '../utils/api';
import type { BookRecommendation } from '../types';

const BookRecommendationsPage = () => {
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const categories = [
    { value: '', label: '全部分类 📚' },
    { value: '小说', label: '小说 📖' },
    { value: '技术', label: '技术 💻' },
    { value: '历史', label: '历史 🏛️' },
    { value: '科幻', label: '科幻 🚀' },
    { value: '传记', label: '传记 👤' },
    { value: '心理学', label: '心理学 🧠' },
    { value: '哲学', label: '哲学 🤔' },
    { value: '艺术', label: '艺术 🎨' },
    { value: '经济', label: '经济 💰' },
    { value: '其他', label: '其他 ✨' },
  ];

  const difficulties = [
    { value: '', label: '全部难度 🎯' },
    { value: 'beginner', label: '入门 🌱' },
    { value: 'intermediate', label: '中级 🌿' },
    { value: 'advanced', label: '高级 🌳' },
  ];

  const recommendations = [
    { value: '', label: '全部推荐度 ⭐' },
    { value: 'highly-recommend', label: '强烈推荐 💖' },
    { value: 'recommend', label: '推荐 👍' },
    { value: 'neutral', label: '一般 😐' },
    { value: 'not-recommend', label: '不推荐 👎' },
  ];

  const sortOptions = [
    { value: 'publishedAt', label: '最新发布 ⏰' },
    { value: 'rating', label: '评分最高 ⭐' },
    { value: 'views', label: '浏览最多 👀' },
    { value: 'likes', label: '点赞最多 💕' },
  ];

  useEffect(() => {
    fetchBooks();
  }, [searchParams]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: pagination.limit,
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        difficulty: searchParams.get('difficulty') || '',
        recommendation: searchParams.get('recommendation') || '',
        sortBy: searchParams.get('sortBy') || 'publishedAt',
      };

      const response = await bookApi.getRecommendations(params);
      setBooks(response.data.books);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
      case 'recommendation':
        setSelectedRecommendation(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
    }
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const getRecommendationColor = (recommendation: string) => {
    const colors = {
      'highly-recommend': 'bg-anime-pink-100 text-anime-pink-800 dark:bg-anime-pink-900 dark:text-anime-pink-200',
      'recommend': 'bg-anime-blue-100 text-anime-blue-800 dark:bg-anime-blue-900 dark:text-anime-blue-200',
      'neutral': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'not-recommend': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[recommendation as keyof typeof colors] || colors.neutral;
  };

  const getRecommendationLabel = (recommendation: string) => {
    const labels = {
      'highly-recommend': '强烈推荐 💖',
      'recommend': '推荐 👍',
      'neutral': '一般 😐',
      'not-recommend': '不推荐 👎',
    };
    return labels[recommendation as keyof typeof labels] || '一般 😐';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[difficulty as keyof typeof colors] || colors.intermediate;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      'beginner': '入门 🌱',
      'intermediate': '中级 🌿',
      'advanced': '高级 🌳',
    };
    return labels[difficulty as keyof typeof labels] || '中级 🌿';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载书籍推荐中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-kawaii py-16 anime-sparkle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-heading font-bold text-white mb-4 anime-text-glow"
          >
            📚 书籍推荐 ✨
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90"
          >
            发现好书，分享阅读体验 💖
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="relative anime-gradient-border">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-anime-purple-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索书籍标题、作者或标签... 🔍"
                className="w-full pl-10 pr-4 py-3 rounded-kawaii bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-anime-purple-500 focus:border-transparent transition-colors duration-200 border-none outline-none"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-anime-purple-600" />
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="kawaii-card px-3 py-2 rounded-kawaii text-sm border-none focus:ring-2 focus:ring-anime-purple-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="kawaii-card px-3 py-2 rounded-kawaii text-sm border-none focus:ring-2 focus:ring-anime-purple-500"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>

            <select
              value={selectedRecommendation}
              onChange={(e) => handleFilterChange('recommendation', e.target.value)}
              className="kawaii-card px-3 py-2 rounded-kawaii text-sm border-none focus:ring-2 focus:ring-anime-purple-500"
            >
              {recommendations.map((rec) => (
                <option key={rec.value} value={rec.value}>
                  {rec.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="kawaii-card px-3 py-2 rounded-kawaii text-sm border-none focus:ring-2 focus:ring-anime-purple-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Link
              to="/book/create"
              className="kawaii-button flex items-center space-x-2 floating-hearts"
            >
              <BookOpen className="w-4 h-4" />
              <span>推荐好书</span>
            </Link>
          </div>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="kawaii-card p-8 mx-auto max-w-md anime-sparkle">
              <div className="w-24 h-24 bg-gradient-kawaii rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
                还没有书籍推荐 📚
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                成为第一个分享好书的人吧！ ✨
              </p>
              <Link
                to="/book/create"
                className="kawaii-button inline-flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>推荐第一本书</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <motion.article
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="kawaii-card overflow-hidden hover:shadow-glow-pink transition-all duration-300 transform hover:-translate-y-1 anime-sparkle"
              >
                {book.coverImage && (
                  <div className="aspect-[3/4] bg-gradient-kawaii">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(book.recommendation)}`}>
                      {getRecommendationLabel(book.recommendation)}
                    </span>
                    <div className="flex items-center text-anime-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium ml-1">{book.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    <Link
                      to={`/book/${book._id}`}
                      className="hover:text-anime-purple-600 transition-colors duration-200"
                    >
                      {book.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    作者: {book.author}
                  </p>

                  {book.categories.length > 0 && (
                    <div className="flex flex-wrap mb-3">
                      {book.categories.slice(0, 2).map((category) => (
                        <span key={category} className="tag text-xs mr-1 mb-1">
                          {category}
                        </span>
                      ))}
                      {book.categories.length > 2 && (
                        <span className="tag text-xs">+{book.categories.length - 2}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(book.difficulty)}`}>
                      {getDifficultyLabel(book.difficulty)}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(book.publishedAt || book.createdAt), 'MM/dd')}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {book.review}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-kawaii flex items-center justify-center">
                        {book.recommendedBy.avatar ? (
                          <img
                            src={book.recommendedBy.avatar}
                            alt={book.recommendedBy.displayName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-medium">
                            {book.recommendedBy.displayName[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {book.recommendedBy.displayName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{book.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{book.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{book.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="kawaii-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-kawaii transition-all duration-200 ${
                    page === pagination.page
                      ? 'bg-gradient-kawaii text-white shadow-glow-pink'
                      : 'kawaii-card hover:shadow-glow-purple'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="kawaii-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRecommendationsPage;