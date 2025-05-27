import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationApi } from '../utils/evaluationApi';
import type { EvaluationQuestion, EvaluationModel, ModelAnswer, SubmitAnswerForm } from '../types';
import ContentRenderer from '../components/ContentRenderer';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';

const AnswerQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
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
      const questionData = questionRes.data?.question || questionRes.question;
      console.log('AnswerQuestionPage - parsed question:', questionData);
      setQuestion(questionData);
      
      // 解析模型数据  
      const modelsData = modelsRes.data?.models || modelsRes.models || [];
      setModels(modelsData);
      
      // 解析答案数据
      const answersData = answersRes.data?.answers || answersRes.answers || [];
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

        {/* 提交答案表单 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">提交模型答案</h2>
          </div>
          
          <form onSubmit={handleSubmitAnswer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  选择模型 *
                </label>
                <select
                  required
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="">请选择一个AI模型</option>
                  {models.map((model) => (
                    <option key={model._id} value={model._id}>
                      {model.name} {model.version ? `v${model.version}` : ''} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  内容类型
                </label>
                <select
                  value={answerForm.contentType}
                  onChange={(e) => setAnswerForm({ ...answerForm, contentType: e.target.value as any })}
                  className="block w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="text">📝 纯文本</option>
                  <option value="latex">🔢 LaTeX公式</option>
                  <option value="html">🌐 HTML</option>
                  <option value="mixed">🎨 混合内容</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                模型答案 *
              </label>
              <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                <Editor
                  height="320px"
                  defaultLanguage={answerForm.contentType === 'html' ? 'html' : answerForm.contentType === 'latex' ? 'latex' : 'plaintext'}
                  value={answerForm.content}
                  onChange={(value) => setAnswerForm({ ...answerForm, content: value || '' })}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    fontSize: 14,
                    lineHeight: 1.6,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                  }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                初始评分 (1-5星)
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setAnswerForm({ ...answerForm, score })}
                    className={`w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all transform hover:scale-105 ${
                      answerForm.score === score
                        ? 'border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-yellow-400 hover:text-yellow-600'
                    }`}
                  >
                    {score}⭐
                  </button>
                ))}
                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  当前评分: {answerForm.score}/5
                </span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={submitting || !selectedModel || !answerForm.content.trim()}
              className="w-full inline-flex justify-center items-center px-6 py-4 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提交中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  提交答案
                </>
              )}
            </button>
          </form>
        </div>

        {/* 已提交的答案列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">已提交的答案</h2>
            <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
              {answers.length} 个答案
            </span>
          </div>
          
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {answers.map((answer) => (
              <div key={answer._id} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:border-blue-200 dark:hover:border-blue-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: answer.model?.color || '#6366f1' }}
                    >
                      {answer.model?.name?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {answer.model?.name || '未知模型'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          v{answer.model?.version || '1.0'}
                        </span>
                        <span>•</span>
                        <span>{answer.model?.provider || '未知提供商'}</span>
                        <span>•</span>
                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          {answer.contentType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(answer.score)}`}>
                        {answer.score}<span className="text-lg text-gray-400">/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <svg
                            key={score}
                            className={`w-4 h-4 ${
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
                    
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleScoreAnswer(answer._id, score)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all transform hover:scale-110 ${
                            answer.score === score
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-800'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <ContentRenderer
                    content={answer.content}
                    contentType={answer.contentType}
                    className="text-gray-800 dark:text-gray-200"
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>提交时间: {new Date(answer.createdAt).toLocaleString('zh-CN')}</span>
                  {answer.submittedBy && (
                    <span>提交者: {answer.submittedBy.username || answer.submittedBy.displayName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {answers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default AnswerQuestionPage;