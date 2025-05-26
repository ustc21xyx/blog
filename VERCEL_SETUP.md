# Vercel 部署配置指南

## 修复 500 错误的步骤

### 1. 设置 MongoDB Atlas 云数据库

1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 创建免费账户并新建集群
3. 在 Database Access 中创建数据库用户
4. 在 Network Access 中添加 IP 地址：`0.0.0.0/0` (允许所有连接)
5. 获取连接字符串，格式类似：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/anime-blog?retryWrites=true&w=majority
   ```

### 2. 在 Vercel 中配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/anime-blog?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-for-production
CLIENT_URL=https://your-vercel-domain.vercel.app
```

### 3. 重新部署

配置完成后，在 Vercel 中重新部署项目。

### 4. 测试 API

部署后测试以下端点：
- `https://your-domain.vercel.app/api/health` - 健康检查
- `https://your-domain.vercel.app/api/blog?page=1&limit=6` - 获取博客文章

## 常见问题

### 数据库连接失败
- 确认 MongoDB Atlas 的 IP 白名单包含 `0.0.0.0/0`
- 检查连接字符串中的用户名密码是否正确
- 确认数据库用户有读写权限

### API 仍然返回 500
- 检查 Vercel Function Logs 中的错误信息
- 确认所有环境变量都已正确设置

### 前端加载慢
- 检查 API 响应时间
- 考虑添加缓存机制
- 优化数据库查询