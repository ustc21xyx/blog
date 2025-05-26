const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const userRoutes = require('./routes/user');
const characterRoutes = require('./routes/character');
const proxyRoutes = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('[SERVER APP START] Attempting to load server/app.js in Vercel environment...');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware to log request details
app.use((req, res, next) => {
  console.log(`[REQ LOG] Method: ${req.method}, URL: ${req.url}, OriginalURL: ${req.originalUrl}, BaseURL: ${req.baseUrl}, Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/user', userRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/proxy', proxyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

console.log('[SERVER APP DB] Attempting to connect to MongoDB. MONGODB_URI set:', !!process.env.MONGODB_URI);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('🎌 Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});

module.exports = app;
