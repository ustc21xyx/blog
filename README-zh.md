# 🎌 二次元博客系统

一个现代化的全栈博客应用，采用二次元风格设计，具备用户认证、内容管理和精美响应式界面。

## ✨ 主要功能

### 🔐 用户认证与授权
- 用户注册和登录（JWT令牌）
- bcrypt密码加密
- 基于角色的访问控制（用户/管理员）
- 安全的API端点和中间件保护

### 📝 博客管理
- 创建、阅读、更新、删除博客文章
- 支持Markdown的富文本编辑器
- 分类和标签系统
- 特色图片和动漫相关元数据
- 实时交互评论系统
- 点赞/取消点赞功能
- 浏览量统计

### 🎨 现代化界面设计
- 二次元风格的界面设计和自定义色彩
- 深色/浅色主题支持
- 所有设备的响应式设计
- Framer Motion流畅动画效果
- 自定义Tailwind CSS组件
- 精美的渐变和发光效果

### 🚀 生产环境就绪
- Docker容器化部署
- MongoDB数据库和索引
- 环境配置管理
- 健康检查和监控
- Nginx反向代理配置
- 安全最佳实践

## 🛠️ 技术栈

### 后端技术
- **Node.js** - 运行环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Mongoose** - 对象文档映射
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Express Validator** - 输入验证
- **Helmet** - 安全中间件
- **Cors** - 跨域资源共享

### 前端技术
- **React 19** - UI库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由导航
- **Zustand** - 状态管理
- **Axios** - HTTP客户端
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **React Hook Form** - 表单处理
- **React Hot Toast** - 通知提示

### 部署相关
- **Docker** - 容器化
- **Docker Compose** - 多容器编排
- **Nginx** - 反向代理
- **MongoDB** - 数据库服务

## 🚀 快速开始

### 环境要求
- Node.js 18+
- MongoDB（本地或云端）
- Git

### 本地开发环境搭建

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd blog
   ```

2. **安装所有依赖**
   ```bash
   npm run install-all
   ```

3. **环境配置**
   ```bash
   # 复制环境变量文件
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # 根据需要修改环境变量
   ```

4. **启动MongoDB数据库**
   ```bash
   # 如果使用本地MongoDB
   mongod
   
   # 或者使用Docker运行MongoDB
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

5. **启动应用程序**
   ```bash
   # 开发模式（同时启动前后端）
   npm run dev
   
   # 或者分别启动
   npm run server  # 后端服务器 :5000
   npm run client  # 前端应用 :3000
   ```

6. **访问应用**
   - 前端界面：http://localhost:3000
   - 后端API：http://localhost:5000/api

### 🔧 环境变量配置

#### 后端环境变量 (server/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/anime-blog
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

#### 前端环境变量 (client/.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### 📁 项目结构

```
anime-blog/
├── client/                 # React前端应用
│   ├── src/
│   │   ├── components/     # 可复用UI组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义React钩子
│   │   ├── store/         # Zustand状态管理
│   │   ├── types/         # TypeScript类型定义
│   │   ├── utils/         # 工具函数和API
│   │   └── styles/        # CSS和样式文件
│   └── package.json
├── server/                 # Express后端服务
│   ├── routes/            # API路由处理器
│   ├── models/            # MongoDB模型
│   ├── middleware/        # 自定义中间件
│   ├── config/            # 配置文件
│   └── package.json
├── docker-compose.yml      # 多容器配置
├── Dockerfile             # 生产环境容器
├── nginx.conf             # 反向代理配置
├── README.md              # 英文说明文档
└── README-zh.md           # 中文说明文档
```

## 🐳 生产环境部署

### 使用Docker Compose部署

1. **克隆并配置项目**
   ```bash
   git clone <项目地址>
   cd blog
   cp .env.example .env
   # 更新生产环境变量
   ```

2. **构建并启动容器**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   - 应用地址：http://localhost
   - API接口：http://localhost/api

### 手动部署

1. **构建前端**
   ```bash
   cd client && npm run build
   ```

2. **启动后端服务**
   ```bash
   cd server && npm start
   ```

## 🎨 界面定制

### 主题颜色
编辑 `client/tailwind.config.js` 来自定义二次元色彩方案：

```javascript
colors: {
  anime: {
    purple: { /* 自定义紫色系列 */ },
    pink: { /* 自定义粉色系列 */ },
    blue: { /* 自定义蓝色系列 */ }
  }
}
```

### 组件样式
所有UI组件都使用二次元主题类，可在 `client/src/index.css` 中自定义。

## 🔒 安全特性

- JWT令牌身份认证
- bcrypt密码加密
- 输入验证和清理
- 请求频率限制
- CORS配置
- Helmet安全头
- 环境变量保护
- SQL注入防护
- XSS攻击防护

## 📱 响应式设计

- 移动优先的设计方法
- 平板和桌面端优化
- 触控友好的交互
- 无障碍导航
- 渐进式Web应用特性

## 🚀 性能优化

- 数据库查询索引优化
- 图片优化和懒加载
- React懒加载代码分割
- 缓存策略
- 静态资源压缩
- CDN就绪的静态文件

## 📊 功能详情

### 用户功能
- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 头像上传
- ✅ 密码修改
- ✅ 个人博客列表

### 博客功能
- ✅ 创建/编辑博客文章
- ✅ Markdown支持
- ✅ 分类和标签
- ✅ 特色图片
- ✅ 草稿/发布状态
- ✅ 文章搜索
- ✅ 评论系统
- ✅ 点赞功能

### 管理功能
- ✅ 用户管理（管理员）
- ✅ 内容审核
- ✅ 统计数据
- ✅ 系统设置

## 🤝 贡献指南

1. Fork这个仓库
2. 创建功能分支
3. 提交你的更改
4. 添加相应测试
5. 提交Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看LICENSE文件了解详情。

## 🔮 未来功能规划

- [ ] 实时通知系统
- [ ] Elasticsearch高级搜索
- [ ] 社交媒体集成
- [ ] 邮件订阅功能
- [ ] React Native移动应用
- [ ] 管理员分析面板
- [ ] 多语言支持
- [ ] PWA渐进式Web应用
- [ ] MyAnimeList API集成
- [ ] 高级内容编辑器
- [ ] 评论审核系统
- [ ] RSS订阅生成

## 🆘 技术支持

如需技术支持，请发送邮件至 support@animeblog.com 或在仓库中创建issue。

## 🎯 使用说明

### 首次使用
1. 访问 http://localhost:3000
2. 点击"注册"创建账户
3. 登录后点击"写文章"开始创作
4. 在个人资料中完善信息

### 管理员功能
- 第一个注册的用户自动成为管理员
- 管理员可以管理所有用户和内容
- 访问 `/dashboard` 查看统计信息

### 博客写作
- 支持Markdown语法
- 可以设置分类和标签
- 支持特色图片
- 可以保存为草稿或直接发布

---

💝 为二次元社区用心打造 🌸