const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['anime-review', 'manga-review', 'news', 'opinion', 'tutorial', 'other'],
    default: 'other'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  animeRelated: {
    title: String,
    malId: String,
    genre: [String],
    rating: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

blogPostSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 250) + '...';
  }
  
  next();
});

blogPostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

blogPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

blogPostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);