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
const evaluationRoutes = require('./routes/evaluation');
const notionRoutes = require('./routes/notion');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('[SERVER APP START] Attempting to load server/app.js in Vercel environment...');

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  trustProxy: true
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

// Debug endpoint to check environment variables (remove in production)
app.get('/api/debug', (req, res) => {
  res.json({
    envVars: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      MONGO_URI: !!process.env.MONGO_URI,
      DATABASE_URL: !!process.env.DATABASE_URL,
      MONGODB_URL: !!process.env.MONGODB_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL
    },
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('mongo') || 
      key.toLowerCase().includes('database') ||
      key.toLowerCase().includes('db')
    )
  });
});

// Database connection with better serverless handling
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    let mongoURI = process.env.MONGODB_URI || 
                   process.env.MONGO_URI || 
                   process.env.DATABASE_URL ||
                   process.env.MONGODB_URL;
    
    console.log('[DB] Environment check:');
    console.log('[DB] MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
    
    if (mongoURI) {
      if (mongoURI.includes('mongodb.net') && !mongoURI.includes('/anime-blog')) {
        mongoURI = mongoURI.replace('/?', '/anime-blog?');
      }
      console.log('[DB] Using cloud MongoDB Atlas');
    } else {
      mongoURI = 'mongodb://localhost:27017/anime-blog';
      console.log('[DB] Using local MongoDB fallback');
    }
    
    console.log('[DB] Attempting connection...');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 3
      });
    }
    
    isConnected = true;
    console.log('🎌 MongoDB connected successfully');
    
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    isConnected = false;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected event fired');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

// Middleware to ensure database connection for API routes
app.use('/api', async (req, res, next) => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    console.log('[API] Attempting to connect to database...');
    await connectDB();
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/user', userRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/notion', notionRoutes);

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