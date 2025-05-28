import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Eye, Heart, MessageCircle, BookOpen, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { blogApi } from '../utils/api';
import api from '../utils/api';
import type { BlogPost } from '../types';

const DashboardPage = () => {
  const { user, token } = useAuthStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdminUpgrade, setShowAdminUpgrade] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await blogApi.getUserPosts(user!.username);
      const userPosts = response.data.posts;
      setPosts(userPosts);
      
      // Calculate stats
      const totalViews = userPosts.reduce((sum: number, post: BlogPost) => sum + post.views, 0);
      const totalLikes = userPosts.reduce((sum: number, post: BlogPost) => sum + post.likeCount, 0);
      const totalComments = userPosts.reduce((sum: number, post: BlogPost) => sum + post.commentCount, 0);
      
      setStats({
        totalPosts: userPosts.length,
        totalViews,
        totalLikes,
        totalComments,
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpgrade = async () => {
    // 二次元梗密码列表
    const validCodes = [
      '欧尼酱大变态',
      '雅蠛蝶',
      '纳尼',
      '无路赛',
      '红豆泥斯国一',
      '八嘎呀路',
      '卡哇伊',
      '多摩',
      'poi',
      '马达马达',
      '德丝',
      '达咩',
      '阿里嘎多',
      '司马塞',
      '哈拉绍',
      '莫西莫西',
      '一库',
      '猴塞雷',
      '萌萌哒',
      '傲娇',
      '病娇',
      '呆萌',
      '宅腐萌',
      '妹控',
      '萝莉控',
      '奥义·千年杀',
      '多重影分身',
      '瞬身术',
      '木叶忍者',
      '我要成为海贼王',
      '超级赛亚人',
      '龙珠',
      '完全体',
      '最终形态',
      '魔法少女',
      '变身',
      '守护甜心',
      '月野兔',
      '美少女战士',
      '初音未来',
      'MIKU',
      '葱娘',
      '黑长直',
      '双马尾',
      '猫耳娘',
      '兽耳',
      '触手',
      '本子',
      '里番',
      '绅士',
      '肥宅快乐水',
      '二次元老婆',
      '三次元滚开',
      '现充爆炸吧',
      'FFF团',
      '单身狗',
      '死宅',
      '引き篭もり',
      'NEET',
      '次元壁',
      '破次元壁',
      '异世界',
      '穿越',
      '转生',
      '后宫',
      '修罗场',
      '便当',
      '刀子',
      '发糖',
      '发刀',
      '致郁',
      '治愈',
      '燃',
      '萌',
      '腐',
      '百合',
      '耽美',
      'BL',
      'GL',
      '攻受',
      '总受',
      '总攻',
      '女王受',
      '抖S',
      '抖M',
      '天然呆',
      '黑化',
      '洗白',
      '便当',
      '开后宫',
      '收后宫',
      '立flag',
      '倒flag',
      '死亡flag',
      '强制续命',
      '氪金',
      '非酋',
      '欧皇',
      '抽卡',
      '十连',
      '出货',
      '保底',
      '歪了',
      '毕业了',
      '入坑',
      '脱坑',
      '安利',
      '墙头',
      '爬墙',
      '本命',
      '大法好',
      'awsl',
      'yyds',
      'prpr',
      'mmp',
      'gg',
      'orz',
      '233',
      '666',
      '2333',
      '23333',
      '蛤蛤蛤',
      '哈哈哈',
      '嘤嘤嘤',
      '呜呜呜',
      '555',
      '哭唧唧',
      '嘤嘤怪',
      '元气满满',
      '满血复活',
      'HP-1',
      'MP不足',
      '掉san',
      '理智蒸发',
      '脑子瓦特了',
      '脑补',
      '妄想',
      '中二病',
      '厨二病',
      '黑历史',
      '社死',
      '原地去世',
      '当场去世',
      '我死了',
      '已逝',
      '鸽了',
      '咕咕咕',
      '真香',
      '蛙趣',
      '有内味了',
      '确实',
      '没毛病',
      '问题不大',
      '稳得一批',
      '牛逼',
      '可以的',
      '奶思',
      '橘势大好',
      '橘里橘气',
      '正义的伙伴',
      'English母语',
      '本子画师',
      '立绘师',
      'CV',
      '监督',
      '脚本',
      '原画师',
      '声优',
      '中之人',
      '皮套人',
      'Vtuber',
      '虚拟主播',
      '切片',
      '单推',
      'DD',
      '撒娇',
      '卖萌',
      '装可爱',
      '嘟嘟嘟',
      '啵啵啵',
      '摸摸哒',
      '抱抱',
      '亲亲',
      '贴贴',
      '蹭蹭',
      '揉揉',
      '戳戳',
      '刺溜',
      '吨吨吨',
      '咔嚓',
      '嗷呜',
      '旺',
      '喵',
      '汪',
      '嘎',
      '咕',
      '哞',
      '嘶',
      '嗨嗨嗨',
      '达咩哟',
      '不可以',
      'dame',
      'yamete',
      'kimoji',
      'itai',
      'oshimai',
      'owari',
      'hajimari',
      '我摊牌了',
      '你是懂的',
      '鸡你太美',
      '只因',
      '纯路人',
      '真爱粉',
      '路转粉',
      '粉转黑',
      '黑转粉',
      '回踩',
      '脱粉',
      '入股',
      '关注',
      '取关',
      '拉黑',
      '举报',
      '封号',
      '炸号',
      '开小号',
      '水军',
      '黑粉',
      '白莲花',
      '绿茶',
      '海王',
      '舔狗',
      '工具人',
      '备胎',
      '正宫',
      '小三',
      '渣男',
      '渣女',
      '钢铁直男',
      '钢铁直女',
      '百合控',
      '腐女',
      '腐男',
      '宅男',
      '宅女',
      '处男',
      '处女',
      '母胎solo',
      '万年单身',
      '恋爱绝缘体',
      '恋爱废柴',
      '恋爱白痴',
      '木头',
      '榆木疙瘩',
      '钢铁直男癌',
      '异性绝缘体'
    ];

    if (!validCodes.includes(upgradeCode.trim())) {
      alert('❌ 密码错误！请输入正确的二次元密码');
      return;
    }

    setUpgrading(true);
    try {
      // 直接从localStorage获取token，确保与zustand存储一致
      const authStorage = localStorage.getItem('auth-storage');
      let actualToken = token;
      
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          actualToken = parsed?.state?.token || token;
        } catch (e) {
          console.error('Failed to parse auth storage:', e);
        }
      }
      
      console.log('Using token:', actualToken ? 'Token exists' : 'No token'); // 调试用
      
      if (!actualToken) {
        alert('❌ 请先登录！');
        return;
      }

      // 使用fetch直接调用API，避免拦截器干扰
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/user/upgrade-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actualToken}`
        },
        body: JSON.stringify({ upgradeCode: upgradeCode.trim() })
      });

      if (response.ok) {
        alert('🎉 恭喜！你已经成为管理员了！请重新登录以获取新权限。');
        // 刷新用户信息
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`❌ 升级失败: ${errorData.message || '服务器错误'}`);
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert(`❌ 升级失败: ${error.message || '网络错误'}`);
    } finally {
      setUpgrading(false);
      setUpgradeCode('');
      setShowAdminUpgrade(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: BookOpen,
      color: 'from-anime-purple-500 to-anime-purple-600',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-anime-blue-500 to-anime-blue-600',
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'from-anime-pink-500 to-anime-pink-600',
    },
    {
      title: 'Total Comments',
      value: stats.totalComments.toLocaleString(),
      icon: MessageCircle,
      color: 'from-anime-purple-400 to-anime-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold anime-gradient-text mb-2">
              Welcome back, {user?.displayName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your blog activity
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Link
              to="/create"
              className="anime-button-primary flex items-center space-x-2"
            >
              <PenTool className="w-5 h-5" />
              <span>Write New Post</span>
            </Link>
            <Link
              to="/notion-integration"
              className="anime-button-secondary flex items-center space-x-2"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span>Notion</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="anime-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Your Recent Posts
            </h2>
            <Link
              to={`/user/${user?.username}`}
              className="text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200 font-medium"
            >
              View All
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 anime-card">
              <div className="w-24 h-24 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start sharing your thoughts with the community!
              </p>
              <Link to="/create" className="anime-button-primary">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.slice(0, 5).map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="anime-card p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.isPublished
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
                        <Link
                          to={post.isPublished ? `/blog/${post.slug}` : `/edit/${post._id}`}
                          className="hover:text-anime-purple-600 dark:hover:text-anime-purple-400 transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likeCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/edit/${post._id}`}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <PenTool className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 隐藏的管理员升级功能 */}
        {user?.role !== 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => setShowAdminUpgrade(!showAdminUpgrade)}
              className="text-xs text-gray-400 hover:text-purple-500 transition-colors duration-200"
            >
              ✨ 二次元力量觉醒 ✨
            </button>
            
            {showAdminUpgrade && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 max-w-md mx-auto"
              >
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      管理员觉醒仪式
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    输入二次元密码即可获得管理员权限~ <br/>
                    <span className="text-xs text-gray-500">
                      提示: 尝试一些经典的二次元梗吧 (≧∇≦)ﾉ
                    </span>
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={upgradeCode}
                      onChange={(e) => setUpgradeCode(e.target.value)}
                      placeholder="输入二次元密码... 例如: 欧尼酱大变态"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminUpgrade()}
                    />
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowAdminUpgrade(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleAdminUpgrade}
                        disabled={upgrading || !upgradeCode.trim()}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {upgrading ? '觉醒中...' : '开始觉醒'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <details>
                      <summary className="cursor-pointer hover:text-purple-500">💡 密码提示</summary>
                      <div className="mt-2 text-left">
                        <p>经典日语: 雅蠛蝶、纳尼、达咩...</p>
                        <p>二次元梗: 萌萌哒、傲娇、病娇...</p>
                        <p>动漫相关: 我要成为海贼王、超级赛亚人...</p>
                        <p>网络用语: awsl、yyds、233...</p>
                        <p>还有更多等你发现~ (´∀`)</p>
                      </div>
                    </details>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;