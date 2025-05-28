import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
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
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-heading font-bold anime-gradient-text mb-4">
              隐私政策
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              保护你的个人信息是我们的责任 🛡️
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              最后更新时间：{new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>

          <div className="space-y-8">
            {/* 信息收集 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  我们收集哪些信息
                </h2>
              </div>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-anime-purple-600 dark:text-anime-purple-400">
                    📝 账户信息
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>用户名、显示名称、邮箱地址</li>
                    <li>个人资料信息（头像、个人简介、喜欢的动漫等）</li>
                    <li>社交媒体链接（如果你选择提供）</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-anime-purple-600 dark:text-anime-purple-400">
                    ✏️ 内容信息
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>你发布的博客文章、评论和其他内容</li>
                    <li>点赞、收藏等互动行为</li>
                    <li>上传的图片和文件</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-anime-purple-600 dark:text-anime-purple-400">
                    🔗 第三方集成
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Notion 集成的授权令牌（如果你选择连接）</li>
                    <li>第三方服务的必要信息</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-anime-purple-600 dark:text-anime-purple-400">
                    📊 技术信息
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>IP 地址、浏览器类型、设备信息</li>
                    <li>访问日志、错误日志</li>
                    <li>使用偏好设置（主题、语言等）</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 信息使用 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  我们如何使用你的信息
                </h2>
              </div>

              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-3">
                  <span className="text-anime-pink-500">🎯</span>
                  <p><strong>提供服务：</strong>处理你的账户、发布内容、个性化体验</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-anime-pink-500">🛡️</span>
                  <p><strong>安全保护：</strong>防止欺诈、滥用和安全威胁</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-anime-pink-500">📈</span>
                  <p><strong>服务改进：</strong>分析使用情况，优化功能和性能</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-anime-pink-500">📧</span>
                  <p><strong>沟通联系：</strong>发送重要通知和服务更新</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-anime-pink-500">⚖️</span>
                  <p><strong>法律合规：</strong>遵守适用的法律法规要求</p>
                </div>
              </div>
            </section>

            {/* 信息共享 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  信息共享和披露
                </h2>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ 我们承诺
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    我们不会出售、租借或交易你的个人信息给第三方用于营销目的。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                    我们可能在以下情况下共享信息：
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>经你同意：</strong>在获得你明确同意的情况下</li>
                    <li><strong>服务提供商：</strong>与帮助我们运营服务的可信第三方（如云服务商）</li>
                    <li><strong>法律要求：</strong>应执法部门要求或为保护合法权益</li>
                    <li><strong>业务转让：</strong>在公司合并、收购等情况下（会提前通知）</li>
                    <li><strong>公开内容：</strong>你选择公开发布的博客文章和评论</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 数据安全 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  数据安全和保护
                </h2>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>我们采取多重安全措施保护你的个人信息：</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🔐 加密传输</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">使用 HTTPS 和 SSL 加密</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🏦 安全存储</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">密码哈希加密存储</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🔒 访问控制</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">严格的权限管理</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">📊 监控检测</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">异常活动监控</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 你的权利 */}
            <section className="anime-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  你的权利和选择
                </h2>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                      📝 数据控制权
                    </h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>查看和编辑个人资料</li>
                      <li>下载你的数据</li>
                      <li>删除你的内容</li>
                      <li>注销账户</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-anime-purple-600 dark:text-anime-purple-400">
                      ⚙️ 隐私设置
                    </h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>控制个人资料可见性</li>
                      <li>管理第三方集成</li>
                      <li>选择通知偏好</li>
                      <li>设置内容权限</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>💡 提示：</strong>如需行使上述权利或有任何隐私相关问题，请通过网站内的联系方式与我们联系。
                  </p>
                </div>
              </div>
            </section>

            {/* Cookie */}
            <section className="anime-card p-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                🍪 Cookie 和类似技术
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>我们使用 Cookie 和类似技术来：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>记住你的登录状态和偏好设置</li>
                  <li>分析网站使用情况和性能</li>
                  <li>提供个性化体验</li>
                  <li>确保网站安全</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  你可以通过浏览器设置管理 Cookie 偏好，但这可能影响网站的某些功能。
                </p>
              </div>
            </section>

            {/* 政策更新 */}
            <section className="anime-card p-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                📮 政策更新
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  我们可能会不时更新本隐私政策。重大变更时，我们会：
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>在网站上发布显著通知</li>
                  <li>通过邮件通知注册用户</li>
                  <li>更新页面顶部的"最后更新时间"</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  继续使用我们的服务即表示你接受更新后的政策。
                </p>
              </div>
            </section>

            {/* 联系我们 */}
            <section className="anime-card p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                📞 联系我们
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  如果你对本隐私政策有任何疑问、意见或建议，欢迎通过以下方式联系我们：
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <ul className="space-y-2 text-sm">
                    <li>📧 <strong>邮箱：</strong> privacy@yourdomain.com</li>
                    <li>💬 <strong>站内消息：</strong> 通过用户中心联系管理员</li>
                    <li>🌐 <strong>反馈页面：</strong> 网站底部的意见反馈</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  我们会在收到你的问询后尽快回复（通常在 48 小时内）。
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

export default PrivacyPolicyPage;