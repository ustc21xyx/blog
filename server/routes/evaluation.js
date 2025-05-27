const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const EvaluationCategory = require('../models/EvaluationCategory');
const EvaluationModel = require('../models/EvaluationModel');
const EvaluationQuestion = require('../models/EvaluationQuestion');
const ModelAnswer = require('../models/ModelAnswer');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// ========== 分类管理 API ==========

// 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await EvaluationCategory.find({ isActive: true })
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// 创建分类 (管理员)
router.post('/categories', adminAuth, [
  body('name')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Category name is required and must be under 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Description must be under 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, color } = req.body;

    // 检查名称是否已存在
    const existingCategory = await EvaluationCategory.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = new EvaluationCategory({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#6366f1',
      createdBy: req.user._id
    });

    await category.save();
    await category.populate('createdBy', 'username displayName');

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// 更新分类 (管理员)
router.put('/categories/:id', adminAuth, [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Category name must be under 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Description must be under 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const category = await EvaluationCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description.trim();
    if (req.body.color) updateData.color = req.body.color;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    Object.assign(category, updateData);
    await category.save();
    await category.populate('createdBy', 'username displayName');

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// ========== 模型管理 API ==========

// 获取所有模型
router.get('/models', async (req, res) => {
  try {
    const models = await EvaluationModel.find({ isActive: true })
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

// 创建模型 (管理员)
router.post('/models', adminAuth, [
  body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Model name is required and must be under 100 characters'),
  body('version')
    .optional()
    .isLength({ max: 50 })
    .trim(),
  body('provider')
    .optional()
    .isLength({ max: 100 })
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, version, provider, description, color } = req.body;

    const model = new EvaluationModel({
      name: name.trim(),
      version: version?.trim(),
      provider: provider?.trim(),
      description: description?.trim(),
      color: color || '#10b981',
      createdBy: req.user._id
    });

    await model.save();
    await model.populate('createdBy', 'username displayName');

    res.status(201).json({
      message: 'Model created successfully',
      model
    });
  } catch (error) {
    console.error('Create model error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Model name already exists for this provider' });
    } else {
      res.status(500).json({ message: 'Failed to create model' });
    }
  }
});

// ========== 题目管理 API ==========

// 获取题目列表
router.get('/questions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const search = req.query.search;

    let filter = { isActive: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }

    const questions = await EvaluationQuestion.find(filter)
      .populate('category', 'name color')
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EvaluationQuestion.countDocuments(filter);

    res.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// 创建题目
router.post('/questions', auth, [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title is required and must be under 200 characters'),
  body('content')
    .isLength({ min: 1, max: 10000 })
    .trim()
    .withMessage('Content is required and must be under 10000 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category is required'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('contentType')
    .optional()
    .isIn(['text', 'latex', 'html', 'mixed'])
    .withMessage('Content type must be text, latex, html, or mixed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, content, category, difficulty, tags, contentType } = req.body;

    // 验证分类是否存在
    const categoryExists = await EvaluationCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const question = new EvaluationQuestion({
      title: title.trim(),
      description: description?.trim(),
      content: content.trim(),
      contentType: contentType || 'text',
      category,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      createdBy: req.user._id
    });

    await question.save();
    await question.populate(['category', 'createdBy']);

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Failed to create question' });
  }
});

// 获取单个题目详情
router.get('/questions/:id', [
  param('id').isMongoId().withMessage('Invalid question ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const question = await EvaluationQuestion.findById(req.params.id)
      .populate('category', 'name color')
      .populate('createdBy', 'username displayName');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// 删除题目 (管理员)
router.delete('/questions/:id', adminAuth, [
  param('id').isMongoId().withMessage('Invalid question ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const question = await EvaluationQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // 软删除：设置为非活跃
    question.isActive = false;
    await question.save();

    // 同时删除相关的答案
    await ModelAnswer.updateMany(
      { questionId: req.params.id },
      { isActive: false }
    );

    res.json({
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});

// ========== 答案管理 API ==========

// 获取题目的所有答案
router.get('/questions/:questionId/answers', [
  param('questionId').isMongoId().withMessage('Invalid question ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const answers = await ModelAnswer.find({ 
      questionId: req.params.questionId,
      isActive: true 
    })
      .populate('modelId', 'name version provider color')
      .populate('submittedBy', 'username displayName')
      .populate('scoredBy', 'username displayName')
      .sort({ createdAt: -1 });

    // 转换字段名：将 modelId 重命名为 model
    const transformedAnswers = answers.map(answer => {
      const answerObj = answer.toObject();
      answerObj.model = answerObj.modelId;
      delete answerObj.modelId;
      return answerObj;
    });

    res.json({
      success: true,
      answers: transformedAnswers
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Failed to fetch answers' });
  }
});

// 提交答案
router.post('/answers', auth, [
  body('questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('modelId')
    .isMongoId()
    .withMessage('Valid model ID is required'),
  body('content')
    .isLength({ min: 1, max: 50000 })
    .trim()
    .withMessage('Content is required and must be under 50000 characters'),
  body('contentType')
    .optional()
    .isIn(['text', 'latex', 'html', 'mixed'])
    .withMessage('Content type must be text, latex, html, or mixed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { questionId, modelId, content, contentType, renderedContent, score } = req.body;

    // 验证题目和模型是否存在
    const question = await EvaluationQuestion.findById(questionId);
    const model = await EvaluationModel.findById(modelId);
    
    if (!question) {
      return res.status(400).json({ message: 'Question not found' });
    }
    if (!model) {
      return res.status(400).json({ message: 'Model not found' });
    }

    // 检查是否已有答案，如果有则设为非活跃
    await ModelAnswer.updateMany(
      { questionId, modelId, isActive: true },
      { isActive: false }
    );

    // 创建新答案
    const answer = new ModelAnswer({
      questionId,
      modelId,
      content: content.trim(),
      contentType: contentType || 'text',
      renderedContent: renderedContent?.trim(),
      score: score || 3, // 设置初始评分
      submittedBy: req.user._id,
      version: 1
    });

    await answer.save();
    await answer.populate([
      { path: 'modelId', select: 'name version provider color' },
      { path: 'submittedBy', select: 'username displayName' }
    ]);

    res.status(201).json({
      message: 'Answer submitted successfully',
      answer
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
});

// 评分
router.put('/answers/:id/score', auth, [
  param('id').isMongoId().withMessage('Invalid answer ID'),
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Score must be an integer between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const answer = await ModelAnswer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.score = req.body.score;
    answer.scoredBy = req.user._id;
    await answer.save();

    await answer.populate(['modelId', 'submittedBy', 'scoredBy']);

    res.json({
      message: 'Answer scored successfully',
      answer
    });
  } catch (error) {
    console.error('Score answer error:', error);
    res.status(500).json({ message: 'Failed to score answer' });
  }
});

// 删除答案
router.delete('/answers/:id', auth, [
  param('id').isMongoId().withMessage('Invalid answer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const answer = await ModelAnswer.findById(req.params.id)
      .populate('submittedBy', 'username displayName');
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // 检查权限：只有答案提交者或管理员可以删除
    if (answer.submittedBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 软删除：设置为非活跃
    answer.isActive = false;
    await answer.save();

    res.json({
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Failed to delete answer' });
  }
});

// ========== 排行榜 API ==========

// 获取排行榜
router.get('/leaderboard', async (req, res) => {
  try {
    // 聚合查询计算排行榜
    const leaderboard = await ModelAnswer.aggregate([
      {
        $match: {
          isActive: true,
          score: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'evaluationquestions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'question'
        }
      },
      {
        $unwind: '$question'
      },
      {
        $lookup: {
          from: 'evaluationcategories',
          localField: 'question.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $lookup: {
          from: 'evaluationmodels',
          localField: 'modelId',
          foreignField: '_id',
          as: 'model'
        }
      },
      {
        $unwind: '$model'
      },
      {
        $group: {
          _id: {
            modelId: '$modelId',
            categoryId: '$category._id'
          },
          modelName: { $first: '$model.name' },
          modelVersion: { $first: '$model.version' },
          modelProvider: { $first: '$model.provider' },
          modelColor: { $first: '$model.color' },
          categoryName: { $first: '$category.name' },
          categoryColor: { $first: '$category.color' },
          averageScore: { $avg: '$score' },
          questionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.modelId',
          modelName: { $first: '$modelName' },
          modelVersion: { $first: '$modelVersion' },
          modelProvider: { $first: '$modelProvider' },
          modelColor: { $first: '$modelColor' },
          categoryScores: {
            $push: {
              categoryId: '$_id.categoryId',
              categoryName: '$categoryName',
              categoryColor: '$categoryColor',
              averageScore: '$averageScore',
              questionCount: '$questionCount'
            }
          },
          totalScore: { $sum: '$averageScore' },
          totalQuestions: { $sum: '$questionCount' }
        }
      },
      {
        $sort: { totalScore: -1 }
      }
    ]);

    // 添加排名并转换字段名
    const transformedLeaderboard = leaderboard.map((model, index) => ({
      ...model,
      modelId: model._id, // 将 _id 重命名为 modelId
      rank: index + 1
    }));

    res.json({
      success: true,
      leaderboard: transformedLeaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
