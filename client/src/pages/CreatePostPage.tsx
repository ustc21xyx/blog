import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, Eye, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { blogApi } from '../utils/api';
import type { CreatePostForm } from '../types';

const CreatePostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostForm>({
    defaultValues: {
      isPublished: false,
      category: 'other',
      tags: [],
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  useEffect(() => {
    if (id) {
      // Load existing post for editing
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      console.log('Fetching post for editing:', id);
      const response = await blogApi.getPostForEdit(id!);
      const post = response.data;
      
      console.log('Loaded post data:', post);
      
      // Pre-fill all form fields
      setValue('title', post.title || '');
      setValue('content', post.content || '');
      setValue('excerpt', post.excerpt || '');
      setValue('category', post.category || 'other');
      setValue('featuredImage', post.featuredImage || '');
      setValue('isPublished', post.isPublished || false);
      
      // Handle tags array
      if (post.tags && Array.isArray(post.tags)) {
        setValue('tags', post.tags.join(', '));
      }
      
      // Handle anime related data
      if (post.animeRelated) {
        setValue('animeRelated.title', post.animeRelated.title || '');
        setValue('animeRelated.rating', post.animeRelated.rating || 0);
        if (post.animeRelated.genre && Array.isArray(post.animeRelated.genre)) {
          setValue('animeRelated.genre', post.animeRelated.genre.join(', '));
        }
      }
      
      toast.success('Post loaded for editing');
    } catch (error: any) {
      console.error('Failed to load post:', error);
      toast.error(error.response?.data?.message || 'Failed to load post');
      navigate('/blog');
    } finally {
      setLoadingPost(false);
    }
  };

  const onSubmit = async (data: CreatePostForm) => {
    try {
      setLoading(true);
      
      // Parse tags from comma-separated string
      const tagsArray = Array.isArray(data.tags) 
        ? data.tags
        : typeof data.tags === 'string' 
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];

      // Parse animeRelated.genre from comma-separated string
      let animeRelated = data.animeRelated;
      if (animeRelated && animeRelated.genre) {
        const genreArray = Array.isArray(animeRelated.genre)
          ? animeRelated.genre
          : typeof animeRelated.genre === 'string'
          ? animeRelated.genre.split(',').map((genre: string) => genre.trim()).filter(Boolean)
          : [];
        
        animeRelated = {
          ...animeRelated,
          genre: genreArray
        };
      }

      const postData = {
        ...data,
        tags: tagsArray,
        animeRelated
      };

      if (id) {
        await blogApi.updatePost(id, postData);
        toast.success('Post updated successfully!');
      } else {
        await blogApi.createPost(postData);
        toast.success('Post created successfully!');
      }
      
      navigate('/blog');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!id) return;
    
    const confirmed = window.confirm('确定要删除这篇文章吗？此操作无法撤销。');
    if (!confirmed) return;

    try {
      await blogApi.deletePost(id);
      toast.success('文章删除成功');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('删除文章失败:', error);
      toast.error(error.response?.data?.message || '删除文章失败');
    }
  };

  const categories = [
    { value: 'anime-review', label: 'Anime Review' },
    { value: 'manga-review', label: 'Manga Review' },
    { value: 'news', label: 'News' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'other', label: 'Other' },
  ];

  // Show loading state while fetching post data
  if (loadingPost) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-anime-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post for editing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-heading font-bold anime-gradient-text">
              {id ? 'Edit Post' : 'Create New Post'}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="anime-button-secondary flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{isPreview ? 'Edit' : 'Preview'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title', { 
                  required: 'Title is required',
                  minLength: {
                    value: 1,
                    message: 'Title cannot be empty'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Title cannot exceed 200 characters'
                  }
                })}
                type="text"
                className="anime-input"
                placeholder="Enter your post title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select {...register('category')} className="anime-input">
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  className="anime-input"
                  placeholder="anime, review, recommendation"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image URL
              </label>
              <input
                {...register('featuredImage')}
                type="url"
                className="anime-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              {isPreview ? (
                <div className="anime-card p-6 min-h-64">
                  <h2 className="text-2xl font-heading font-bold mb-4 text-gray-900 dark:text-white">{watchedTitle}</h2>
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {watchedContent}
                  </div>
                </div>
              ) : (
                <textarea
                  {...register('content', { 
                    required: 'Content is required',
                    minLength: {
                      value: 10,
                      message: 'Content must be at least 10 characters'
                    }
                  })}
                  rows={20}
                  className="anime-input resize-none font-mono"
                  placeholder="Write your content here... You can use Markdown!"
                />
              )}
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt (optional)
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="anime-input resize-none"
                placeholder="Brief description of your post..."
              />
            </div>

            {/* Anime Related (for reviews) */}
            <div className="anime-card p-6">
              <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-4">
                Anime/Manga Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    {...register('animeRelated.title')}
                    type="text"
                    className="anime-input"
                    placeholder="Anime/Manga title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Rating (0-10)
                  </label>
                  <input
                    {...register('animeRelated.rating', { 
                      min: 0, 
                      max: 10,
                      valueAsNumber: true 
                    })}
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="anime-input"
                    placeholder="8.5"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genres (comma-separated)
                </label>
                <input
                  {...register('animeRelated.genre')}
                  type="text"
                  className="anime-input"
                  placeholder="Action, Drama, Romance"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center">
                <input
                  {...register('isPublished')}
                  type="checkbox"
                  id="isPublished"
                  className="h-4 w-4 text-anime-purple-600 focus:ring-anime-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Publish immediately
                </label>
              </div>

              <div className="flex items-center space-x-4">
                {id && (
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/blog')}
                  className="anime-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="anime-button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Saving...' : 'Save Post'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePostPage;