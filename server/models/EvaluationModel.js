const mongoose = require('mongoose');

const evaluationModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  version: {
    type: String,
    trim: true,
    maxLength: 50
  },
  provider: {
    type: String,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  color: {
    type: String,
    default: '#10b981', // 默认绿色
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
evaluationModelSchema.index({ name: 1 });
evaluationModelSchema.index({ provider: 1 });
evaluationModelSchema.index({ isActive: 1 });

// 复合索引：确保同一提供商下的模型名称唯一
evaluationModelSchema.index({ name: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('EvaluationModel', evaluationModelSchema);