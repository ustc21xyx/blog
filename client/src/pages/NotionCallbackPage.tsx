import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { notionApi } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const NotionCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('处理 Notion 授权中...');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        if (error) {
          throw new Error(`授权失败: ${error}`);
        }

        if (!code) {
          throw new Error('授权码缺失');
        }

        // Handle the OAuth callback
        await notionApi.handleCallback(code);
        
        setStatus('success');
        setMessage('成功连接到 Notion！正在跳转...');
        
        // Redirect to notion integration page after success
        setTimeout(() => {
          navigate('/notion-integration');
        }, 2000);
      } catch (error: any) {
        console.error('Notion callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || error.message || '连接失败');
        
        // Redirect to notion integration page after error
        setTimeout(() => {
          navigate('/notion-integration');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="anime-card p-8">
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {status === 'loading' && 'Notion 授权处理中'}
            {status === 'success' && '授权成功！'}
            {status === 'error' && '授权失败'}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}

          {(status === 'success' || status === 'error') && (
            <button
              onClick={() => navigate('/notion-integration')}
              className="anime-button-primary"
            >
              返回集成页面
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotionCallbackPage;