import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationApi } from '../utils/evaluationApi';
import type { EvaluationQuestion, EvaluationModel, ModelAnswer, SubmitAnswerForm } from '../types';
import ContentRenderer from '../components/ContentRenderer';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';

const AnswerQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [question, setQuestion] = useState<EvaluationQuestion | null>(null);
  const [models, setModels] = useState<EvaluationModel[]>([]);
  const [answers, setAnswers] = useState<ModelAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');
  const [answerForm, setAnswerForm] = useState<SubmitAnswerForm>({
    content: '',
    contentType: 'text',
    score: 3
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (questionId) {
      fetchData();
    }
  }, [questionId]);

  const fetchData = async () => {
    try {
      const [questionRes, modelsRes, answersRes] = await Promise.all([
        evaluationApi.getQuestion(questionId!),
        evaluationApi.getModels(),
        evaluationApi.getAnswers({ question: questionId })
      ]);
      console.log('AnswerQuestionPage - questionRes:', questionRes);
      console.log('AnswerQuestionPage - modelsRes:', modelsRes);
      console.log('AnswerQuestionPage - answersRes:', answersRes);
      
      // 解析问题数据
      const questionData = questionRes.data?.question;
      console.log('AnswerQuestionPage - parsed question:', questionData);
      setQuestion(questionData || null); // Ensure null if undefined
      
      // 解析模型数据  
      const modelsData = modelsRes.data?.models || [];
      setModels(modelsData);
      
      // 解析答案数据
      const answersData = answersRes.data?.answers || [];
      setAnswers(answersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !selectedModel || !questionId) return;

    setSubmitting(true);
    try {
      await evaluationApi.submitAnswer(questionId, selectedModel, answerForm);
      setAnswerForm({ content: '', contentType: 'text', score: 3 });
      setSelectedModel('');
      fetchData(); // 刷新答案列表
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreAnswer = async (answerId: string, score: number) => {
    try {
      await evaluationApi.scoreAnswer(answerId, score);
      fetchData(); // 刷新答案列表
    } catch (error) {
      console.error('Failed to score answer:', error);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('确定要删除这个答案吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      await evaluationApi.deleteAnswer(answerId);
      fetchData(); // 刷新答案列表
    } catch (error) {
      console.error('Failed to delete answer:', error);
    }
  };

  const handlePreviewHTML = (content: string, modelName: string) => {
    // 创建一个完整的HTML文档
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML预览 - ${modelName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .preview-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .preview-content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .preview-footer {
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
            color: #64748b;
            font-size: 14px;
        }
        /* 为用户HTML内容提供一些基础样式 */
        .preview-content h1, .preview-content h2, .preview-content h3, 
        .preview-content h4, .preview-content h5, .preview-content h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: #1e293b;
        }
        .preview-content p {
            margin-bottom: 1em;
        }
        .preview-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        .preview-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
        }
        .preview-content th, .preview-content td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
        }
        .preview-content th {
            background-color: #f8fafc;
            font-weight: 600;
        }
        .preview-content code {
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            font-size: 0.9em;
        }
        .preview-content pre {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1em 0;
        }
        .preview-content pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
    </style>
</head>
<body>
    <div class="preview-header">
        <h1 style="margin: 0; font-size: 24px;">🌐 HTML预览</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">模型: ${modelName} | 生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
    <div class="preview-content">
        ${content}
    </div>
    <div class="preview-footer">
        ⚠️ 此预览在隔离环境中渲染，某些功能可能受限 • 由模型评测系统生成
    </div>
</body>
</html>`;

    // 创建Blob并在新标签页中打开
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    // 清理URL对象（延迟清理，确保页面加载完成）
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">题目不存在</h1>
            <button
              onClick={() => navigate('/evaluation/questions')}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              返回题目列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/evaluation/questions')}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          ← 返回题目列表
        </button>

        {/* 全局调试信息 */}
        <div className="bg-red-100 dark:bg-red-900 rounded-lg shadow p-4 mb-4">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">🔍 调试信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>当前用户:</strong> {user?.username || '未登录'}</p>
              <p><strong>用户角色:</strong> {user?.role || '未设置'}</p>
              <p><strong>用户ID:</strong> {user?._id || '无'}</p>
            </div>
            <div>
              <p><strong>答案数量:</strong> {answers.length}</p>
              <p><strong>模型数量:</strong> {models.length}</p>
              <p><strong>题目ID:</strong> {questionId}</p>
            </div>
          </div>
        </div>

        {/* 题目内容 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {question.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>分类: {question.category?.name || '未分类'}</span>
              <span>难度: {question.difficulty}</span>
              <span>内容类型: {question.contentType}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 左侧 - 提交答案表单 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">提交模型答案</h2>
              </div>
              
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    选择模型 *
                  </label>
                  <select
                    required
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">请选择AI模型</option>
                    {models.map((model) => (
                      <option key={model._id} value={model._id}>
                        {model.name} {model.version ? `v${model.version}` : ''} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    内容类型
                  </label>
                  <select
                    value={answerForm.contentType}
                    onChange={(e) => setAnswerForm({ ...answerForm, contentType: e.target.value as any })}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="text">📝 纯文本</option>
                    <option value="latex">🔢 LaTeX公式</option>
                    <option value="html">🌐 HTML</option>
                    <option value="mixed">🎨 混合内容</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    模型答案 *
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <Editor
                      height="280px"
                      defaultLanguage={answerForm.contentType === 'html' ? 'html' : answerForm.contentType === 'latex' ? 'latex' : 'plaintext'}
                      value={answerForm.content}
                      onChange={(value) => setAnswerForm({ ...answerForm, content: value || '' })}
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        fontSize: 13,
                        lineHeight: 1.5,
                        padding: { top: 12, bottom: 12 }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    初始评分
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setAnswerForm({ ...answerForm, score })}
                        className={`w-8 h-8 rounded-lg border font-semibold text-sm transition-all ${
                          answerForm.score === score
                            ? 'border-yellow-400 bg-yellow-400 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-yellow-400'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {answerForm.score}/5
                    </span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !selectedModel || !answerForm.content.trim()}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      提交中...
                    </>
                  ) : (
                    '提交答案'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* 右侦 - 已提交的答案列表 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">已提交的答案</h2>
                <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                  {answers.length} 个
                </span>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {answers.map((answer) => {
                  const isExpanded = expandedAnswer === answer._id;
                  const previewText = answer.content.length > 100 ? answer.content.substring(0, 100) + '...' : answer.content;
                  
                  return (
                    <div key={answer._id} className={`border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ease-in-out ${
                      isExpanded ? 'shadow-lg border-blue-300 dark:border-blue-600' : 'hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      {/* 折叠的头部 */}
                      <div 
                        className="p-4 cursor-pointer" 
                        onClick={() => setExpandedAnswer(isExpanded ? null : answer._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: answer.model?.color || '#6366f1' }}
                            >
                              {answer.model?.name?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {answer.model?.name || '未知模型'}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <span className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                                  v{answer.model?.version || '1.0'}
                                </span>
                                <span>•</span>
                                <span>{answer.model?.provider || '未知提供商'}</span>
                                <span>•</span>
                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1 py-0.5 rounded text-xs">
                                  {answer.contentType}
                                </span>
                              </div>
                              {!isExpanded && (
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                                    {previewText}
                                  </p>
                                  {answer.contentType === 'html' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreviewHTML(answer.content, answer.model?.name || '未知模型');
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors ml-2 flex-shrink-0"
                                      title="预览HTML"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      预览
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getScoreColor(answer.score)}`}>
                                {answer.score}<span className="text-sm text-gray-400">/5</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <svg
                                    key={score}
                                    className={`w-3 h-3 ${
                                      score <= answer.score
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* 展开的内容 */}
                      <div className={`transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}>
                        <div className="px-4 pb-4">
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                              <div className="flex items-start justify-between mb-3">
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  答案内容
                                </h5>
                                {answer.contentType === 'html' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreviewHTML(answer.content, answer.model?.name || '未知模型');
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    title="在新标签页预览HTML"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    预览HTML
                                  </button>
                                )}
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                <ContentRenderer
                                  content={answer.content}
                                  contentType={answer.contentType}
                                  className="text-gray-800 dark:text-gray-200 text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                提交时间: {new Date(answer.createdAt).toLocaleString('zh-CN')}
                              </span>
                              {answer.submittedBy && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  提交者: {answer.submittedBy.username || answer.submittedBy.displayName}
                                </span>
                              )}
                            </div>
                            
                            {/* 评分区域 */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-xs text-gray-600 dark:text-gray-400">重新评分:</span>
                              {[1, 2, 3, 4, 5].map((score) => (
                                <button
                                  key={score}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScoreAnswer(answer._id, score);
                                  }}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                    answer.score === score
                                      ? 'bg-blue-500 text-white shadow-md'
                                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-800'
                                  }`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>

                            {/* 操作按钮区域 */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                              {/* 删除按钮调试信息 */}
                              <div className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900 p-2 rounded">
                                <p>删除调试:</p>
                                <p>用户角色: {user?.role}</p>
                                <p>用户ID: {user?._id}</p>
                                <p>提交者ID: {answer.submittedBy?._id}</p>
                                <p>是管理员: {user?.role === 'admin' ? '是' : '否'}</p>
                                <p>是作者: {user?._id === answer.submittedBy?._id ? '是' : '否'}</p>
                                <p>应显示: {(user?.role === 'admin' || user?._id === answer.submittedBy?._id) ? '是' : '否'}</p>
                              </div>

                              {/* 删除按钮 */}
                              {(user?.role === 'admin' || user?._id === answer.submittedBy?._id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAnswer(answer._id);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                  title="删除答案"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  删除答案
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {answers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">还没有任何答案</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    成为第一个为这个问题提交模型答案的人吧！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerQuestionPage;
