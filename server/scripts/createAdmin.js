const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 导入用户模型
const User = require('../models/User');

async function createAdmin(username, email, password, displayName) {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`User ${username} is already an admin`);
        return;
      } else {
        // 将现有用户提升为管理员
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ User ${username} has been promoted to admin`);
        return;
      }
    }

    // 创建新的管理员用户
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const admin = new User({
      username,
      email,
      password: hashedPassword,
      displayName,
      role: 'admin'
    });

    await admin.save();
    console.log(`✅ Admin user created successfully:`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Display Name: ${displayName}`);
    console.log(`   Role: admin`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// 从命令行参数获取信息
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node createAdmin.js <username> <email> <password> <displayName>');
    console.log('Example: node createAdmin.js admin admin@example.com admin123 "管理员"');
    process.exit(1);
  }

  const [username, email, password, displayName] = args;
  createAdmin(username, email, password, displayName);
}

module.exports = { createAdmin };