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
const bookRoutes = require('./routes/book');
// const { advancedCacheSystem } = require('./middleware/advancedCache');
const compression = require('compression');
const {
  getMongoConfig,
  getConnectionOptions,
  withSrvFallback,
  maskMongoUriCredentials
} = require('./utils/mongoConnection');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('[SERVER APP START] Attempting to load server/app.js in Vercel environment...');

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Enable compression for all responses
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

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

// Static files with caching
app.use('/uploads', express.static('uploads', {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }
}));

// Health check (before database check)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    env: process.env.NODE_ENV,
    performance: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
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
let connectPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    if (connectPromise) {
      await connectPromise;
    } else if (typeof mongoose.connection.asPromise === 'function') {
      await mongoose.connection.asPromise();
    } else {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      });
    }
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 3) {
    await mongoose.disconnect();
  }

  const { uri: mongoURI, source, isAtlas, isSrv } = getMongoConfig();

  console.log('[DB] Environment check:');
  console.log('[DB] MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
  console.log(isAtlas ? '[DB] Using cloud MongoDB Atlas' : '[DB] Using local MongoDB fallback');
  console.log(`[DB] Connection string source: ${source}`);
  console.log('[DB] Attempting connection...');
  console.log(`[DB] Connection URI: ${maskMongoUriCredentials(mongoURI)}`);
  if (isSrv) {
    console.log('[DB] Connection URI uses SRV record lookup');
  }

  connectPromise = withSrvFallback(
    (uri, options) => mongoose.connect(uri, options),
    mongoURI,
    getConnectionOptions({ bufferCommands: false })
  );

  try {
    await connectPromise;
    isConnected = true;
    console.log('🎌 MongoDB connected successfully');
  } catch (err) {
    isConnected = false;
    console.error('❌ Database connection failed:', err.message);
    throw err;
  } finally {
    connectPromise = null;
  }

  return mongoose.connection;
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
    try {
      await connectDB();
    } catch (err) {
      console.error('[API] Database connection error:', err.message);
      return res.status(503).json({
        message: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
      });
    }
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
app.use('/api/book', bookRoutes);

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
connectDB().catch((err) => {
  console.error('Initial MongoDB connection error:', err.message);
});

// Start server in development
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;