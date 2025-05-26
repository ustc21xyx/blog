import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Eye, Heart, MessageCircle, Edit, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { blogApi } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import type { BlogPost } from '../types';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getPost(slug!);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await blogApi.likePost(post!._id);
      setPost(prev => ({
        ...prev!,
        likeCount: response.data.likeCount,
        hasLiked: response.data.hasLiked,
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await blogApi.addComment(post!._id, comment);
      setPost(prev => ({
        ...prev!,
        comments: [...prev!.comments, response.data.comment],
        commentCount: prev!.commentCount + 1,
      }));
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogApi.deletePost(post!._id);
      toast.success('Post deleted successfully');
      navigate('/blog');
    } catch (error) {
      toast.error('Failed to delete post');
    }
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
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Post not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The post you're looking for doesn't exist.
          </p>
          <Link to="/blog" className="anime-button-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user && (user.id === post.author.id || user.role === 'admin');

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {post.featuredImage && (
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className={getCategoryBadgeClass(post.category)}>
              {post.category.replace('-', ' ')}
            </span>
            {canEdit && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit/${post._id}`}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 flex items-center justify-center">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {post.author.displayName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <Link
                    to={`/user/${post.author.username}`}
                    className="text-gray-900 dark:text-white font-medium hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                  >
                    {post.author.displayName}
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{post.views}</span>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  post.hasLiked
                    ? 'text-red-500'
                    : 'hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                <span>{post.likeCount}</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap mb-8">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="blog-content mb-12"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </motion.div>

        {/* Comments Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-200 dark:border-dark-border pt-8"
        >
          <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
            Comments ({post.commentCount})
          </h3>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 flex items-center justify-center flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {user?.displayName?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="anime-input resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !comment.trim()}
                      className="anime-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="anime-card p-6 text-center mb-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please log in to leave a comment
              </p>
              <Link to="/login" className="anime-button-primary">
                Log In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 flex items-center justify-center flex-shrink-0">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {comment.author.displayName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="anime-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        to={`/user/${comment.author.username}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                      >
                        {comment.author.displayName}
                      </Link>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {post.comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </motion.section>
      </article>
    </div>
  );
};

export default BlogPostPage;