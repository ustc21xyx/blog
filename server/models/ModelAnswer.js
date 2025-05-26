const mongoose = require('mongoose');

const modelAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationQuestion',
    required: true
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationModel',
    required: true
  },
  
  // 答案内容
  content: {
    type: String,
    required: true,
    maxLength: 50000
  },
  contentType: {
    type: String,
    enum: ['text', 'latex', 'html', 'mixed'],
    default: 'text'
  },
  renderedContent: {
    type: String,
    maxLength: 100000 // 渲染后的HTML可能更长
  },
  
  // 评分信息
  score: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Score must be an integer'
    }
  },
  scoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scoredAt: {
    type: Date
  },
  
  // 版本控制
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 提交信息
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 添加索引
modelAnswerSchema.index({ questionId: 1, modelId: 1 });
modelAnswerSchema.index({ questionId: 1 });
modelAnswerSchema.index({ modelId: 1 });
modelAnswerSchema.index({ submittedBy: 1 });
modelAnswerSchema.index({ scoredBy: 1 });
modelAnswerSchema.index({ isActive: 1 });
modelAnswerSchema.index({ createdAt: -1 });

// 复合索引：确保每个模型对每个问题只有一个活跃答案
modelAnswerSchema.index({ questionId: 1, modelId: 1, isActive: 1 }, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

// 中间件：评分时自动设置评分时间
modelAnswerSchema.pre('save', function(next) {
  if (this.isModified('score') && this.score !== undefined) {
    this.scoredAt = new Date();
  }
  next();
});

module.exports = mongoose.model('ModelAnswer', modelAnswerSchema);