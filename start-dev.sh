#!/bin/bash

echo "🚀 启动动漫博客开发环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

# 检查是否已安装依赖
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 安装依赖中..."
    npm run install-all
fi

# 检查环境变量文件
if [ ! -f "server/.env" ]; then
    echo "⚙️  创建环境配置文件..."
    cp server/.env.example server/.env
    echo "请编辑 server/.env 文件配置数据库连接"
fi

echo "🎉 启动开发服务器..."
echo "前端: http://localhost:3000"
echo "后端: http://localhost:5000"
echo "萌娘百科API测试: http://localhost:5000/api/character/random"
echo ""
echo "按 Ctrl+C 停止服务器"

# 启动前后端
npm run dev