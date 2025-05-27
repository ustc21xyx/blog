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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 提交答案 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">提交模型答案</h2>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择模型 *
                </label>
                <select
                  required
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">选择一个模型</option>
                  {models.map((model) => (
                    <option key={model._id} value={model._id}>
                      {model.name} - {model.version} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  答案类型
                </label>
                <select
                  value={answerForm.contentType}
                  onChange={(e) => setAnswerForm({ ...answerForm, contentType: e.target.value as any })}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="text">纯文本</option>
                  <option value="latex">LaTeX公式</option>
                  <option value="html">HTML</option>
                  <option value="mixed">混合内容</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  模型答案 *
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <Editor
                    height="300px"
                    defaultLanguage={answerForm.contentType === 'html' ? 'html' : answerForm.contentType === 'latex' ? 'latex' : 'plaintext'}
                    value={answerForm.content}
                    onChange={(value) => setAnswerForm({ ...answerForm, content: value || '' })}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      fontSize: 14,
                      lineHeight: 1.5,
                      padding: { top: 10, bottom: 10 }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  评分 (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setAnswerForm({ ...answerForm, score })}
                      className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                        answerForm.score === score
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交答案'}
              </button>
            </form>
          </div>

          {/* 已有答案 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">已提交的答案</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {answers.map((answer) => (
                <div key={answer._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {answer.model?.name} - {answer.model?.version}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {answer.model?.provider} • {answer.contentType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getScoreColor(answer.score)}`}>
                        {answer.score}/5
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            onClick={() => handleScoreAnswer(answer._id, score)}
                            className={`w-6 h-6 rounded-full text-xs font-semibold transition-colors ${
                              answer.score === score
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-400'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <ContentRenderer
                      content={answer.content}
                      contentType={answer.contentType}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    提交时间: {new Date(answer.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {answers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                还没有提交任何答案
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerQuestionPage;