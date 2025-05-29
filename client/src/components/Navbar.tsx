import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, PenTool, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';
import { getAvatarUrl } from '../utils/avatarUtils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="anime-nav glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 anime-sparkle">
            <div className="w-8 h-8 bg-gradient-kawaii rounded-kawaii flex items-center justify-center shadow-glow-pink pulse-ring">
              <span className="text-white font-bold text-sm cute-emoji">🌸</span>
            </div>
            <span className="text-xl font-heading font-bold anime-text-glow">
              二次元博客 <span className="cute-emoji">✨</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/blog"
              className="text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200 relative group"
            >
              {t('nav.blog')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-kawaii transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200 relative group"
            >
              {t('nav.categories')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-kawaii transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/books"
              className="text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200 relative group"
            >
              书籍推荐 📚
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-kawaii transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200 relative group"
            >
              {t('nav.about')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-kawaii transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/evaluation"
              className="text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200 relative group"
            >
              模型评测 ⚡
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-kawaii transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-kawaii bg-gradient-to-r from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 hover:shadow-glow-purple transition-all duration-300 transform hover:scale-110"
              title={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 animate-pulse-soft" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600 animate-pulse-soft" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="kawaii-button flex items-center space-x-2 floating-hearts"
                >
                  <PenTool className="w-4 h-4" />
                  <span>{t('nav.write')}</span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-kawaii hover:shadow-glow-pink transition-all duration-300 transform hover:scale-105 anime-sparkle"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-kawaii flex items-center justify-center shadow-kawaii animate-pulse-soft">
                      {getAvatarUrl(user?.avatar) ? (
                        <img
                          src={getAvatarUrl(user?.avatar)}
                          alt={user?.displayName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {user?.displayName?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 kawaii-card rounded-kawaii shadow-anime-lg z-50 bounce-in"
                      >
                        <div className="py-2">
                          <Link
                            to={`/user/${user?.username}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 rounded-lg mx-2"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-2 text-purple-500" />
                            {t('nav.profile')}
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 rounded-lg mx-2"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-2 text-blue-500" />
                            {t('nav.dashboard')}
                          </Link>
                          <Link
                            to="/notion-integration"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 rounded-lg mx-2"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="w-4 h-4 mr-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">N</span>
                            </div>
                            Notion 集成
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900 dark:hover:to-pink-900 transition-all duration-200 rounded-lg mx-2"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t('nav.logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-kawaii bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-700 hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="kawaii-button anime-sparkle"
                >
                  {t('nav.register')} <span className="cute-emoji">💖</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/blog"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  to="/categories"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  to="/books"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  书籍推荐 📚
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/evaluation"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-anime-purple-600 dark:hover:text-anime-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  模型评测 ⚡
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/create"
                      className="block px-3 py-2 rounded-md text-base font-medium anime-gradient-text"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Write Post
                    </Link>
                    <Link
                      to={`/user/${user?.username}`}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/notion-integration"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notion 集成
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium anime-gradient-text"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {/* Theme toggle for mobile */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;