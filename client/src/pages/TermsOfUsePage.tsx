import { motion } from 'framer-motion';
import { FileText, Shield, Users, AlertTriangle, Scale, Heart } from 'lucide-react';

const TermsOfUsePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-heading font-bold anime-gradient-text mb-4">
              使用条款
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              一起创造美好的二次元博客社区 🌸
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              最后更新时间：{new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>

          <div className="space-y-8">
            {/* 接受条款 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  欢迎加入我们的社区
                </h2>
              </div>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-lg">
                  欢迎来到我们的二次元博客平台！通过访问或使用我们的服务，你同意遵守以下使用条款。
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    🎯 我们的使命
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300">
                    为所有热爱二次元文化的朋友们提供一个自由、友好、有趣的创作和交流平台。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl mb-2">✨</div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">创作自由</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">表达你的想法</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                    <div className="text-2xl mb-2">🤝</div>
                    <h4 className="font-semibold text-pink-800 dark:text-pink-200">友善交流</h4>
                    <p className="text-sm text-pink-700 dark:text-pink-300">尊重每个人</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl mb-2">🌟</div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">共同成长</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">一起进步</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 账户责任 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  账户和用户责任
                </h2>
              </div>

              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    📝 账户注册
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>你必须提供真实、准确的注册信息</li>
                    <li>你有责任保护账户安全，不要与他人分享密码</li>
                    <li>每人只能注册一个账户</li>
                    <li>如发现账户被盗用，请立即联系我们</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    🎭 用户行为准则
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ 我们鼓励</h4>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• 原创内容和有意义的讨论</li>
                        <li>• 友善互助，分享知识</li>
                        <li>• 尊重不同观点和文化</li>
                        <li>• 积极的反馈和建设性批评</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ 严格禁止</h4>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• 发布违法、暴力、色情内容</li>
                        <li>• 恶意攻击、骚扰其他用户</li>
                        <li>• 传播虚假信息或恶意链接</li>
                        <li>• 侵犯他人知识产权</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    🛡️ 年龄要求
                  </h3>
                  <p className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ 重要：</strong>使用本服务需年满 13 周岁。未满 18 周岁的用户需要在家长监护下使用。
                  </p>
                </div>
              </div>
            </section>

            {/* 内容政策 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  内容政策和知识产权
                </h2>
              </div>

              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    📚 内容所有权
                  </h3>
                  <div className="space-y-3">
                    <p>
                      <strong>你的内容：</strong>你保留对自己创作内容的所有权，但授予我们展示、存储和分发的权利。
                    </p>
                    <p>
                      <strong>平台内容：</strong>网站设计、代码、商标等属于我们的知识产权。
                    </p>
                    <p>
                      <strong>第三方内容：</strong>转载内容需遵守相关版权法律，建议优先发布原创作品。
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    🎨 内容准则
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">我们欢迎的内容类型：</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-700 dark:text-blue-300">
                      <div>🎭 动漫评测</div>
                      <div>📝 心得感想</div>
                      <div>🎨 同人创作</div>
                      <div>💡 技术分享</div>
                      <div>📚 学习笔记</div>
                      <div>🎵 音乐推荐</div>
                      <div>🎮 游戏攻略</div>
                      <div>✨ 生活随笔</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    ⚖️ 版权保护
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>我们尊重知识产权，会及时处理版权投诉</li>
                    <li>如发现侵权内容，请通过正当渠道举报</li>
                    <li>多次侵权的用户可能被永久封禁</li>
                    <li>我们会配合权利人维护合法权益</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 服务条款 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  服务条款和限制
                </h2>
              </div>

              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    💝 免费服务
                  </h3>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200">
                      🎉 我们的核心服务完全免费！包括注册、发布内容、互动交流、基础功能等。
                      我们致力于为二次元爱好者提供一个永久免费的交流平台。
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    🔧 服务可用性
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>我们努力保证 99% 的服务可用性</li>
                    <li>可能因维护、升级或不可抗力暂停服务</li>
                    <li>重要维护会提前在网站公告</li>
                    <li>不保证服务绝对不中断，但会尽力减少影响</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    🚫 使用限制
                  </h3>
                  <div className="space-y-3">
                    <p>为了保护所有用户的体验，我们设置了合理的使用限制：</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">📝 发布限制</h4>
                        <ul className="text-xs text-orange-700 dark:text-orange-300 mt-2 space-y-1">
                          <li>• 每天最多发布 10 篇文章</li>
                          <li>• 单篇文章最大 10MB</li>
                          <li>• 图片最大 5MB</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">💬 互动限制</h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                          <li>• 每分钟最多 30 次操作</li>
                          <li>• 防止恶意刷屏</li>
                          <li>• 自动检测异常行为</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 隐私和安全 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  隐私保护和数据安全
                </h2>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  我们非常重视你的隐私和数据安全。详细的隐私保护措施请查看我们的
                  <a href="/privacy-policy" className="text-anime-purple-600 dark:text-anime-purple-400 hover:underline font-semibold mx-1">
                    隐私政策
                  </a>
                  页面。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">数据加密</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">HTTPS 全站加密</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🛡️</div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">隐私控制</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">完全的数据控制权</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🚨</div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">安全监控</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">24/7 安全监控</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 违规处理 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  违规处理和申诉
                </h2>
              </div>

              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    ⚖️ 处理措施
                  </h3>
                  <div className="space-y-3">
                    <p>根据违规严重程度，我们可能采取以下措施：</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">⚠️</div>
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">警告</h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">轻微违规</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">🚫</div>
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">限制功能</h4>
                        <p className="text-xs text-orange-700 dark:text-orange-300">临时限制</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">⏰</div>
                        <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm">暂停账户</h4>
                        <p className="text-xs text-red-700 dark:text-red-300">1-30天</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">🔒</div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">永久封禁</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300">严重违规</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    📝 申诉流程
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200 mb-3">
                      <strong>如果你认为处理有误，可以通过以下方式申诉：</strong>
                    </p>
                    <ol className="list-decimal pl-6 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      <li>通过站内消息联系管理员</li>
                      <li>详细说明申诉理由和相关证据</li>
                      <li>我们会在 48 小时内回复</li>
                      <li>申诉结果会通过邮件或站内消息通知</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* 服务变更 */}
            <section className="anime-card p-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                🔄 服务变更和终止
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-anime-purple-600 dark:text-anime-purple-400">
                    服务变更
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>我们有权修改、升级或停止部分功能</li>
                    <li>重大变更会提前 30 天通知用户</li>
                    <li>用户可以选择接受变更或停止使用服务</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-anime-purple-600 dark:text-anime-purple-400">
                    账户终止
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>用户可以随时删除自己的账户</li>
                    <li>严重违规用户的账户可能被终止</li>
                    <li>账户终止后，相关数据会按隐私政策处理</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 免责声明 */}
            <section className="anime-card p-8 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                📋 免责声明
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <ul className="list-disc pl-6 space-y-2">
                  <li>本服务按"现状"提供，不保证绝对无错误或不中断</li>
                  <li>用户发布的内容不代表我们的观点或立场</li>
                  <li>我们不对用户间的纠纷承担责任</li>
                  <li>不可抗力导致的服务中断，我们不承担责任</li>
                  <li>第三方服务（如 Notion 集成）的问题由第三方负责</li>
                </ul>
                <p className="mt-4 text-xs">
                  <strong>注意：</strong>本免责声明不影响法律赋予用户的基本权利。
                </p>
              </div>
            </section>

            {/* 联系我们 */}
            <section className="anime-card p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                💌 联系我们
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  对这些使用条款有任何疑问，或需要帮助？我们随时为你服务：
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">📧 联系方式</h4>
                      <ul className="space-y-1">
                        <li>邮箱：support@yourdomain.com</li>
                        <li>QQ群：123456789</li>
                        <li>微信群：扫描二维码加入</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">🕐 服务时间</h4>
                      <ul className="space-y-1">
                        <li>工作日：9:00 - 18:00</li>
                        <li>周末：10:00 - 16:00</li>
                        <li>紧急情况：24小时内回复</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  💖 感谢你选择我们的平台，让我们一起创造美好的二次元世界！
                </p>
              </div>
            </section>
          </div>

          {/* 返回顶部 */}
          <div className="text-center mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="anime-button-primary"
            >
              返回顶部 ✨
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;