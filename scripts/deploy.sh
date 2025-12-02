#!/bin/bash

# Vercel 部署脚本

set -e

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm i -g vercel"
    exit 1
fi

# 检查是否登录
echo "📝 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

# 构建测试
echo "🔨 测试本地构建..."
pnpm build --filter=web

echo "✅ 本地构建成功！"

# 部署
echo "🌐 开始部署..."
vercel --yes

echo ""
echo "✅ 部署完成！"
echo "📊 查看部署状态: https://vercel.com/dashboard"
