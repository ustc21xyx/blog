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
const connectDB = async () => {
  try {
    // Check for various MongoDB URI environment variables
    let mongoURI = process.env.MONGODB_URI || 
                   process.env.MONGO_URI || 
                   process.env.DATABASE_URL ||
                   process.env.MONGODB_URL;
    
    console.log('[DB] Environment check:');
    console.log('[DB] MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('[DB] MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
    
    // Fix the MongoDB URI by adding database name if missing
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
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      socketTimeoutMS: 0,
      bufferCommands: true,
      bufferMaxEntries: 0
    });
    
    console.log('🎌 MongoDB connected successfully');
    
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('❌ Full error:', err);
    
    // Don't retry in serverless environment
    if (process.env.VERCEL) {
      console.log('[VERCEL] Running in serverless, skipping retry');
    }
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
