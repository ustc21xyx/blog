const mongoose = require('mongoose');

const evaluationCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  color: {
    type: String,
    default: '#6366f1', // 默认紫色
    match: /^#[0-9A-F]{6}$/i
  },
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
evaluationCategorySchema.index({ name: 1 });
evaluationCategorySchema.index({ isActive: 1 });
evaluationCategorySchema.index({ createdBy: 1 });

module.exports = mongoose.model('EvaluationCategory', evaluationCategorySchema);