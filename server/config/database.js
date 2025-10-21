const mongoose = require('mongoose');
const {
  getMongoConfig,
  getConnectionOptions,
  withSrvFallback,
  maskMongoUriCredentials
} = require('../utils/mongoConnection');

const registerConnectionEvents = () => {
  if (!mongoose.connection.listenerCount('error')) {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
  }

  if (!mongoose.connection.listenerCount('disconnected')) {
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  }

  if (!mongoose.connection.listenerCount('reconnected')) {
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  }
};

const connectDB = async () => {
  try {
    const { uri: mongoURI, source, isAtlas, isSrv } = getMongoConfig();

    console.log('[DB] Environment check:');
    console.log('[DB] MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
    console.log(isAtlas ? '[DB] Using cloud MongoDB Atlas' : '[DB] Using local MongoDB fallback');
    console.log(`[DB] Connection string source: ${source}`);
    console.log(`[DB] Connection URI: ${maskMongoUriCredentials(mongoURI)}`);
    if (isSrv) {
      console.log('[DB] Connection URI uses SRV record lookup');
    }
    console.log('[DB] Attempting connection...');

    const connection = await withSrvFallback(
      (uri, options) => mongoose.connect(uri, options),
      mongoURI,
      getConnectionOptions({ bufferCommands: false, minPoolSize: 2 })
    );

    console.log(`MongoDB Connected: ${connection.connection?.host || mongoose.connection.host}`);

    registerConnectionEvents();

    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
