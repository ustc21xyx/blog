# 管理员系统设置指南

## 🔐 管理员系统概述

你的博客系统已经实现了完整的管理员权限系统：

### 权限对比
- **普通用户**: 可以创建博客、创建评测题目、提交答案、评分
- **管理员**: 拥有普通用户所有权限 + 可以创建评测分类、添加AI模型、管理用户权限

## 📋 添加管理员的方法

### 方法1: 使用脚本创建管理员（推荐）

1. 在服务器上进入项目目录：
```bash
cd /path/to/your/blog/server
```

2. 运行创建管理员脚本：
```bash
node scripts/createAdmin.js <用户名> <邮箱> <密码> <显示名称>
```

**示例**：
```bash
node scripts/createAdmin.js admin admin@yourdomain.com admin123456 "系统管理员"
```

### 方法2: 通过API提升现有用户

如果你已经有管理员账户，可以通过API提升其他用户：

1. **获取用户列表**（需要管理员权限）：
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-domain.com/api/user?page=1&limit=10
```

2. **提升用户为管理员**：
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-domain.com/api/user/USER_ID/promote
```

3. **降级管理员为普通用户**：
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-domain.com/api/user/USER_ID/demote
```

### 方法3: 直接修改数据库

如果你有数据库访问权限：

1. 连接到MongoDB
2. 找到要提升的用户
3. 修改用户的role字段：

```javascript
// 在MongoDB shell中执行
db.users.updateOne(
  { username: "要提升的用户名" },
  { $set: { role: "admin" } }
)
```

## 🛡️ 安全注意事项

1. **首个管理员**: 建议使用方法1创建第一个管理员账户
2. **强密码**: 管理员账户必须使用强密码
3. **权限控制**: 管理员不能修改自己的权限（防止误操作）
4. **备用管理员**: 建议设置至少2个管理员账户以防意外

## 📊 管理员功能

### 评测系统管理
- ✅ 创建/删除评测分类
- ✅ 添加/删除AI模型
- ✅ 查看所有用户的评测数据

### 用户管理
- ✅ 查看用户列表
- ✅ 提升用户为管理员
- ✅ 降级管理员权限
- ✅ 查看管理员列表

### 内容管理
- ✅ 管理博客内容
- ✅ 删除任何用户的评测题目/答案（如果需要的话）

## 🔧 验证管理员权限

创建管理员后，可以通过以下方式验证：

1. **登录测试**: 使用管理员账户登录
2. **权限测试**: 访问评测系统，检查是否能看到"添加分类"和"添加模型"按钮
3. **API测试**: 调用管理员专用的API端点

## 🚨 故障排除

### 脚本运行失败
- 检查MongoDB连接字符串（MONGODB_URI环境变量）
- 确保数据库可访问
- 检查用户名/邮箱是否已存在

### 权限不生效
- 清除浏览器缓存和localStorage
- 重新登录账户
- 检查JWT token是否包含正确的role信息

### API调用失败
- 确认Authorization header格式正确
- 检查token是否过期
- 验证API endpoint是否正确

## 📞 获取帮助

如果遇到问题，请检查：
1. 服务器日志中的错误信息
2. 浏览器控制台的错误
3. 数据库连接状态
4. 环境变量配置

---

**注意**: 管理员权限很重要，请谨慎分配给可信任的用户！