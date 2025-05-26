import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationApi } from '../utils/evaluationApi';
import type { EvaluationQuestion, EvaluationCategory, CreateQuestionForm } from '../types';
import { useAuthStore } from '../store/authStore';
import ContentRenderer from '../components/ContentRenderer';
import Editor from '@monaco-editor/react';

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionForm>({
    title: '',
    content: '',
    contentType: 'text',
    category: '',
    difficulty: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, categoriesRes] = await Promise.all([
        evaluationApi.getQuestions({
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
          difficulty: selectedDifficulty || undefined
        }),
        evaluationApi.getCategories()
      ]);
      console.log('Questions page - questions response:', questionsRes);
      console.log('Questions page - categories response:', categoriesRes);
      
      const questions = questionsRes.data?.questions || questionsRes.questions || [];
      const categories = categoriesRes.data?.categories || categoriesRes.categories || [];
      
      console.log('Questions page - parsed questions:', questions);
      console.log('Questions page - parsed categories:', categories);
      
      setQuestions(questions);
      setCategories(categories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await evaluationApi.createQuestion(formData);
      setFormData({ title: '', content: '', contentType: 'text', category: '', difficulty: 'medium' });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('确定要删除这个题目吗？')) return;

    try {
      await evaluationApi.deleteQuestion(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/evaluation')}
              className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← 返回评测首页
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">评测题目管理</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              管理评测题目，支持文本、LaTeX公式和HTML内容
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              创建题目
            </button>
          )}
        </div>

        {/* 过滤器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                搜索题目
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="输入标题或内容关键词"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分类
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">全部分类</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                难度
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">全部难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
          </div>
        </div>

        {/* 创建题目表单 */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">创建评测题目</h3>
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        题目标题 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        内容类型 *
                      </label>
                      <select
                        value={formData.contentType}
                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="text">纯文本</option>
                        <option value="latex">LaTeX公式</option>
                        <option value="html">HTML</option>
                        <option value="mixed">混合内容</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        分类 *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">选择分类</option>
                        {categories?.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        难度
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      题目内容 *
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      <Editor
                        height="300px"
                        defaultLanguage={formData.contentType === 'html' ? 'html' : formData.contentType === 'latex' ? 'latex' : 'plaintext'}
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value || '' })}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {submitting ? '创建中...' : '创建'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 题目列表 */}
        <div className="space-y-6">
          {questions?.map((question) => (
            <div key={question._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {question.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyText(question.difficulty)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {question.contentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>分类: {question.category?.name || '未分类'}</span>
                    <span>创建时间: {new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/evaluation/questions/${question._id}/answer`)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    开始评测
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <ContentRenderer
                  content={question.content}
                  contentType={question.contentType}
                  className="text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
          ))}
        </div>

        {(!questions || questions.length === 0) && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无题目</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user ? '开始创建第一个评测题目' : '请登录后创建评测题目'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;