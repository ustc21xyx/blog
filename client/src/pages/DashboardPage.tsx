import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Eye, Heart, MessageCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { blogApi } from '../utils/api';
import type { BlogPost } from '../types';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await blogApi.getUserPosts(user!.username);
      const userPosts = response.data.posts;
      setPosts(userPosts);
      
      // Calculate stats
      const totalViews = userPosts.reduce((sum: number, post: BlogPost) => sum + post.views, 0);
      const totalLikes = userPosts.reduce((sum: number, post: BlogPost) => sum + post.likeCount, 0);
      const totalComments = userPosts.reduce((sum: number, post: BlogPost) => sum + post.commentCount, 0);
      
      setStats({
        totalPosts: userPosts.length,
        totalViews,
        totalLikes,
        totalComments,
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: BookOpen,
      color: 'from-anime-purple-500 to-anime-purple-600',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-anime-blue-500 to-anime-blue-600',
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'from-anime-pink-500 to-anime-pink-600',
    },
    {
      title: 'Total Comments',
      value: stats.totalComments.toLocaleString(),
      icon: MessageCircle,
      color: 'from-anime-purple-400 to-anime-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold anime-gradient-text mb-2">
              Welcome back, {user?.displayName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your blog activity
            </p>
          </div>
          <Link
            to="/create"
            className="anime-button-primary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <PenTool className="w-5 h-5" />
            <span>Write New Post</span>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="anime-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Your Recent Posts
            </h2>
            <Link
              to={`/user/${user?.username}`}
              className="text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200 font-medium"
            >
              View All
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 anime-card">
              <div className="w-24 h-24 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start sharing your thoughts with the community!
              </p>
              <Link to="/create" className="anime-button-primary">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.slice(0, 5).map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="anime-card p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.isPublished
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
                        <Link
                          to={post.isPublished ? `/blog/${post.slug}` : `/edit/${post._id}`}
                          className="hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      
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
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/edit/${post._id}`}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <PenTool className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;