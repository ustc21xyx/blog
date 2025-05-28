const express = require('express');
const cors = require('cors');
const compression = require('compression'); // 添加压缩中间件
const helmet = require('helmet'); // 安全中间件
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// 响应压缩 - 减少传输数据量
app.use(compression({
  level: 6, // 压缩级别 (1-9)
  threshold: 1024, // 只压缩大于1KB的响应
  filter: (req, res) => {
    // 不压缩已经压缩的内容
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://blog-alpha-self-72.vercel.app', 'https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON - 限制请求大小
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
})); 