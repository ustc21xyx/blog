import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Twitter, Github, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { userApi, blogApi } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrl } from '../utils/avatarUtils';
import type { User, BlogPost } from '../types';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await userApi.getProfile(username!);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await blogApi.getUserPosts(username!);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            User not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-anime-purple-600 via-anime-pink-600 to-anime-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-white p-2">
                {getAvatarUrl(user.avatar) ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {user.displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">
              {user.displayName}
            </h1>
            <p className="text-xl text-white/90 mb-4">@{user.username}</p>
            
            {user.bio && (
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-4">
                {user.bio}
              </p>
            )}

            {/* Edit Profile Button */}
            {isOwnProfile && (
              <Link
                to="/profile/edit"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="anime-card p-6 mb-8"
        >
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
            </div>
            
            {user.socialLinks?.twitter && (
              <a
                href={user.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </a>
            )}
            
            {user.socialLinks?.github && (
              <a
                href={user.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'posts'
                ? 'bg-anime-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'about'
                ? 'bg-anime-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400'
            }`}
          >
            About
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.displayName} hasn't published any posts yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <div key={post._id} className="anime-card p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {post.publishedAt 
                          ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                          : format(new Date(post.createdAt), 'MMM d, yyyy')
                        }
                      </span>
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{post.views || 0} views</span>
                        <span>{post.likeCount || 0} likes</span>
                        <span>{post.commentCount || 0} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="anime-card p-6"
          >
            <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
              About {user.displayName}
            </h3>
            
            {user.bio ? (
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {user.bio}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This user hasn't added a bio yet.
              </p>
            )}
            
            {user.favoriteAnime && user.favoriteAnime.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Favorite Anime
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteAnime.map((anime, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-anime-purple-100 dark:bg-anime-purple-900 text-anime-purple-800 dark:text-anime-purple-200 rounded-full text-sm"
                    >
                      {anime}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;