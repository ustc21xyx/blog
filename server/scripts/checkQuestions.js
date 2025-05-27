const mongoose = require('mongoose');
const EvaluationQuestion = require('../models/EvaluationQuestion');

// 连接数据库
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
    } else {
      await mongoose.connect('mongodb://localhost:27017/blogger');
    }
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const checkQuestions = async () => {
  try {
    await connectDB();
    
    // 查找所有题目
    const allQuestions = await EvaluationQuestion.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`\n总共有 ${allQuestions.length} 个题目`);
    
    if (allQuestions.length > 0) {
      console.log('\n📋 题目列表:');
      allQuestions.forEach((question, index) => {
        console.log(`\n${index + 1}. ${question.title}`);
        console.log(`   ID: ${question._id}`);
        console.log(`   分类: ${question.category?.name || '未知'}`);
        console.log(`   难度: ${question.difficulty}`);
        console.log(`   内容类型: ${question.contentType || '未设置'}`);
        console.log(`   是否活跃: ${question.isActive}`);
        console.log(`   内容预览: ${question.content.substring(0, 100)}...`);
        console.log(`   创建时间: ${question.createdAt}`);
      });
      
      // 统计内容类型
      console.log('\n📊 内容类型统计:');
      const typeStats = {};
      allQuestions.forEach(q => {
        const type = q.contentType || 'undefined';
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
      
      Object.entries(typeStats).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} 个`);
      });
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
};

checkQuestions();