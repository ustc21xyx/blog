#!/bin/bash

# 二次元博客启动脚本
echo "🎌 二次元博客系统启动中..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js版本过低，需要18+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 创建环境变量文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
fi

if [ ! -f server/.env ]; then
    echo "📝 创建服务端环境变量文件..."
    cp server/.env.example server/.env
fi

if [ ! -f client/.env ]; then
    echo "📝 创建客户端环境变量文件..."
    cp client/.env.example client/.env
fi

# 检查MongoDB
echo "🔍 检查MongoDB连接..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  未找到本地MongoDB，请确保MongoDB正在运行或使用Docker启动MongoDB："
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:7"
    echo ""
fi

# 安装依赖
echo "📦 检查并安装依赖..."

if [ ! -d "node_modules" ]; then
    echo "安装根目录依赖..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "安装服务端依赖..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "安装客户端依赖..."
    cd client && npm install && cd ..
fi

echo "✅ 依赖安装完成"

# 启动应用
echo ""
echo "🚀 启动二次元博客系统..."
echo "📱 前端地址: http://localhost:3000"
echo "🔌 后端地址: http://localhost:5000"
echo "📖 API文档: http://localhost:5000/api"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动开发服务器
npm run dev