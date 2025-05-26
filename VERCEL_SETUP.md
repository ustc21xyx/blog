# Vercel 部署配置指南

## 修复 500/503 错误的步骤

### ⚠️ 重要：你的MongoDB URI问题
你的连接字符串：`mongodb+srv://xu2003128:xu2003128@cluster0.sljr980.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

**问题**：缺少数据库名称！

**正确格式**：
```
mongodb+srv://xu2003128:xu2003128@cluster0.sljr980.mongodb.net/anime-blog?retryWrites=true&w=majority&appName=Cluster0
```

### 1. 在 Vercel 中配置环境变量

登录 Vercel Dashboard → 选择你的项目 → Settings → Environment Variables，添加：

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://xu2003128:xu2003128@cluster0.sljr980.mongodb.net/anime-blog?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=anime-blog-super-secret-jwt-key-change-this-in-production-xu2003128
CLIENT_URL=https://你的vercel域名.vercel.app
```

### 2. 检查 MongoDB Atlas 设置

1. 登录 [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Network Access** → 确保有 `0.0.0.0/0` (Allow access from anywhere)
3. **Database Access** → 确认用户 `xu2003128` 有 `readWrite` 权限
4. **Database** → 确认集群正在运行

### 3. 重新部署

在 Vercel 中点击 "Redeploy" 按钮重新部署项目。

### 4. 测试修复结果

部署完成后测试：
- `https://你的域名.vercel.app/api/health` - 应该显示数据库连接状态
- `https://你的域名.vercel.app/api/blog?page=1&limit=6` - 应该返回博客数据

### 5. 如果仍有问题

1. 在 Vercel Dashboard → Functions → View Function Logs 查看错误详情
2. 确认 MongoDB Atlas 集群状态为 "Active"
3. 测试数据库连接：在 MongoDB Atlas 中使用 "Connect" → "Connect your application" 生成新的连接字符串

## 修复说明

我已经修复了以下问题：
- ✅ 自动修正缺少数据库名的 MongoDB URI
- ✅ 改进数据库连接重试机制
- ✅ 添加详细的错误日志
- ✅ 增强 API 错误处理
- ✅ 移除阻塞性的数据库连接检查中间件