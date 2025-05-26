import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Eye, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { blogApi } from '../utils/api';
import type { BlogPost } from '../types';

const BlogListPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'anime-review', label: 'Anime Reviews' },
    { value: 'manga-review', label: 'Manga Reviews' },
    { value: 'news', label: 'News' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: pagination.limit,
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
      };

      const response = await blogApi.getPosts(params);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = 'category-badge ';
    switch (category) {
      case 'anime-review':
        return baseClass + 'category-anime-review';
      case 'manga-review':
        return baseClass + 'category-manga-review';
      case 'news':
        return baseClass + 'category-news';
      case 'opinion':
        return baseClass + 'category-opinion';
      case 'tutorial':
        return baseClass + 'category-tutorial';
      default:
        return baseClass + 'category-other';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-anime-purple-600 via-anime-pink-600 to-anime-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-heading font-bold text-white mb-4">
            Explore Blog Posts
          </h1>
          <p className="text-xl text-white/90">
            Discover amazing content from our community of anime enthusiasts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="anime-input pl-10"
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="anime-input max-w-xs"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="anime-card overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {post.featuredImage && (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={getCategoryBadgeClass(post.category)}>
                      {post.category.replace('-', ' ')}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 flex items-center justify-center">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {post.author.displayName[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {post.author.displayName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="tag">+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
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
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    page === pagination.page
                      ? 'bg-anime-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;