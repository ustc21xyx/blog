// 简单的测试服务器
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// 中间件
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 模拟用户数据
const users = [];

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 注册接口
app.post('/api/auth/register', (req, res) => {
  console.log('收到注册请求:', req.body);
  
  const { username, email, password, displayName } = req.body;
  
  // 简单验证
  if (!username || !email || !password || !displayName) {
    return res.status(400).json({
      message: '所有字段都是必填项',
      errors: [{ msg: '请填写完整信息' }]
    });
  }
  
  // 检查用户是否已存在
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({
      message: existingUser.email === email ? '邮箱已被注册' : '用户名已被占用'
    });
  }
  
  // 创建新用户
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    displayName,
    avatar: '',
    role: users.length === 0 ? 'admin' : 'user', // 第一个用户是管理员
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // 模拟token
  const token = 'fake-jwt-token-' + newUser.id;
  
  console.log('用户注册成功:', newUser);
  
  res.status(201).json({
    message: '注册成功',
    token,
    user: newUser
  });
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
  console.log('收到登录请求:', req.body);
  
  const { login, password } = req.body;
  
  const user = users.find(u => u.email === login || u.username === login);
  
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  
  // 模拟token
  const token = 'fake-jwt-token-' + user.id;
  
  console.log('用户登录成功:', user);
  
  res.json({
    message: '登录成功',
    token,
    user
  });
});

// 获取当前用户
app.get('/api/auth/me', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('fake-jwt-token-')) {
    return res.status(401).json({ message: '未授权' });
  }
  
  const userId = token.replace('fake-jwt-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({ message: '用户不存在' });
  }
  
  res.json({ user });
});

// 404处理
app.use('*', (req, res) => {
  console.log('未找到路由:', req.method, req.originalUrl);
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 测试服务器运行在 http://localhost:${PORT}`);
  console.log(`🎌 前端地址: http://localhost:3000`);
});

module.exports = app;