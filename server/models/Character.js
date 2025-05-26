const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: '暂无描述'
  },
  anime: [{
    type: String,
    trim: true
  }],
  details: {
    birthday: {
      type: String,
      default: '未知'
    },
    height: {
      type: String,
      default: '未知'
    },
    weight: {
      type: String,
      default: '未知'
    },
    cv: {
      type: String,
      default: '未知'
    }
  },
  source: {
    type: String,
    enum: ['moegirl', 'bangumi', 'manual'],
    required: true
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 添加索引
characterSchema.index({ name: 1 });
characterSchema.index({ source: 1 });
characterSchema.index({ popularity: -1 });
characterSchema.index({ isActive: 1 });

// 创建复合索引
characterSchema.index({ name: 'text', description: 'text', originalName: 'text' });

module.exports = mongoose.model('Character', characterSchema);