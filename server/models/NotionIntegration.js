const mongoose = require('mongoose');

const syncHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['export', 'import'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  error: String,
  metadata: {
    blogPostId: String,
    notionPageId: String,
    itemCount: Number
  }
}, { timestamps: true });

const notionIntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  workspaceId: String,
  workspaceName: String,
  databaseId: String, // Default database for blog posts
  botId: String,
  isActive: {
    type: Boolean,
    default: true
  },
  syncHistory: [syncHistorySchema],
  lastSyncAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Encrypt access token before saving
notionIntegrationSchema.pre('save', function(next) {
  if (this.isModified('accessToken') && this.accessToken) {
    // In production, you should encrypt the access token
    // For demo purposes, we'll store it as-is
    // this.accessToken = encrypt(this.accessToken);
  }
  next();
});

module.exports = mongoose.model('NotionIntegration', notionIntegrationSchema);