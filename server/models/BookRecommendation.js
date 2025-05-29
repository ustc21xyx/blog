const mongoose = require('mongoose');

const bookRecommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [200, 'Author cannot exceed 200 characters']
  },
  isbn: {
    type: String,
    trim: true,
    index: true
  },
  googleBooksId: {
    type: String,
    trim: true,
    index: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  publishedDate: {
    type: String
  },
  pageCount: {
    type: Number,
    min: 0
  },
  categories: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: 'zh'
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Rating is required']
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    minlength: [1, 'Review is required'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  recommendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readingStatus: {
    type: String,
    enum: ['want-to-read', 'reading', 'finished', 'abandoned'],
    default: 'finished'
  },
  difficulty: {
    type: String,
    enum: ['light', 'serious', 'professional'],
    default: 'light'
  },
  recommendation: {
    type: String,
    enum: ['highly-recommend', 'recommend', 'neutral', 'not-recommend'],
    required: true
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
  }
}, {
  timestamps: true
});

bookRecommendationSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

bookRecommendationSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

bookRecommendationSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

bookRecommendationSchema.set('toJSON', { virtuals: true });

bookRecommendationSchema.index({ title: 'text', author: 'text', tags: 'text' });
bookRecommendationSchema.index({ createdAt: -1 });
bookRecommendationSchema.index({ publishedAt: -1 });
bookRecommendationSchema.index({ rating: -1 });

module.exports = mongoose.model('BookRecommendation', bookRecommendationSchema);