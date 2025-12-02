# Awesome Black Friday & Cyber Monday 优惠活动助手

> 一个自动化数据管道和多语言 Web 应用，帮助你发现和管理黑色星期五的优惠活动。

## ✨ 项目特点

- 📊 **结构化数据管理** - 从 Markdown 提取优惠信息，生成可复用的 JSON 数据
- 🌐 **AI 智能翻译** - 使用 SiliconFlow GLM-4-9B 模型，自动翻译英文优惠为中文
- 🔍 **多语言搜索** - Next.js 网站支持中英文切换与实时检索
- 🚀 **自动化工具链** - 数据提取、翻译、导出一键完成

## 🏗️ 项目结构

```
.
├── data/                    # 结构化数据
│   ├── deals.json          # 英文优惠数据
│   └── deals.zh.json       # 中文翻译数据
├── apps/
│   └── web/                # Next.js 多语言网站
├── packages/
│   └── deals-schema/       # 数据模型定义
├── scripts/                # 自动化脚本
│   ├── extract-deals.ts    # 从 Markdown 提取优惠数据
│   ├── translate-deals.ts  # AI 翻译脚本
│   └── export-zh-md.ts     # 导出中文 Markdown
└── README-origin.md        # 原始优惠活动列表
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 数据处理流程

#### 1. 提取优惠数据

从 `README-origin.md` 提取结构化数据：

```bash
npm run extract:deals
```

生成 `data/deals.json`

#### 2. 翻译为中文

使用 AI 模型翻译优惠信息：

```bash
npm run translate:deals -- --provider siliconflow --limit 10
```

可选参数：
- `--limit <n>` - 限制翻译条数
- `--batch-size 20` - 批处理大小
- `--concurrency 5` - 并发请求数（SiliconFlow 支持 5000 req/min）
- `--request-timeout 20000` - 请求超时时间（毫秒）

生成 `data/deals.zh.json`

#### 3. 导出中文 Markdown

```bash
npm run export:zh-md
```

### 启动 Web 应用

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build
npm run start
```

## 🛠️ 技术栈

### 后端工具链
- **TypeScript** - 类型安全的脚本开发
- **unified / remark** - Markdown 解析和处理
- **Zod** - 数据模型验证
- **Commander** - CLI 命令行工具

### 前端应用
- **Next.js** - React 服务端渲染框架
- **多语言支持** - 中英文切换
- **实时搜索** - 快速筛选优惠信息

### AI 翻译
- **SiliconFlow API** - AI 模型服务提供商
- **GLM-4-9B** - 智谱 AI 开源大语言模型
- **高并发处理** - 支持 5000 req/min

## 📝 开发指南

### 环境配置

创建 `.env.local` 文件：

```env
# SiliconFlow API Key
SILICONFLOW_API_KEY=your_api_key_here
```

### 数据模型

数据结构定义在 `packages/deals-schema` 中，包括：

- **Category** - 优惠分类
- **Deal** - 优惠信息（标题、描述、折扣、链接等）
- **翻译元数据** - 翻译状态、时间戳

### 命令行工具

所有脚本都支持 `--help` 查看详细参数：

```bash
tsx scripts/extract-deals.ts --help
tsx scripts/translate-deals.ts --help
tsx scripts/export-zh-md.ts --help
```

## 📊 翻译质量

- ✅ 统一使用 GLM-4-9B 模型，保证翻译一致性
- ✅ 自动清理 ANSI 控制字符和换行符
- ✅ 批处理 + 并发优化，快速完成大量翻译
- ⚠️ 需定期人工抽检翻译质量

## 🌐 部署到 Vercel

### 快速部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JS-banana/Awesome-Black-Friday-Cyber-Monday)

点击上方按钮，Vercel 会自动：
1. Fork 这个仓库到你的 GitHub
2. 配置项目设置
3. 部署到生产环境

### 手动配置

**重要配置项：**
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=web`
- **Install Command**: `pnpm install`

📖 详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 使用部署脚本

```bash
# 使用 Vercel CLI 部署
./scripts/deploy.sh
```

## 🎯 未来计划

- [ ] Web 应用端到端测试
- [ ] 翻译质量评估工具
- [ ] 数据增量更新机制
- [ ] 支持更多 AI 翻译模型
- [ ] 优惠活动提醒功能

## 📄 原始数据

原始的优惠活动列表保存在 [`README-origin.md`](./README-origin.md) 文件中。

## 📜 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
