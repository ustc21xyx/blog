# 网络性能优化方案

## 已实施的优化

### 1. 多层缓存系统
- **热缓存 (Hot Cache)**: 1小时TTL，1000个键，最常访问数据
- **温缓存 (Warm Cache)**: 6小时TTL，5000个键，中等频率数据  
- **冷缓存 (Cold Cache)**: 24小时TTL，10000个键，低频率数据
- 智能缓存升级和统计监控

### 2. 数据库连接优化
- 连接池：最大10个连接，最小1个
- 读偏好：secondaryPreferred（优先读从节点）
- 数据压缩：zlib压缩，级别6
- 查询优化：lean查询、字段选择、索引提示

### 3. 静态资源优化
- Gzip/Brotli压缩
- 长期缓存：JS/CSS文件1年，图片30天
- CDN边缘缓存策略
- 图片懒加载和WebP格式

### 4. Vercel部署优化
- 亚洲区域部署：香港、新加坡、东京、首尔
- Lambda函数：1GB内存，30秒超时
- 边缘缓存：API 10分钟，静态资源永久

## Vercel配置建议

### Environment Variables
```bash
# 在Vercel Dashboard设置
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=production
CACHE_ENABLED=true
COMPRESSION_LEVEL=6
```

### 项目设置
1. **Functions Region**: 选择Asia Pacific (Hong Kong)作为主要区域
2. **Edge Config**: 启用边缘配置存储常用数据
3. **Analytics**: 启用Web Analytics监控性能
4. **Speed Insights**: 启用Core Web Vitals监控

## MongoDB Atlas配置建议

### 1. 集群配置
```javascript
// 推荐配置
{
  "clusterTier": "M10", // 最小生产级别
  "region": "AP_SOUTHEAST_1", // 新加坡区域，最接近中国用户
  "backupEnabled": true,
  "performanceAdvisor": true
}
```

### 2. 网络配置
- **Network Access**: 添加 `0.0.0.0/0` 允许Vercel访问
- **Connection String Options**:
  ```
  mongodb+srv://user:pass@cluster.mongodb.net/database?
  retryWrites=true&w=majority&readPreference=secondaryPreferred&
  maxPoolSize=10&serverSelectionTimeoutMS=8000&socketTimeoutMS=45000
  ```

### 3. 索引优化
```javascript
// 关键索引
db.blogposts.createIndex({ "isPublished": 1, "publishedAt": -1 })
db.blogposts.createIndex({ "author": 1, "createdAt": -1 })
db.bookrecommendations.createIndex({ "isPublished": 1, "publishedAt": -1 })
db.bookrecommendations.createIndex({ "recommendedBy": 1, "createdAt": -1 })

// 文本搜索索引
db.blogposts.createIndex({ 
  "title": "text", 
  "content": "text", 
  "tags": "text" 
}, { 
  default_language: "none",
  language_override: "language"
})
```

### 4. 性能监控
- 启用**Performance Advisor**
- 设置**Real Time Performance Panel**
- 配置**Custom Alerts**监控慢查询

## 前端优化建议

### 1. Vite配置优化
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### 2. Service Worker缓存
创建 `public/sw.js`:
```javascript
const CACHE_NAME = 'anime-blog-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      }
    )
  );
});
```

## 监控和分析

### 1. 性能指标监控
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **TTFB**: < 200ms (通过CDN和缓存)
- **API响应时间**: < 500ms
- **数据库查询时间**: < 100ms

### 2. 缓存命中率监控
访问 `/api/health` 查看缓存统计：
```json
{
  "cache": {
    "hot": { "keys": 156, "hits": 892, "misses": 45 },
    "warm": { "keys": 324, "hits": 1205, "misses": 123 },
    "cold": { "keys": 89, "hits": 234, "misses": 67 },
    "hitRate": "85.2%"
  }
}
```

## 预期性能提升

### 优化前 vs 优化后
| 指标 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| 首页加载时间 | 3-5秒 | 1-2秒 | 60-70% |
| API响应时间 | 800-1500ms | 200-500ms | 65-75% |
| 数据库查询 | 300-800ms | 50-150ms | 75-85% |
| 静态资源加载 | 2-4秒 | 0.5-1秒 | 75-85% |
| 缓存命中率 | 0% | 80-90% | - |

## 故障排除

### 常见问题
1. **MongoDB连接超时**: 检查网络访问白名单
2. **Vercel函数冷启动**: 使用预热请求
3. **缓存过期**: 监控缓存命中率
4. **CDN缓存问题**: 检查Cache-Control头设置

### 调试工具
- Vercel Analytics Dashboard
- MongoDB Performance Advisor  
- Chrome DevTools Network面板
- `/api/health` 健康检查端点