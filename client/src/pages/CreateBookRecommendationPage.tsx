import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Star, BookOpen, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { bookApi } from '../utils/api';
import type { BookSearchResult } from '../types';

const CreateBookRecommendationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Book search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    googleBooksId: '',
    coverImage: '',
    description: '',
    publishedDate: '',
    pageCount: 0,
    categories: [] as string[],
    language: 'zh',
    rating: 8,
    review: '',
    tags: [] as string[],
    readingStatus: 'finished',
    difficulty: 'intermediate',
    recommendation: 'recommend',
    isPublished: false
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const difficulties = [
    { value: 'beginner', label: '入门 🌱' },
    { value: 'intermediate', label: '中级 🌿' },
    { value: 'advanced', label: '高级 🌳' },
  ];

  const recommendations = [
    { value: 'highly-recommend', label: '强烈推荐 💖' },
    { value: 'recommend', label: '推荐 👍' },
    { value: 'neutral', label: '一般 😐' },
    { value: 'not-recommend', label: '不推荐 👎' },
  ];

  const readingStatuses = [
    { value: 'want-to-read', label: '想读 📝' },
    { value: 'reading', label: '在读 📖' },
    { value: 'finished', label: '读完 ✅' },
    { value: 'abandoned', label: '弃读 ❌' },
  ];

  useEffect(() => {
    if (isEditing) {
      fetchBookRecommendation();
    }
  }, [id, isEditing]);

  const fetchBookRecommendation = async () => {
    try {
      setLoading(true);
      const response = await bookApi.getRecommendation(id!);
      const book = response.data;
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        googleBooksId: book.googleBooksId || '',
        coverImage: book.coverImage || '',
        description: book.description || '',
        publishedDate: book.publishedDate || '',
        pageCount: book.pageCount || 0,
        categories: book.categories || [],
        language: book.language || 'zh',
        rating: book.rating,
        review: book.review,
        tags: book.tags || [],
        readingStatus: book.readingStatus,
        difficulty: book.difficulty,
        recommendation: book.recommendation,
        isPublished: book.isPublished
      });
      setSelectedBook({
        id: book.googleBooksId || '',
        title: book.title,
        author: book.author,
        authors: book.author.split(', '),
        coverImage: book.coverImage || '',
        description: book.description || '',
        publishedDate: book.publishedDate || '',
        pageCount: book.pageCount || 0,
        categories: book.categories || [],
        isbn: book.isbn || '',
        googleBooksId: book.googleBooksId || ''
      });
    } catch (error) {
      console.error('Error fetching book recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return;
    }

    try {
      setIsSearching(true);
      const response = await bookApi.searchBooks({ q: searchQuery, maxResults: 10 });
      setSearchResults(response.data.books);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectBook = (book: BookSearchResult) => {
    setSelectedBook(book);
    setFormData(prev => ({
      ...prev,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      googleBooksId: book.googleBooksId,
      coverImage: book.coverImage,
      description: book.description,
      publishedDate: book.publishedDate,
      pageCount: book.pageCount,
      categories: book.categories,
      language: book.language || 'zh'
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.review) {
      alert('请填写必要信息：书名、作者和评价');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await bookApi.updateRecommendation(id!, formData);
      } else {
        await bookApi.createRecommendation(formData);
      }
      
      navigate('/books');
    } catch (error) {
      console.error('Error saving book recommendation:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-kawaii py-12 anime-sparkle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="kawaii-card p-2 rounded-kawaii hover:shadow-glow-purple transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-anime-purple-600" />
            </button>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white anime-text-glow">
            {isEditing ? '编辑书籍推荐 ✏️' : '推荐一本好书 📚✨'}
          </h1>
          <p className="text-white/90 mt-2">
            分享你的阅读体验，帮助他人发现好书 💖
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Book Search Section */}
          {!isEditing && !selectedBook && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="kawaii-card p-6 anime-sparkle"
            >
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-anime-purple-600" />
                搜索书籍 🔍
              </h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchBooks())}
                  placeholder="输入书名或作者..."
                  className="flex-1 anime-input"
                />
                <button
                  type="button"
                  onClick={searchBooks}
                  disabled={isSearching}
                  className="kawaii-button px-6 py-3 disabled:opacity-50"
                >
                  {isSearching ? '搜索中...' : '搜索'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto anime-scrollbar">
                  {searchResults.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => selectBook(book)}
                      className="kawaii-card p-4 cursor-pointer hover:shadow-glow-pink transition-all duration-300 flex items-start space-x-4"
                    >
                      {book.coverImage && (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {book.author}
                        </p>
                        {book.publishedDate && (
                          <p className="text-xs text-gray-500">
                            {book.publishedDate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Selected Book Preview */}
          {selectedBook && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="kawaii-card p-6 anime-sparkle"
            >
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-anime-purple-600" />
                选中的书籍 📖
              </h2>
              <div className="flex items-start space-x-4">
                {selectedBook.coverImage && (
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="w-24 h-32 object-cover rounded-lg shadow-anime"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBook.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    作者: {selectedBook.author}
                  </p>
                  {selectedBook.publishedDate && (
                    <p className="text-sm text-gray-500">
                      出版日期: {selectedBook.publishedDate}
                    </p>
                  )}
                  {selectedBook.pageCount > 0 && (
                    <p className="text-sm text-gray-500">
                      页数: {selectedBook.pageCount}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  重新选择
                </button>
              </div>
            </motion.div>
          )}

          {/* Manual Input Section */}
          {(!selectedBook || isEditing) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="kawaii-card p-6 space-y-6"
            >
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-anime-purple-600" />
                书籍信息 📝
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    书名 *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="anime-input"
                    placeholder="输入书名..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    作者 *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="anime-input"
                    placeholder="输入作者名..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="anime-input"
                    placeholder="ISBN编号..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    封面图片URL
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleInputChange}
                    className="anime-input"
                    placeholder="图片链接..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  书籍简介
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="anime-input"
                  placeholder="书籍简介..."
                />
              </div>
            </motion.div>
          )}

          {/* Review Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kawaii-card p-6 space-y-6"
          >
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white flex items-center">
              <Star className="w-5 h-5 mr-2 text-anime-yellow-500" />
              我的评价 ✨
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  评分 (1-10) *
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  step="0.5"
                  required
                  className="anime-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  难度等级
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="anime-input"
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  推荐程度 *
                </label>
                <select
                  name="recommendation"
                  value={formData.recommendation}
                  onChange={handleInputChange}
                  required
                  className="anime-input"
                >
                  {recommendations.map((rec) => (
                    <option key={rec.value} value={rec.value}>
                      {rec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                阅读状态
              </label>
              <select
                name="readingStatus"
                value={formData.readingStatus}
                onChange={handleInputChange}
                className="anime-input max-w-xs"
              >
                {readingStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                我的评价 *
              </label>
              <textarea
                name="review"
                value={formData.review}
                onChange={handleInputChange}
                rows={6}
                required
                className="anime-input"
                placeholder="分享你的阅读感受、推荐理由等..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标签
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={addTag}
                className="anime-input mb-3"
                placeholder="输入标签后按回车添加..."
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag cursor-pointer hover:bg-red-200 dark:hover:bg-red-800"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-anime-purple-600 rounded focus:ring-anime-purple-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                立即发布 🌟
              </label>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end space-x-4"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="anime-button-secondary px-6 py-3"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="kawaii-button px-6 py-3 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? '保存中...' : isEditing ? '更新推荐' : '发布推荐'}</span>
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookRecommendationPage;