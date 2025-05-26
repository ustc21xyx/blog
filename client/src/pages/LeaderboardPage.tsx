import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationApi } from '../utils/evaluationApi';
import type { LeaderboardEntry, EvaluationCategory } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardRes, categoriesRes] = await Promise.all([
        evaluationApi.getLeaderboard(),
        evaluationApi.getCategories()
      ]);
      setLeaderboard(leaderboardRes.leaderboard);
      setCategories(categoriesRes.categories);
      
      // 默认选中前5个模型用于雷达图
      if (leaderboardRes.leaderboard.length > 0) {
        setSelectedModels(leaderboardRes.leaderboard.slice(0, 5).map(entry => entry.modelId));
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRadarData = () => {
    if (selectedModels.length === 0 || categories.length === 0) return [];

    return categories.map(category => {
      const dataPoint: any = {
        category: category.name,
        fullMark: 5
      };

      selectedModels.forEach(modelId => {
        const entry = leaderboard.find(e => e.modelId === modelId);
        if (entry) {
          const categoryScore = entry.categoryScores.find(cs => cs.categoryId === category._id);
          dataPoint[entry.modelName] = categoryScore ? categoryScore.averageScore : 0;
        }
      });

      return dataPoint;
    });
  };

  const getModelColor = (modelId: string) => {
    const entry = leaderboard.find(e => e.modelId === modelId);
    return entry?.modelColor || '#8884d8';
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 dark:text-yellow-400'; // 金色
      case 2: return 'text-gray-500 dark:text-gray-400'; // 银色  
      case 3: return 'text-orange-600 dark:text-orange-400'; // 铜色
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else if (prev.length < 5) {
        return [...prev, modelId];
      } else {
        return prev;
      }
    });
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
        <div className="mb-8">
          <button
            onClick={() => navigate('/evaluation')}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            ← 返回评测首页
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">模型排行榜</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            基于评测结果的模型性能排名和多维度对比分析
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 排行榜 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">总体排名</h2>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.modelId}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedModels.includes(entry.modelId)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => toggleModelSelection(entry.modelId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${getRankColor(index + 1)}`}>
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: entry.modelColor }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {entry.modelName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.modelProvider}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {entry.totalScore.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        平均分
                      </div>
                    </div>
                  </div>
                  
                  {/* 分类得分 */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {entry.categoryScores.map((categoryScore) => {
                      const category = categories.find(c => c._id === categoryScore.categoryId);
                      return (
                        <div key={categoryScore.categoryId} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {category?.name || '未知分类'}:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {categoryScore.averageScore.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无排名数据</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  请先进行模型评测以生成排行榜
                </p>
              </div>
            )}
          </div>

          {/* 雷达图 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">多维度对比</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                点击左侧模型可选择/取消 (最多5个)
              </div>
            </div>
            
            {selectedModels.length > 0 && categories.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 5]} 
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                    />
                    {selectedModels.map((modelId) => {
                      const entry = leaderboard.find(e => e.modelId === modelId);
                      return (
                        <Radar
                          key={modelId}
                          name={entry?.modelName || 'Unknown'}
                          dataKey={entry?.modelName || 'Unknown'}
                          stroke={getModelColor(modelId)}
                          fill={getModelColor(modelId)}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      );
                    })}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {leaderboard.length === 0 ? '暂无数据' : '请选择模型进行对比'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {leaderboard.length === 0 
                      ? '需要先进行模型评测' 
                      : '点击左侧排行榜中的模型卡片进行选择'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        {leaderboard.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">统计信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">参评模型</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">评测分类</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.max(...leaderboard.map(e => e.totalScore)).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">最高分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(leaderboard.reduce((sum, e) => sum + e.totalScore, 0) / leaderboard.length).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">平均分</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;