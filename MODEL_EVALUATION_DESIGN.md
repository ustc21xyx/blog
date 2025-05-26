# 模型评测系统详细设计

## 🎯 系统功能概述

### 核心流程
1. 管理员添加题目分类
2. 用户添加评测题目（选择分类）
3. 用户为不同模型手动录入答案
4. 用户对答案进行评分
5. 系统自动计算排行榜和可视化

## 📊 数据模型设计

### 1. 题目分类 (Category)
```typescript
interface EvaluationCategory {
  _id: string;
  name: string;              // "数学推理", "代码生成", "创意写作"
  description: string;       // 分类描述
  color: string;            // 图表中的颜色 #FF6B6B
  isActive: boolean;        // 是否启用
  createdBy: ObjectId;      // 创建者（管理员）
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 评测题目 (Question)
```typescript
interface EvaluationQuestion {
  _id: string;
  title: string;            // 题目标题
  description: string;      // 题目描述/要求
  content: string;          // 题目详细内容
  category: ObjectId;       // 所属分类
  difficulty: 'easy' | 'medium' | 'hard';
  maxScore: number;         // 满分（默认10分）
  
  // 元数据
  tags: string[];          // 额外标签
  createdBy: ObjectId;     // 创建者
  isActive: boolean;       // 是否启用
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. 模型信息 (Model)
```typescript
interface EvaluationModel {
  _id: string;
  name: string;            // "GPT-4", "Claude-3-Opus"
  version: string;         // "2024-03", "v1.0"
  provider: string;        // "OpenAI", "Anthropic"
  description: string;     // 模型描述
  color: string;          // 图表中的颜色
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: Date;
}
```

### 4. 模型答案 (Answer)
```typescript
interface ModelAnswer {
  _id: string;
  questionId: ObjectId;
  modelId: ObjectId;
  
  // 答案内容
  content: string;         // 原始答案文本
  contentType: 'text' | 'latex' | 'html' | 'mixed';
  renderedContent?: string; // 渲染后的HTML（如果需要）
  
  // 评分
  score?: number;          // 得分
  feedback?: string;       // 评分反馈
  scoredBy?: ObjectId;     // 评分者
  scoredAt?: Date;         // 评分时间
  
  // 元数据
  submittedBy: ObjectId;   // 录入者
  submittedAt: Date;
  version: number;         // 版本号（支持同题多答案）
  isActive: boolean;       // 是否为当前有效答案
}
```

### 5. 排行榜视图 (计算得出)
```typescript
interface ModelRanking {
  modelId: string;
  modelName: string;
  categoryScores: {
    categoryId: string;
    categoryName: string;
    averageScore: number;
    questionCount: number;
  }[];
  totalScore: number;       // 所有分类平均分之和
  totalQuestions: number;   // 总题目数
  rank: number;            // 排名
}
```

## 🎨 前端页面设计

### 1. 分类管理页面 (/evaluation/categories) - 管理员
- 查看所有分类
- 添加新分类（名称、描述、颜色）
- 编辑/禁用分类

### 2. 题目管理页面 (/evaluation/questions)
- 题目列表（按分类筛选）
- 添加新题目（选择分类、难度）
- 编辑题目

### 3. 模型管理页面 (/evaluation/models) - 管理员
- 模型列表
- 添加新模型
- 编辑模型信息

### 4. 答案录入页面 (/evaluation/answer/:questionId)
- 显示题目详情
- 选择模型
- 录入答案（支持文本、LaTeX、HTML）
- 实时预览渲染效果
- 评分界面

### 5. 排行榜页面 (/evaluation/leaderboard)
- 总排行榜
- 按分类查看排名
- 雷达图对比
- 详细数据表格

## 🔧 技术实现要点

### 1. LaTeX 渲染
```bash
npm install katex react-katex
```
```tsx
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// 使用示例
<BlockMath math="\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" />
```

### 2. HTML 安全渲染
```bash
npm install dompurify
```
```tsx
import DOMPurify from 'dompurify';

// 安全渲染HTML
const sanitizedHTML = DOMPurify.sanitize(htmlContent);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

### 3. 雷达图
```bash
npm install recharts
```
```tsx
import { RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
```

### 4. 富文本编辑器
```bash
npm install @monaco-editor/react
```

## 🎯 API 接口设计

### 分类管理
```
GET    /api/evaluation/categories         // 获取所有分类
POST   /api/evaluation/categories         // 创建分类（管理员）
PUT    /api/evaluation/categories/:id     // 更新分类（管理员）
DELETE /api/evaluation/categories/:id     // 删除分类（管理员）
```

### 题目管理
```
GET    /api/evaluation/questions          // 获取题目列表
POST   /api/evaluation/questions          // 创建题目
GET    /api/evaluation/questions/:id      // 获取题目详情
PUT    /api/evaluation/questions/:id      // 更新题目
DELETE /api/evaluation/questions/:id      // 删除题目
```

### 答案管理
```
GET    /api/evaluation/answers/question/:questionId  // 获取题目的所有答案
POST   /api/evaluation/answers                       // 提交答案
PUT    /api/evaluation/answers/:id                   // 更新答案
PUT    /api/evaluation/answers/:id/score             // 评分
```

### 统计数据
```
GET    /api/evaluation/leaderboard        // 获取排行榜
GET    /api/evaluation/stats/:modelId     // 获取模型统计
GET    /api/evaluation/stats/category/:categoryId // 分类统计
```

## ❓ 需要确认的问题

1. **评分权限**：谁可以对答案评分？
   - 只有答案录入者？
   - 所有用户都可以？
   - 只有管理员？

2. **题目权限**：谁可以添加题目？
   - 所有用户？
   - 只有管理员？

3. **评分制度**：
   - 评分范围：1-10？1-100？
   - 是否支持小数？
   - 是否需要评分理由？

4. **答案版本控制**：
   - 同一模型对同一题目可以有多个答案吗？
   - 如何处理答案更新？

5. **排行榜计算**：
   - 不同分类的权重是否相等？
   - 如何处理未答题目？（按0分计算还是不计入？）

请您确认这些细节，我就可以开始实现了！