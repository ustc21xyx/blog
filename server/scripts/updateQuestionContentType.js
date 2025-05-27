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

// 检测内容类型的函数
function detectContentType(content) {
  if (!content) return 'text';
  
  // 检查是否包含HTML标签
  const htmlPattern = /<[^>]+>/;
  if (htmlPattern.test(content)) {
    // 检查是否同时包含LaTeX公式
    const latexPattern = /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/;
    if (latexPattern.test(content)) {
      return 'mixed';
    }
    return 'html';
  }
  
  // 检查是否包含LaTeX公式
  const latexPattern = /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/;
  if (latexPattern.test(content)) {
    return 'latex';
  }
  
  return 'text';
}

const updateQuestionContentTypes = async () => {
  try {
    await connectDB();
    
    // 查找所有没有contentType字段或contentType为null/undefined的题目
    const questions = await EvaluationQuestion.find({
      $or: [
        { contentType: { $exists: false } },
        { contentType: null },
        { contentType: undefined }
      ]
    });
    
    console.log(`找到 ${questions.length} 个需要更新的题目`);
    
    let updatedCount = 0;
    
    for (const question of questions) {
      const detectedType = detectContentType(question.content);
      
      console.log(`题目 "${question.title}" - 检测到的内容类型: ${detectedType}`);
      console.log(`内容预览: ${question.content.substring(0, 100)}...`);
      
      // 更新题目
      await EvaluationQuestion.findByIdAndUpdate(
        question._id,
        { contentType: detectedType },
        { new: true }
      );
      
      updatedCount++;
    }
    
    console.log(`\n✅ 成功更新了 ${updatedCount} 个题目的内容类型`);
    
    // 验证更新结果
    const allQuestions = await EvaluationQuestion.find({});
    console.log('\n📊 所有题目的内容类型统计:');
    const typeStats = {};
    allQuestions.forEach(q => {
      const type = q.contentType || 'undefined';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });
    
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} 个`);
    });
    
  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
};

// 如果直接运行此文件
if (require.main === module) {
  updateQuestionContentTypes();
}

module.exports = { updateQuestionContentTypes, detectContentType };