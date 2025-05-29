const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // 连接池优化
      maxPoolSize: 10, // 最大连接数
      minPoolSize: 2,  // 最小连接数
      maxIdleTimeMS: 30000, // 连接空闲时间
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket超时
      heartbeatFrequencyMS: 10000, // 心跳频率
      
      // 缓冲优化
      bufferMaxEntries: 0, // 禁用mongoose缓冲
      bufferCommands: false, // 禁用命令缓冲
      
      // 其他优化
      retryWrites: true,
      w: 'majority',
      // 允许通过环境变量控制读取偏好，便于使用多区域副本
      readPreference: process.env.MONGODB_READ_PREFERENCE || 'primaryPreferred',
      compressors: ['zlib'], // 启用压缩
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 