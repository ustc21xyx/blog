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
  console.log(`[REQ LOG] Method: ${req.method}, URL: ${req.url}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check (before database check)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    env: process.env.NODE_ENV
  });
});

// Database connection setup
let isConnecting = false;
const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;
  
  try {
    let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    // Fix the MongoDB URI by adding database name if missing
    if (mongoURI && mongoURI.includes('mongodb.net') && !mongoURI.includes('/anime-blog')) {
      mongoURI = mongoURI.replace('/?', '/anime-blog?');
    }
    
    if (!mongoURI) {
      mongoURI = 'mongodb://localhost:27017/anime-blog';
    }
    
    console.log('[DB] Connecting to MongoDB...');
    console.log('[DB] URI type:', mongoURI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 5,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    console.log('🎌 Connected to MongoDB successfully');
    isConnecting = false;
    
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    isConnecting = false;
    
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('[DB] Retrying connection...');
      connectDB();
    }, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  if (!isConnecting) {
    connectDB();
  }
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/user', userRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/proxy', proxyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database connection
connectDB();

// Start server in development
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
