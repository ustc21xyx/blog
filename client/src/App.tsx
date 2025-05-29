import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import EvaluationPage from './pages/EvaluationPage';
import CategoriesPage from './pages/CategoriesPage';
import ModelsPage from './pages/ModelsPage';
import QuestionsPage from './pages/QuestionsPage';
import AnswerQuestionPage from './pages/AnswerQuestionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotionIntegrationPage from './pages/NotionIntegrationPage';
import NotionCallbackPage from './pages/NotionCallbackPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import BookRecommendationsPage from './pages/BookRecommendationsPage';
import CreateBookRecommendationPage from './pages/CreateBookRecommendationPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, token, refreshToken } = useAuthStore();

  useEffect(() => {
    // Auto-refresh token on app load if user is authenticated
    if (isAuthenticated && token) {
      refreshToken().catch(() => {
        // Refresh failed, user will be logged out automatically
      });
    }
  }, [isAuthenticated, token, refreshToken]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/books" element={<BookRecommendationsPage />} />
            <Route path="/user/:username" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            
            {/* Evaluation Routes */}
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/evaluation/categories" element={<CategoriesPage />} />
            <Route path="/evaluation/models" element={<ModelsPage />} />
            <Route path="/evaluation/questions" element={<QuestionsPage />} />
            <Route path="/evaluation/questions/:questionId/answer" element={<AnswerQuestionPage />} />
            <Route path="/evaluation/leaderboard" element={<LeaderboardPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/create"
              element={
                <ProtectedRoute>
                  <CreateBookRecommendationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/edit/:id"
              element={
                <ProtectedRoute>
                  <CreateBookRecommendationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notion-integration"
              element={
                <ProtectedRoute>
                  <NotionIntegrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notion-callback"
              element={
                <ProtectedRoute>
                  <NotionCallbackPage />
                </ProtectedRoute>
              }
            />
            
            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-use" element={<TermsOfUsePage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #2d2d44',
            },
            success: {
              iconTheme: {
                primary: '#a071ff',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ea5f71',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;