const NodeCache = require('node-cache');

// 多层缓存系统
class AdvancedCacheSystem {
  constructor() {
    // L1: 热数据缓存 (1小时)
    this.hotCache = new NodeCache({ 
      stdTTL: 3600, // 1小时
      checkperiod: 600, // 10分钟检查一次过期
      maxKeys: 1000 
    });
    
    // L2: 温数据缓存 (6小时)
    this.warmCache = new NodeCache({ 
      stdTTL: 21600, // 6小时
      checkperiod: 1800, // 30分钟检查一次
      maxKeys: 5000 
    });
    
    // L3: 冷数据缓存 (24小时)
    this.coldCache = new NodeCache({ 
      stdTTL: 86400, // 24小时
      checkperiod: 3600, // 1小时检查一次
      maxKeys: 10000 
    });

    // 缓存统计
    this.stats = {
      hotHits: 0,
      warmHits: 0,
      coldHits: 0,
      misses: 0,
      writes: 0
    };
  }

  // 智能获取缓存
  get(key) {
    // L1 热缓存
    let value = this.hotCache.get(key);
    if (value !== undefined) {
      this.stats.hotHits++;
      return value;
    }

    // L2 温缓存
    value = this.warmCache.get(key);
    if (value !== undefined) {
      this.stats.warmHits++;
      // 提升到热缓存
      this.hotCache.set(key, value, 3600);
      return value;
    }

    // L3 冷缓存
    value = this.coldCache.get(key);
    if (value !== undefined) {
      this.stats.coldHits++;
      // 提升到温缓存
      this.warmCache.set(key, value, 21600);
      return value;
    }

    this.stats.misses++;
    return undefined;
  }

  // 智能设置缓存
  set(key, value, options = {}) {
    const { 
      priority = 'warm', // hot, warm, cold
      ttl = null 
    } = options;

    this.stats.writes++;

    switch (priority) {
      case 'hot':
        this.hotCache.set(key, value, ttl || 3600);
        break;
      case 'warm':
        this.warmCache.set(key, value, ttl || 21600);
        break;
      case 'cold':
        this.coldCache.set(key, value, ttl || 86400);
        break;
    }
  }

  // 删除缓存
  del(key) {
    this.hotCache.del(key);
    this.warmCache.del(key);
    this.coldCache.del(key);
  }

  // 批量删除（支持模式匹配）
  delPattern(pattern) {
    const regex = new RegExp(pattern);
    
    [this.hotCache, this.warmCache, this.coldCache].forEach(cache => {
      const keys = cache.keys();
      keys.forEach(key => {
        if (regex.test(key)) {
          cache.del(key);
        }
      });
    });
  }

  // 获取缓存统计
  getStats() {
    const total = this.stats.hotHits + this.stats.warmHits + this.stats.coldHits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hotHits + this.stats.warmHits + this.stats.coldHits) / total * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      total,
      cacheKeys: {
        hot: this.hotCache.keys().length,
        warm: this.warmCache.keys().length,
        cold: this.coldCache.keys().length
      }
    };
  }

  // 预热缓存
  async warmUp(dataLoader) {
    try {
      console.log('🔥 Starting cache warm-up...');
      
      // 预加载热门数据
      const popularData = await dataLoader.getPopularContent();
      popularData.forEach(item => {
        this.set(`popular_${item.type}_${item.id}`, item, { priority: 'hot' });
      });

      // 预加载最新数据
      const recentData = await dataLoader.getRecentContent();
      recentData.forEach(item => {
        this.set(`recent_${item.type}_${item.id}`, item, { priority: 'warm' });
      });

      console.log('✅ Cache warm-up completed');
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
    }
  }
}

// 全局缓存实例
const globalCache = new AdvancedCacheSystem();

// 缓存中间件工厂
const createCacheMiddleware = (options = {}) => {
  const {
    keyGenerator = (req) => `${req.method}_${req.originalUrl}`,
    priority = 'warm',
    ttl = null,
    condition = () => true
  } = options;

  return (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const cached = globalCache.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Level', cached.level || 'unknown');
      return res.json(cached);
    }

    // 劫持 res.json 方法
    const originalJson = res.json;
    res.json = function(data) {
      // 缓存响应数据
      globalCache.set(key, data, { priority, ttl });
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

// 热点数据缓存
const hotDataCache = createCacheMiddleware({
  keyGenerator: (req) => `hot_${req.originalUrl}`,
  priority: 'hot',
  ttl: 1800, // 30分钟
  condition: (req) => {
    // 热点路径
    const hotPaths = ['/api/blog', '/api/book', '/api/evaluation'];
    return hotPaths.some(path => req.originalUrl.startsWith(path));
  }
});

// 用户特定缓存
const userDataCache = createCacheMiddleware({
  keyGenerator: (req) => `user_${req.user?.id || 'anonymous'}_${req.originalUrl}`,
  priority: 'warm',
  ttl: 3600, // 1小时
  condition: (req) => req.user && req.originalUrl.includes('/user/')
});

// 静态数据缓存
const staticDataCache = createCacheMiddleware({
  keyGenerator: (req) => `static_${req.originalUrl}`,
  priority: 'cold',
  ttl: 43200, // 12小时
  condition: (req) => {
    const staticPaths = ['/api/evaluation/categories', '/api/evaluation/models'];
    return staticPaths.includes(req.originalUrl);
  }
});

module.exports = {
  AdvancedCacheSystem,
  globalCache,
  createCacheMiddleware,
  hotDataCache,
  userDataCache,
  staticDataCache
};