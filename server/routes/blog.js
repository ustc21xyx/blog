const express = require('express');
const { body, validationResult, param } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const { auth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

const router = express.Router();

// 添加内存缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 缓存辅助函数
const getCacheKey = (key, params = {}) => {
  return `${key}_${JSON.stringify(params)}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // 清理过期缓存
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
};

// Get all published blog posts (with pagination)
router.get('/', optionalAuth, cacheMiddleware(300), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;

    // 创建缓存键
    const cacheKey = getCacheKey('posts', { page, limit, category, tag, search });
    
    // 检查缓存
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    let filter = { isPublished: true };
    
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 优化查询 - 只选择必要字段，使用lean()提高性能
    const posts = await BlogPost.find(filter)
      .populate('author', 'username displayName avatar', null, { lean: true })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content -comments') // 排除大字段减少数据传输
      .lean({ virtuals: false }) // 返回普通JS对象，禁用virtuals提高性能
      .hint({ isPublished: 1, publishedAt: -1 }); // 使用索引提示

    const total = await BlogPost.countDocuments(filter);

    const result = {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    // 缓存结果
    setCache(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single blog post by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug,
      isPublished: true 
    })
    .populate('author', 'username displayName avatar bio')
    .populate('comments.author', 'username displayName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await BlogPost.updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    // Check if user has liked the post
    const hasLiked = req.user ? post.likes.includes(req.user._id) : false;

    res.json({
      ...post.toJSON(),
      hasLiked
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new blog post
router.post('/', auth, [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title is required and must be under 200 characters'),
  body('content')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('category')
    .optional()
    .isIn(['anime-review', 'manga-review', 'news', 'opinion', 'tutorial', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      animeRelated,
      isPublished
    } = req.body;

    const post = new BlogPost({
      title,
      content,
      excerpt,
      author: req.user._id,
      category: category || 'other',
      tags: tags || [],
      featuredImage: featuredImage || '',
      animeRelated,
      isPublished: isPublished || false
    });

    await post.save();
    await post.populate('author', 'username displayName avatar');

    // 清除相关缓存
    clearCache('/api/blog');
    clearCache(`/api/blog/user/${req.user.username}`);

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single blog post by ID for editing
router.get('/edit/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username displayName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post for editing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blog post
router.put('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title must be under 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const updateData = { ...req.body };
    if (updateData.isPublished && !post.isPublished) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username displayName avatar');

    // 清除相关缓存
    clearCache('/api/blog');
    clearCache(`/api/blog/user/${updatedPost.author.username}`);
    clearCache(`/api/blog/${updatedPost.slug}`);

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await BlogPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likes.includes(req.user._id);
    
    if (hasLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', auth, [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .trim()
    .withMessage('Comment content is required and must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user._id,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.author', 'username displayName avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's blog posts
router.get('/user/:username', optionalAuth, cacheMiddleware(180), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 创建缓存键
    const cacheKey = getCacheKey('user_posts', { username: req.params.username, page, limit });
    
    // 检查缓存
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 构建查询条件
    let filter = { 
      author: user._id,
      isPublished: true 
    };

    // 如果是用户自己，可以看到未发布的文章
    if (req.user && req.user._id.toString() === user._id.toString()) {
      delete filter.isPublished;
    }

    // 优化查询
    const posts = await BlogPost.find(filter)
      .populate('author', 'username displayName avatar', null, { lean: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content -comments')
      .lean({ virtuals: false })
      .hint({ author: 1, createdAt: -1 });

    const total = await BlogPost.countDocuments(filter);

    const result = {
      posts,
      user: {
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    // 缓存结果（较短时间，因为用户可能会更新）
    setCache(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;