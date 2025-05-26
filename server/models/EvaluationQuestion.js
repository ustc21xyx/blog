const mongoose = require('mongoose');

const evaluationQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  content: {
    type: String,
    required: true,
    maxLength: 10000
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationCategory',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  maxScore: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 30
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 添加索引
evaluationQuestionSchema.index({ title: 'text', content: 'text' });
evaluationQuestionSchema.index({ category: 1 });
evaluationQuestionSchema.index({ difficulty: 1 });
evaluationQuestionSchema.index({ isActive: 1 });
evaluationQuestionSchema.index({ createdBy: 1 });
evaluationQuestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EvaluationQuestion', evaluationQuestionSchema);