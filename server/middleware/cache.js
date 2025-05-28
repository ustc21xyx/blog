const NodeCache = require('node-cache');

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: 300, // 默认5分钟过期
  checkperiod: 60, // 每60秒检查过期项
  useClones: false, // 不克隆对象，提高性能
  deleteOnExpire: true,
  maxKeys: 1000 // 最大缓存项数
});

// 缓存中间件
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    // 生成缓存键
    const key = `${req.originalUrl || req.url}_${JSON.stringify(req.query)}`;
    
    // 检查缓存
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      console.log(`Cache hit: ${key}`);
      return res.json(cachedResponse);
    }

    // 重写res.json方法来缓存响应
    const originalJson = res.json;
    res.json = function(data) {
      // 只缓存成功的响应
      if (res.statusCode === 200) {
        cache.set(key, data, duration);
        console.log(`Cache set: ${key}`);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// 清除特定模式的缓存
const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  cache.del(matchingKeys);
  console.log(`Cleared ${matchingKeys.length} cache entries matching: ${pattern}`);
};

// 获取缓存统计
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  getCacheStats
}; 