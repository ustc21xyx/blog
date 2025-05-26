import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        {/* 404 Animation */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl sm:text-9xl font-bold anime-gradient-text mb-4"
          >
            404
          </motion.div>
          
          {/* Floating elements */}
          <motion.div
            className="absolute -top-4 -left-4 w-8 h-8 bg-anime-purple-200 dark:bg-anime-purple-800 rounded-full opacity-60"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -top-8 -right-2 w-6 h-6 bg-anime-pink-200 dark:bg-anime-pink-800 rounded-full opacity-60"
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-anime-blue-200 dark:bg-anime-blue-800 rounded-full opacity-60"
            animate={{ y: [-5, 15, -5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4"
        >
          Oops! Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
        >
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.history.back()}
            className="anime-button-secondary flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <Link
            to="/"
            className="anime-button-primary flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </motion.div>

        {/* Additional Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-border"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Or explore these popular sections:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/blog"
              className="text-sm text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200"
            >
              All Posts
            </Link>
            <Link
              to="/blog?category=anime-review"
              className="text-sm text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200"
            >
              Anime Reviews
            </Link>
            <Link
              to="/blog?category=manga-review"
              className="text-sm text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200"
            >
              Manga Reviews
            </Link>
            <Link
              to="/about"
              className="text-sm text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200"
            >
              About Us
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;