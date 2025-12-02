# Awesome Black Friday & Cyber Monday 优惠活动助手

> 一个自动化数据管道和多语言 Web 应用，帮助你发现和管理黑色星期五/网络星期一的优惠活动。

[English](./README.md) | [原始优惠列表](./README-origin.md)

## ✨ 项目特点

- 📊 **结构化数据管理** - 从 Markdown 提取优惠信息，生成可复用的 JSON 数据
- 🌐 **AI 智能翻译** - 使用 SiliconFlow GLM-4-9B 模型，自动翻译英文优惠为中文
- 🔍 **多语言搜索** - Next.js 网站支持中英文切换与实时检索
- 🚀 **自动化工具链** - 数据提取、翻译、导出一键完成

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 数据处理

```bash
# 从 README-origin.md 提取优惠数据
npm run extract:deals

# 翻译为中文
npm run translate:deals -- --provider siliconflow --limit 10

# 导出中文 Markdown
npm run export:zh-md
```

### 启动 Web 应用

```bash
# 开发模式
npm run dev

# 生产版本
npm run build
npm run start
```

访问: http://localhost:3000

## 🛠️ 技术栈

- **后端工具**: TypeScript, unified/remark, Zod
- **前端应用**: Next.js 15, React 18, next-intl
- **AI 翻译**: SiliconFlow GLM-4-9B (5000 req/min)
- **UI 样式**: TailwindCSS, shadcn/ui

## 🌐 在线演示

**生产环境**: https://awesome-bfcm.vercel.app

## 📖 文档

- [部署指南](./DEPLOYMENT.md)
- [Vercel 快速开始](./VERCEL_QUICKSTART.md)
- [部署成功报告](./DEPLOYMENT_SUCCESS.md)

## 📁 项目结构

```
.
├── data/                    # 结构化数据
│   ├── deals.en.json       # 英文优惠数据
│   └── deals.zh.json       # 中文翻译数据
├── apps/web/               # Next.js 多语言网站
├── packages/deals-schema/  # 数据模型定义
├── scripts/                # 自动化脚本
└── README-origin.md        # 原始优惠活动列表
```

## 🎯 致谢

本项目灵感来源于 [@trungdq88](https://github.com/trungdq88) 的 [Awesome-Black-Friday-Cyber-Monday](https://github.com/trungdq88/Awesome-Black-Friday-Cyber-Monday) 项目，并使用了其中的优惠数据。

我们在原始优惠列表的基础上构建了自动化数据管道和多语言 Web 界面，让中文用户也能方便地浏览和搜索这些优惠信息。

## 📜 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
