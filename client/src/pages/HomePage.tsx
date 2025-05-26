import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Eye, Heart, MessageCircle, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { blogApi } from '../utils/api';
import type { BlogPost } from '../types';
import RandomCharacter from '../components/RandomCharacter';

const HomePage = () => {
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const [latestResponse, featuredResponse] = await Promise.all([
        blogApi.getPosts({ page: 1, limit: 6 }),
        blogApi.getPosts({ page: 1, limit: 3 })
      ]);
      
      setLatestPosts(latestResponse.data.posts);
      setFeaturedPosts(featuredResponse.data.posts.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'anime-review': 'bg-anime-pink-100 text-anime-pink-800 dark:bg-anime-pink-900 dark:text-anime-pink-200',
      'manga-review': 'bg-anime-purple-100 text-anime-purple-800 dark:bg-anime-purple-900 dark:text-anime-purple-200',
      'news': 'bg-anime-blue-100 text-anime-blue-800 dark:bg-anime-blue-900 dark:text-anime-blue-200',
      'opinion': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'tutorial': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'anime-review': 'Anime Review',
      'manga-review': 'Manga Review',
      'news': 'News',
      'opinion': 'Opinion',
      'tutorial': 'Tutorial',
      'other': 'Other',
    };
    return labels[category as keyof typeof labels] || 'Other';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="anime-card p-8 text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-200 border-t-anime-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading latest posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-anime-purple-50 via-anime-pink-50 to-anime-blue-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg py-12 lg:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold anime-gradient-text mb-4">
                AnimeBlog
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Discover the latest anime reviews, news, and discussions from our passionate community
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/blog"
                className="anime-button-primary px-6 py-3 flex items-center space-x-2"
              >
                <span>Browse All Posts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/create"
                className="anime-button-secondary px-6 py-3 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Write a Post</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-dark-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <TrendingUp className="w-6 h-6 text-anime-purple-600 mr-3" />
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                Featured Posts
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="anime-card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {post.featuredImage && (
                    <div className="aspect-video bg-gradient-to-r from-anime-purple-400 to-anime-pink-400">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(post.publishedAt || post.createdAt), 'MMM d')}
                      </div>
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="hover:text-anime-purple-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likeCount}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.commentCount}
                        </span>
                      </div>
                      <span className="text-xs">by {post.author.displayName}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-anime-purple-600 mr-3" />
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                Latest Posts
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="anime-card p-8">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Be the first to share your anime thoughts with the community!
                </p>
                <Link
                  to="/create"
                  className="anime-button-primary inline-flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Write the First Post</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="anime-card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {post.featuredImage && (
                    <div className="aspect-video bg-gradient-to-r from-anime-purple-400 to-anime-pink-400">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(post.publishedAt || post.createdAt), 'MMM d')}
                      </div>
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="hover:text-anime-purple-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {post.likeCount}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {post.commentCount}
                        </span>
                      </div>
                      <span>by {post.author.displayName}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Random Character Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RandomCharacter />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-anime-purple-600 via-anime-pink-600 to-anime-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
            Join Our Anime Community
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Share your reviews, discover new anime, and connect with fellow otaku
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-white text-anime-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-anime-purple-600 transition-colors duration-200"
            >
              Explore Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;