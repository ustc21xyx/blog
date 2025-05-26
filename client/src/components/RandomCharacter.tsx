import React, { useState } from 'react';
import { Shuffle, Heart, Star, Calendar, Ruler, Weight, Mic } from 'lucide-react';

interface CharacterDetails {
  birthday?: string;
  height?: string;
  weight?: string;
  cv?: string;
}

interface Character {
  id: number;
  name: string;
  originalName: string;
  image: string;
  description: string;
  anime: string[];
  details: CharacterDetails;
  source: string;
}

interface RandomCharacterProps {
  className?: string;
}

const RandomCharacter: React.FC<RandomCharacterProps> = ({ className = '' }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  const fetchRandomCharacter = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/character/random');
      const data = await response.json();
      
      if (data.success) {
        // 修复图片URL的双斜杠问题
        if (data.character.image) {
          data.character.image = data.character.image.replace(/([^:])\/\/+/g, '$1/');
        }
        setCharacter(data.character);
        setLiked(false);
      } else {
        console.error('Failed to fetch character:', data.message);
      }
    } catch (error) {
      console.error('Error fetching random character:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Star className="text-yellow-500" size={24} />
          随机二次元角色
        </h2>
        <button
          onClick={fetchRandomCharacter}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
        >
          <Shuffle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '获取中...' : '随机角色'}
        </button>
      </div>

      {character ? (
        <div className="space-y-4">
          {/* 角色图片和基本信息 */}
          <div className="flex flex-col md:flex-row gap-6">
            {character.image && (
              <div className="flex-shrink-0">
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-48 h-64 object-cover rounded-lg shadow-md mx-auto md:mx-0"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // 如果原始图片加载失败，尝试使用代理
                    if (!target.src.includes('/api/proxy/')) {
                      target.src = `/api/proxy/image?url=${encodeURIComponent(character.image)}`;
                    } else {
                      // 代理也失败则显示默认图片
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExNi41NjkgMTIwIDEzMCAxMDYuNTY5IDEzMCA5MEM1MyA3My40MzE1IDEzMCA4Ni44NjI5IDEzMCAxMDBDMTMwIDExMy4xMzcgMTE2LjU2OSAxMjAgMTAwIDEyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                    }
                  }}
                />
              </div>
            )}
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {character.name}
                </h3>
                {character.originalName && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {character.originalName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    liked
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart
                    size={16}
                    className={liked ? 'fill-current' : ''}
                  />
                  {liked ? '已喜欢' : '喜欢'}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  来源: {character.source === 'bangumi' ? 'Bangumi' : '默认'}
                </span>
              </div>

              {character.description && (
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {character.description}
                </p>
              )}

              {character.anime && character.anime.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    出现作品:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {character.anime.map((anime, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        {anime}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 详细信息 */}
          {character.details && Object.values(character.details).some(value => value && value !== '未知') && (
            <div className="border-t dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                角色详情:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {character.details.birthday && character.details.birthday !== '未知' && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">生日</div>
                      <div className="text-gray-900 dark:text-white">{character.details.birthday}</div>
                    </div>
                  </div>
                )}
                
                {character.details.height && character.details.height !== '未知' && (
                  <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-gray-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">身高</div>
                      <div className="text-gray-900 dark:text-white">{character.details.height}</div>
                    </div>
                  </div>
                )}
                
                {character.details.weight && character.details.weight !== '未知' && (
                  <div className="flex items-center gap-2">
                    <Weight size={16} className="text-gray-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">体重</div>
                      <div className="text-gray-900 dark:text-white">{character.details.weight}</div>
                    </div>
                  </div>
                )}
                
                {character.details.cv && character.details.cv !== '未知' && (
                  <div className="flex items-center gap-2">
                    <Mic size={16} className="text-gray-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">声优</div>
                      <div className="text-gray-900 dark:text-white">{character.details.cv}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            点击上方按钮获取一个随机的二次元角色
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            角色信息来源于 Bangumi 等网站
          </p>
        </div>
      )}
    </div>
  );
};

export default RandomCharacter;