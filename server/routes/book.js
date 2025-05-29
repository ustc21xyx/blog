const express = require('express');
const { body, validationResult, param } = require('express-validator');
const BookRecommendation = require('../models/BookRecommendation');
const { auth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const axios = require('axios');

const router = express.Router();

// 内存缓存用于书籍搜索
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10分钟缓存

const getCacheKey = (key, params = {}) => {
  return `book_${key}_${JSON.stringify(params)}`;
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
  
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
};

// 搜索书籍 (Google Books API)
router.get('/search', async (req, res) => {
  try {
    const { q, maxResults = 10, startIndex = 0 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters' 
      });
    }

    const cacheKey = getCacheKey('search', { q, maxResults, startIndex });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const searchQuery = encodeURIComponent(q.trim());
    // 尝试多种搜索策略
    const searchUrls = [
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=${maxResults}&startIndex=${startIndex}&printType=books`,
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchQuery}&maxResults=${maxResults}&startIndex=${startIndex}&printType=books`,
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=zh&printType=books`
    ];

    let allBooks = [];
    let totalItems = 0;

    // 尝试多个搜索URL，合并结果
    for (const url of searchUrls) {
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'AnimeBookBlog/1.0'
          }
        });

        if (response.data.items) {
          const books = response.data.items.map(item => {
            const volumeInfo = item.volumeInfo || {};
            const imageLinks = volumeInfo.imageLinks || {};
            
            return {
              id: item.id,
              title: volumeInfo.title || 'Unknown Title',
              authors: volumeInfo.authors || ['Unknown Author'],
              author: (volumeInfo.authors || ['Unknown Author']).join(', '),
              description: volumeInfo.description || '',
              publishedDate: volumeInfo.publishedDate || '',
              pageCount: volumeInfo.pageCount || 0,
              categories: volumeInfo.categories || [],
              language: volumeInfo.language || 'zh',
              isbn: volumeInfo.industryIdentifiers?.find(id => 
                id.type === 'ISBN_13' || id.type === 'ISBN_10'
              )?.identifier || '',
              coverImage: imageLinks.thumbnail || imageLinks.smallThumbnail || '',
              googleBooksId: item.id
            };
          });

          allBooks.push(...books);
          totalItems = Math.max(totalItems, response.data.totalItems || 0);
        }
      } catch (err) {
        console.warn(`Search URL failed: ${url}`, err.message);
        continue;
      }
    }

    // 去重（基于googleBooksId）
    const uniqueBooks = allBooks.filter((book, index, self) => 
      index === self.findIndex(b => b.googleBooksId === book.googleBooksId)
    );

    // 按相关性排序：标题匹配度 > 作者匹配度 > 其他
    const searchLower = q.toLowerCase();
    const sortedBooks = uniqueBooks.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aAuthor = a.author.toLowerCase();
      const bAuthor = b.author.toLowerCase();

      // 完全标题匹配优先
      if (aTitle.includes(searchLower) && !bTitle.includes(searchLower)) return -1;
      if (!aTitle.includes(searchLower) && bTitle.includes(searchLower)) return 1;
      
      // 作者匹配度
      if (aAuthor.includes(searchLower) && !bAuthor.includes(searchLower)) return -1;
      if (!aAuthor.includes(searchLower) && bAuthor.includes(searchLower)) return 1;

      // 标题开头匹配优先
      if (aTitle.startsWith(searchLower) && !bTitle.startsWith(searchLower)) return -1;
      if (!aTitle.startsWith(searchLower) && bTitle.startsWith(searchLower)) return 1;

      return 0;
    });

    const result = {
      books: sortedBooks.slice(0, maxResults),
      totalItems: uniqueBooks.length
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Book search error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        message: 'Search request timeout' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to search books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 获取书籍详情 (Google Books API)
router.get('/details/:googleBooksId', async (req, res) => {
  try {
    const { googleBooksId } = req.params;
    
    const cacheKey = getCacheKey('details', { googleBooksId });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const url = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`;
    const response = await axios.get(url, { timeout: 5000 });

    const item = response.data;
    const volumeInfo = item.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    const bookDetails = {
      id: item.id,
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || ['Unknown Author'],
      author: (volumeInfo.authors || ['Unknown Author']).join(', '),
      description: volumeInfo.description || '',
      publishedDate: volumeInfo.publishedDate || '',
      publisher: volumeInfo.publisher || '',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      language: volumeInfo.language || 'zh',
      isbn: volumeInfo.industryIdentifiers?.find(id => 
        id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier || '',
      coverImage: imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail || '',
      googleBooksId: item.id,
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || ''
    };

    setCache(cacheKey, bookDetails);
    res.json(bookDetails);
  } catch (error) {
    console.error('Get book details error:', error.message);
    res.status(500).json({ 
      message: 'Failed to get book details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 获取所有书籍推荐 (分页)
router.get('/', optionalAuth, cacheMiddleware(300), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const difficulty = req.query.difficulty;
    const recommendation = req.query.recommendation;
    const sortBy = req.query.sortBy || 'publishedAt'; // publishedAt, rating, views

    const cacheKey = getCacheKey('recommendations', { 
      page, limit, category, search, difficulty, recommendation, sortBy 
    });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    let filter = { isPublished: true };
    
    if (category) filter.categories = { $in: [category] };
    if (difficulty) filter.difficulty = difficulty;
    if (recommendation) filter.recommendation = recommendation;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { review: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { rating: -1, publishedAt: -1 };
        break;
      case 'views':
        sortOptions = { views: -1, publishedAt: -1 };
        break;
      case 'likes':
        sortOptions = { 'likes.length': -1, publishedAt: -1 };
        break;
      default:
        sortOptions = { publishedAt: -1 };
    }

    const books = await BookRecommendation.find(filter)
      .populate('recommendedBy', 'username displayName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BookRecommendation.countDocuments(filter);

    const result = {
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 获取单个书籍推荐
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await BookRecommendation.findOne({ 
      _id: req.params.id,
      isPublished: true 
    })
    .populate('recommendedBy', 'username displayName avatar bio')
    .populate('comments.author', 'username displayName avatar');

    if (!book) {
      return res.status(404).json({ message: 'Book recommendation not found' });
    }

    // 增加浏览量
    await BookRecommendation.updateOne(
      { _id: book._id },
      { $inc: { views: 1 } }
    );

    // 检查用户是否点赞
    const hasLiked = req.user ? book.likes.includes(req.user._id) : false;

    res.json({
      ...book.toJSON(),
      hasLiked
    });
  } catch (error) {
    console.error('Get book recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 创建书籍推荐
router.post('/', auth, [
  body('title')
    .isLength({ min: 1, max: 300 })
    .trim()
    .withMessage('Title is required and must be under 300 characters'),
  body('author')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Author is required and must be under 200 characters'),
  body('rating')
    .isFloat({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('review')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review must be between 10 and 2000 characters'),
  body('recommendation')
    .isIn(['highly-recommend', 'recommend', 'neutral', 'not-recommend'])
    .withMessage('Invalid recommendation value'),
  body('difficulty')
    .optional()
    .isIn(['light', 'serious', 'professional'])
    .withMessage('Invalid difficulty value'),
  body('readingStatus')
    .optional()
    .isIn(['want-to-read', 'reading', 'finished', 'abandoned'])
    .withMessage('Invalid reading status value')
], async (req, res) => {
  try {
    console.log('Creating book recommendation with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      title,
      author,
      isbn,
      googleBooksId,
      coverImage,
      description,
      publishedDate,
      pageCount,
      categories,
      language,
      rating,
      review,
      tags,
      readingStatus,
      difficulty,
      recommendation,
      isPublished
    } = req.body;

    const book = new BookRecommendation({
      title,
      author,
      isbn,
      googleBooksId,
      coverImage,
      description,
      publishedDate,
      pageCount,
      categories: categories || [],
      language: language || 'zh',
      rating,
      review,
      tags: tags || [],
      recommendedBy: req.user._id,
      readingStatus: readingStatus || 'finished',
      difficulty: difficulty || 'intermediate',
      recommendation,
      isPublished: isPublished || false
    });

    await book.save();
    await book.populate('recommendedBy', 'username displayName avatar');

    clearCache('/api/book');

    res.status(201).json({
      message: 'Book recommendation created successfully',
      book
    });
  } catch (error) {
    console.error('Create book recommendation error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.message
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 更新书籍推荐
router.put('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid book ID'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = await BookRecommendation.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book recommendation not found' });
    }

    if (book.recommendedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this recommendation' });
    }

    const updateData = { ...req.body };
    if (updateData.isPublished && !book.isPublished) {
      updateData.publishedAt = new Date();
    }

    const updatedBook = await BookRecommendation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('recommendedBy', 'username displayName avatar');

    clearCache('/api/book');

    res.json({
      message: 'Book recommendation updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update book recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 删除书籍推荐
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await BookRecommendation.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book recommendation not found' });
    }

    if (book.recommendedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this recommendation' });
    }

    await BookRecommendation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book recommendation deleted successfully' });
  } catch (error) {
    console.error('Delete book recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 点赞/取消点赞
router.post('/:id/like', auth, async (req, res) => {
  try {
    const book = await BookRecommendation.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book recommendation not found' });
    }

    const hasLiked = book.likes.includes(req.user._id);
    
    if (hasLiked) {
      book.likes.pull(req.user._id);
    } else {
      book.likes.push(req.user._id);
    }

    await book.save();

    res.json({
      message: hasLiked ? 'Book unliked' : 'Book liked',
      likeCount: book.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Like book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 添加评论
router.post('/:id/comments', auth, [
  body('content')
    .isLength({ min: 1, max: 500 })
    .trim()
    .withMessage('Comment content is required and must be under 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = await BookRecommendation.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book recommendation not found' });
    }

    const comment = {
      author: req.user._id,
      content: req.body.content
    };

    book.comments.push(comment);
    await book.save();

    await book.populate('comments.author', 'username displayName avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: book.comments[book.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 获取用户的书籍推荐
router.get('/user/:username', optionalAuth, cacheMiddleware(180), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = { 
      recommendedBy: user._id,
      isPublished: true 
    };

    if (req.user && req.user._id.toString() === user._id.toString()) {
      delete filter.isPublished;
    }

    const books = await BookRecommendation.find(filter)
      .populate('recommendedBy', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BookRecommendation.countDocuments(filter);

    res.json({
      books,
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
    });
  } catch (error) {
    console.error('Get user book recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;