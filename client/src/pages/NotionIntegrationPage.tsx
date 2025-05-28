import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, Unlink, RefreshCw, Download, Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { notionApi } from '../utils/api';

interface NotionStatus {
  isConnected: boolean;
  workspaceName?: string;
  connectedAt?: string;
  lastSync?: string;
}

interface SyncHistory {
  id: string;
  type: 'export' | 'import';
  title: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  error?: string;
}

const NotionIntegrationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notionStatus, setNotionStatus] = useState<NotionStatus>({ isConnected: false });
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotionStatus();
    fetchSyncHistory();
  }, [user, navigate]);

  const fetchNotionStatus = async () => {
    try {
      const response = await notionApi.getStatus();
      setNotionStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch Notion status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHistory = async () => {
    try {
      const response = await notionApi.getSyncHistory();
      setSyncHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch sync history:', error);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await notionApi.getAuthUrl();
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to connect to Notion');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('确定要断开 Notion 连接吗？')) return;
    
    try {
      await notionApi.disconnect();
      setNotionStatus({ isConnected: false });
      setSyncHistory([]);
      toast.success('Notion 连接已断开');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect Notion');
    }
  };

  const handleExportToNotion = async (postId?: string) => {
    setSyncing(true);
    try {
      const response = await notionApi.exportToNotion(postId);
      toast.success(`成功导出 ${response.data.count} 篇博客到 Notion`);
      fetchSyncHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export to Notion');
    } finally {
      setSyncing(false);
    }
  };

  const handleImportFromNotion = async () => {
    setSyncing(true);
    try {
      const response = await notionApi.importFromNotion();
      toast.success(`成功从 Notion 导入 ${response.data.count} 篇文章`);
      fetchSyncHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import from Notion');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
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
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold anime-gradient-text">
                  Notion 集成
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  连接你的 Notion 工作区，轻松同步博客内容 ✨
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="anime-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  notionStatus.isConnected 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {notionStatus.isConnected ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                    连接状态
                  </h3>
                  {notionStatus.isConnected ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>已连接到: <span className="font-medium text-green-600 dark:text-green-400">
                        {notionStatus.workspaceName}
                      </span></p>
                      {notionStatus.connectedAt && (
                        <p>连接时间: {new Date(notionStatus.connectedAt).toLocaleString()}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      尚未连接到 Notion 工作区
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {notionStatus.isConnected ? (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  >
                    <Unlink className="w-4 h-4" />
                    <span>断开连接</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="anime-button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connecting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    <span>{connecting ? '连接中...' : '连接 Notion'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sync Actions */}
          {notionStatus.isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Export to Notion */}
              <div className="anime-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                      导出到 Notion
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      将你的博客文章同步到 Notion 数据库
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleExportToNotion()}
                  disabled={syncing}
                  className="w-full anime-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? '同步中...' : '开始导出'}
                </button>
              </div>

              {/* Import from Notion */}
              <div className="anime-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                      从 Notion 导入
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      将 Notion 页面导入为博客文章
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleImportFromNotion}
                  disabled={syncing}
                  className="w-full anime-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? '同步中...' : '开始导入'}
                </button>
              </div>
            </div>
          )}

          {/* Sync History */}
          {notionStatus.isConnected && (
            <div className="anime-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                  同步历史
                </h3>
                <button
                  onClick={fetchSyncHistory}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {syncHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">暂无同步记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {syncHistory.map((record) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          record.type === 'export' 
                            ? 'bg-blue-100 dark:bg-blue-900' 
                            : 'bg-green-100 dark:bg-green-900'
                        }`}>
                          {record.type === 'export' ? (
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {record.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                          {record.error && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              错误: {record.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : record.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {record.status === 'success' ? '成功' : 
                         record.status === 'failed' ? '失败' : '进行中'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="anime-card p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-4">
              使用说明 💡
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">1.</span>
                <p>点击"连接 Notion"按钮授权访问你的 Notion 工作区</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">2.</span>
                <p>使用"导出到 Notion"将你的博客文章同步到 Notion 数据库</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">3.</span>
                <p>使用"从 Notion 导入"将 Notion 页面转换为博客文章</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">4.</span>
                <p>所有同步操作都是手动触发的，你可以完全控制同步时机</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotionIntegrationPage;