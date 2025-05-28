import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, Unlink, RefreshCw, Download, Upload, CheckCircle, AlertCircle, Database, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { notionApi, blogApi } from '../utils/api';

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

interface BlogPost {
  _id: string;
  title: string;
  excerpt?: string;
  isPublished: boolean;
  createdAt: string;
  publishedAt?: string;
  category: string;
  tags: string[];
}

interface NotionPage {
  id: string;
  title: string;
  lastEditedTime: string;
  url: string;
}

const NotionIntegrationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notionStatus, setNotionStatus] = useState<NotionStatus>({ isConnected: false });
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [notionPages, setNotionPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'history'>('export');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotionStatus();
    fetchSyncHistory();
    fetchBlogPosts();
  }, [user, navigate]);

  useEffect(() => {
    if (notionStatus.isConnected && activeTab === 'import') {
      fetchNotionPages();
    }
  }, [notionStatus.isConnected, activeTab]);

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

  const fetchBlogPosts = async () => {
    try {
      const response = await blogApi.getUserPosts(user!.username);
      setBlogPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    }
  };

  const fetchNotionPages = async () => {
    try {
      const response = await notionApi.getPages();
      setNotionPages(response.data.pages || []);
    } catch (error) {
      console.error('Failed to fetch Notion pages:', error);
      toast.error('Failed to fetch Notion pages');
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
      setNotionPages([]);
      toast.success('Notion 连接已断开');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect Notion');
    }
  };

  const handleExportSelected = async () => {
    if (selectedPosts.size === 0) {
      toast.error('请选择要导出的文章');
      return;
    }

    setSyncing(true);
    try {
      let allSuccessfulExports: any[] = [];
      let allErrors: any[] = [];

      for (const postId of selectedPosts) {
        try {
          const response = await notionApi.exportToNotion(postId);
          if (response.data.successfulExports) {
            allSuccessfulExports.push(...response.data.successfulExports);
          }
          if (response.data.errors) {
            allErrors.push(...response.data.errors);
          }
        } catch (error: any) {
          allErrors.push({
            title: '未知文章',
            error: error.response?.data?.message || error.message
          });
        }
      }

      // 显示详细的导出结果
      if (allSuccessfulExports.length > 0) {
        const successMessage = `✅ 成功导出 ${allSuccessfulExports.length} 篇文章到Notion:\n\n` +
          allSuccessfulExports.map(exp => 
            `📄 ${exp.title}\n🔗 ${exp.pageUrl || '链接生成中...'}`
          ).join('\n\n');
        
        // 使用自定义toast显示详细信息
        toast.success(successMessage, {
          duration: 8000,
          style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line'
          }
        });
      }

      if (allErrors.length > 0) {
        const errorMessage = `❌ ${allErrors.length} 篇文章导出失败:\n\n` +
          allErrors.map(err => `📄 ${err.title}: ${err.error}`).join('\n');
        
        toast.error(errorMessage, {
          duration: 6000,
          style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line'
          }
        });
      }

      // 保存导出结果到状态中
      setLastExportResult({
        successfulExports: allSuccessfulExports,
        errors: allErrors,
        timestamp: new Date()
      });

      setSelectedPosts(new Set());
      fetchSyncHistory();
    } catch (error: any) {
      toast.error('导出过程中发生错误: ' + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedPages.size === 0) {
      toast.error('请选择要导入的页面');
      return;
    }

    setSyncing(true);
    try {
      let successCount = 0;
      let failedCount = 0;

      for (const pageId of selectedPages) {
        try {
          await notionApi.importFromNotion(pageId);
          successCount++;
        } catch (error) {
          failedCount++;
        }
      }

      toast.success(`导入完成：${successCount} 成功，${failedCount} 失败`);
      setSelectedPages(new Set());
      fetchSyncHistory();
      fetchBlogPosts();
    } catch (error: any) {
      toast.error('导入失败');
    } finally {
      setSyncing(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const togglePageSelection = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const selectAllPosts = () => {
    if (selectedPosts.size === blogPosts.filter(p => p.isPublished).length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(blogPosts.filter(p => p.isPublished).map(p => p._id)));
    }
  };

  const selectAllPages = () => {
    if (selectedPages.size === notionPages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(notionPages.map(p => p.id)));
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  连接你的 Notion 工作区，精确控制内容同步 ✨
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

          {/* Tabs */}
          {notionStatus.isConnected && (
            <div className="flex space-x-1 mb-8">
              <button
                onClick={() => setActiveTab('export')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'export'
                    ? 'bg-anime-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400'
                }`}
              >
                导出到 Notion
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'import'
                    ? 'bg-anime-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400'
                }`}
              >
                从 Notion 导入
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'history'
                    ? 'bg-anime-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-anime-purple-600 dark:hover:text-anime-purple-400'
                }`}
              >
                同步历史
              </button>
            </div>
          )}

          {/* Tab Content */}
          {notionStatus.isConnected && (
            <div className="anime-card p-6">
              {activeTab === 'export' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
                        选择要导出的博客文章
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        选择已发布的文章导出到你的 Notion 工作区
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={selectAllPosts}
                        className="text-sm text-anime-purple-600 dark:text-anime-purple-400 hover:underline"
                      >
                        {selectedPosts.size === blogPosts.filter(p => p.isPublished).length ? '取消全选' : '全选'}
                      </button>
                      <button
                        onClick={handleExportSelected}
                        disabled={selectedPosts.size === 0 || syncing}
                        className="anime-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {syncing ? '导出中...' : `导出选中 (${selectedPosts.size})`}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {blogPosts.filter(post => post.isPublished).map((post) => (
                      <div
                        key={post._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedPosts.has(post._id)
                            ? 'border-anime-purple-500 bg-anime-purple-50 dark:bg-anime-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-anime-purple-300'
                        }`}
                        onClick={() => togglePostSelection(post._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedPosts.has(post._id)
                                  ? 'border-anime-purple-500 bg-anime-purple-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {selectedPosts.has(post._id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {post.title}
                              </h4>
                            </div>
                            {post.excerpt && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-8">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 ml-8 text-xs text-gray-500">
                              <span>分类: {post.category}</span>
                              <span>发布: {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                              {post.tags.length > 0 && (
                                <span>标签: {post.tags.slice(0, 2).join(', ')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {blogPosts.filter(post => post.isPublished).length === 0 && (
                    <div className="text-center py-12">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        暂无已发布的文章
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        先去<a href="/create" className="text-anime-purple-600 hover:underline">创作</a>一些内容吧！
                      </p>
                    </div>
                  )}

                  {/* 最近导出结果 */}
                  {lastExportResult && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        最近导出结果 ({new Date(lastExportResult.timestamp).toLocaleString()})
                      </h4>
                      
                      {lastExportResult.successfulExports.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                            ✅ 成功导出 ({lastExportResult.successfulExports.length})
                          </h5>
                          <div className="space-y-2">
                            {lastExportResult.successfulExports.map((exp: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{exp.title}</span>
                                {exp.pageUrl && (
                                  <a 
                                    href={exp.pageUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    在Notion中查看
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {lastExportResult.errors.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                            ❌ 导出失败 ({lastExportResult.errors.length})
                          </h5>
                          <div className="space-y-2">
                            {lastExportResult.errors.map((err: any, index: number) => (
                              <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                <div className="text-sm text-gray-700 dark:text-gray-300">{err.title}</div>
                                <div className="text-xs text-red-600 dark:text-red-400">{err.error}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'import' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
                        选择要导入的 Notion 页面
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        从你的 Notion 工作区选择页面导入为博客草稿
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={fetchNotionPages}
                        className="text-sm text-anime-purple-600 dark:text-anime-purple-400 hover:underline"
                      >
                        刷新
                      </button>
                      <button
                        onClick={selectAllPages}
                        className="text-sm text-anime-purple-600 dark:text-anime-purple-400 hover:underline"
                      >
                        {selectedPages.size === notionPages.length ? '取消全选' : '全选'}
                      </button>
                      <button
                        onClick={handleImportSelected}
                        disabled={selectedPages.size === 0 || syncing}
                        className="anime-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {syncing ? '导入中...' : `导入选中 (${selectedPages.size})`}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notionPages.map((page) => (
                      <div
                        key={page.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedPages.has(page.id)
                            ? 'border-anime-purple-500 bg-anime-purple-50 dark:bg-anime-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-anime-purple-300'
                        }`}
                        onClick={() => togglePageSelection(page.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedPages.has(page.id)
                                  ? 'border-anime-purple-500 bg-anime-purple-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {selectedPages.has(page.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {page.title}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 ml-8 text-xs text-gray-500">
                              <span>最后编辑: {new Date(page.lastEditedTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {notionPages.length === 0 && (
                    <div className="text-center py-12">
                      <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        暂无可访问的页面
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        请确保你的 Notion 集成有访问页面的权限
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
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
            </div>
          )}

          {/* Help Section */}
          <div className="anime-card p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 mt-8">
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
                <p>在"导出到 Notion"标签页选择要同步的博客文章</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">3.</span>
                <p>在"从 Notion 导入"标签页选择要导入的 Notion 页面</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">4.</span>
                <p>你可以完全控制同步哪些内容，支持单选和批量操作</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotionIntegrationPage;