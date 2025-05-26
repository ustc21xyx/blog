import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-heading font-bold anime-gradient-text">
                AnimeBlog
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              A modern blog platform for anime enthusiasts. Share your thoughts, reviews, and connect with fellow otaku from around the world.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a
                href="mailto:contact@animeblog.com"
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blog"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  All Posts
                </a>
              </li>
              <li>
                <a
                  href="/blog?category=anime-review"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  Anime Reviews
                </a>
              </li>
              <li>
                <a
                  href="/blog?category=manga-review"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  Manga Reviews
                </a>
              </li>
              <li>
                <a
                  href="/blog?category=news"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  News
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blog?category=opinion"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  Opinions
                </a>
              </li>
              <li>
                <a
                  href="/blog?category=tutorial"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  Tutorials
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-dark-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 AnimeBlog. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-anime-pink-500" />
              <span>for the anime community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;