import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../utils/api';
import { getAvatarUrl } from '../utils/avatarUtils';
import AvatarUpload from '../components/AvatarUpload';
import type { User } from '../types';

interface ProfileForm {
  displayName: string;
  bio: string;
  favoriteAnime: string;
  socialLinks: {
    twitter: string;
    github: string;
    mal: string;
  };
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Pre-fill form with current user data
    setValue('displayName', user.displayName || '');
    setValue('bio', user.bio || '');
    setValue('favoriteAnime', user.favoriteAnime?.join(', ') || '');
    setValue('socialLinks.twitter', user.socialLinks?.twitter || '');
    setValue('socialLinks.github', user.socialLinks?.github || '');
    setValue('socialLinks.mal', user.socialLinks?.mal || '');
  }, [user, setValue, navigate]);

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) {
      // Handle avatar removal
      try {
        setAvatarLoading(true);
        const response = await userApi.updateProfile({ avatar: '' });
        updateUser(response.data.user);
        toast.success('Avatar removed successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to remove avatar');
      } finally {
        setAvatarLoading(false);
      }
      return;
    }

    try {
      setAvatarLoading(true);
      const response = await userApi.uploadAvatar(file);
      updateUser(response.data.user);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarUrl = async (url: string) => {
    try {
      setAvatarLoading(true);
      const response = await userApi.updateProfile({ avatar: url });
      updateUser(response.data.user);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);

      // Parse favorite anime from comma-separated string
      const favoriteAnimeArray = data.favoriteAnime
        ? data.favoriteAnime.split(',').map(anime => anime.trim()).filter(Boolean)
        : [];

      const updateData = {
        displayName: data.displayName,
        bio: data.bio,
        favoriteAnime: favoriteAnimeArray,
        socialLinks: {
          twitter: data.socialLinks.twitter || undefined,
          github: data.socialLinks.github || undefined,
          mal: data.socialLinks.mal || undefined,
        },
      };

      const response = await userApi.updateProfile(updateData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      navigate(`/user/${user?.username}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(`/user/${user.username}`)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-heading font-bold anime-gradient-text">
              Edit Profile
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <div className="anime-card p-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-6">
                Profile Picture
              </h2>
              <AvatarUpload
                currentAvatar={getAvatarUrl(user.avatar)}
                displayName={user.displayName}
                onAvatarChange={handleAvatarUpload}
                onAvatarUrl={handleAvatarUrl}
                loading={avatarLoading}
              />
            </div>

            {/* Basic Information */}
            <div className="anime-card p-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-6">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    {...register('displayName', {
                      required: 'Display name is required',
                      maxLength: {
                        value: 50,
                        message: 'Display name cannot exceed 50 characters',
                      },
                    })}
                    type="text"
                    className="anime-input"
                    placeholder="Your display name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio', {
                      maxLength: {
                        value: 500,
                        message: 'Bio cannot exceed 500 characters',
                      },
                    })}
                    rows={4}
                    className="anime-input resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favorite Anime (comma-separated)
                  </label>
                  <input
                    {...register('favoriteAnime')}
                    type="text"
                    className="anime-input"
                    placeholder="Attack on Titan, One Piece, Naruto"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="anime-card p-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-6">
                Social Links
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter
                  </label>
                  <input
                    {...register('socialLinks.twitter', {
                      pattern: {
                        value: /^https?:\/\/(www\.)?twitter\.com\/.+/,
                        message: 'Please enter a valid Twitter URL',
                      },
                    })}
                    type="url"
                    className="anime-input"
                    placeholder="https://twitter.com/username"
                  />
                  {errors.socialLinks?.twitter && (
                    <p className="mt-1 text-sm text-red-600">{errors.socialLinks.twitter.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub
                  </label>
                  <input
                    {...register('socialLinks.github', {
                      pattern: {
                        value: /^https?:\/\/(www\.)?github\.com\/.+/,
                        message: 'Please enter a valid GitHub URL',
                      },
                    })}
                    type="url"
                    className="anime-input"
                    placeholder="https://github.com/username"
                  />
                  {errors.socialLinks?.github && (
                    <p className="mt-1 text-sm text-red-600">{errors.socialLinks.github.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MyAnimeList
                  </label>
                  <input
                    {...register('socialLinks.mal', {
                      pattern: {
                        value: /^https?:\/\/(www\.)?myanimelist\.net\/.+/,
                        message: 'Please enter a valid MyAnimeList URL',
                      },
                    })}
                    type="url"
                    className="anime-input"
                    placeholder="https://myanimelist.net/profile/username"
                  />
                  {errors.socialLinks?.mal && (
                    <p className="mt-1 text-sm text-red-600">{errors.socialLinks.mal.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate(`/user/${user.username}`)}
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
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfilePage;