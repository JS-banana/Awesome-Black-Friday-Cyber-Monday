# Vercel 部署指南

## 🚀 快速部署

### 方法一：通过 Vercel Dashboard（推荐）

#### 1. 准备工作

确保项目已推送到 GitHub：
```bash
git push origin main
```

#### 2. 导入项目到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 选择 **"Import Git Repository"**
4. 找到并选择 `JS-banana/Awesome-Black-Friday-Cyber-Monday`

#### 3. 配置项目设置

**重要配置项：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Framework Preset** | `Next.js` | 自动检测 |
| **Root Directory** | `apps/web` | ⚠️ 必须设置，指向 Next.js 应用 |
| **Build Command** | `cd ../.. && pnpm install && pnpm build --filter=web` | Monorepo 构建命令 |
| **Output Directory** | `apps/web/.next` | Next.js 输出目录 |
| **Install Command** | `pnpm install` | 使用 pnpm 安装依赖 |

**截图示例：**
```
Framework Preset: Next.js
Root Directory: apps/web  ← 点击 "Edit" 修改
Build Command: cd ../.. && pnpm install && pnpm build --filter=web
Output Directory: .next (默认即可，因为已设置 Root Directory)
Install Command: pnpm install
```

#### 4. 环境变量设置（可选）

如果项目需要环境变量，在 **"Environment Variables"** 区域添加：

```env
# 示例：如果需要 API Key
SILICONFLOW_API_KEY=your_api_key_here
```

#### 5. 部署

点击 **"Deploy"** 按钮开始部署。

---

### 方法二：使用 Vercel CLI

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

在项目根目录运行：

```bash
vercel
```

按照提示操作：
- **Set up and deploy**: Yes
- **Which scope**: 选择你的账户
- **Link to existing project**: No
- **Project name**: awesome-black-friday-cyber-monday
- **Directory**: `apps/web`

#### 4. 生产部署

```bash
vercel --prod
```

---

## 🔧 高级配置

### vercel.json 配置文件

在项目根目录创建 `vercel.json`（可选）：

```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm build --filter=web",
  "devCommand": "cd apps/web && pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

### 自定义域名

1. 进入项目的 **Settings** → **Domains**
2. 添加你的自定义域名
3. 配置 DNS 记录（Vercel 会提供详细指引）

### 环境变量管理

在 Vercel Dashboard 中：
1. 进入项目 **Settings** → **Environment Variables**
2. 添加需要的环境变量
3. 选择环境：Production / Preview / Development

---

## 📦 Monorepo 特殊说明

### 为什么需要特殊配置？

这个项目使用 **pnpm workspaces**，结构如下：

```
.
├── apps/
│   └── web/          ← Next.js 应用在这里
├── packages/
│   └── deals-schema/ ← 共享代码包
├── package.json      ← 根 package.json
└── pnpm-workspace.yaml
```

### 构建流程解析

```bash
cd ../.. && pnpm install && pnpm build --filter=web
```

1. `cd ../..` - 回到项目根目录（因为 Root Directory 设置为 `apps/web`）
2. `pnpm install` - 在根目录安装所有依赖（包括 workspace 依赖）
3. `pnpm build --filter=web` - 只构建 web 应用

### workspace 依赖处理

`apps/web/package.json` 中有：
```json
"@awesome-bfcm/deals-schema": "workspace:*"
```

Vercel 会自动处理 workspace 依赖，无需额外配置。

---

## ⚠️ 常见问题

### 1. 构建失败：找不到 workspace 依赖

**问题**：`Cannot find module '@awesome-bfcm/deals-schema'`

**解决方案**：
- 确保 Build Command 包含 `cd ../..` 回到根目录
- 确保使用 `pnpm install` 而不是 `npm install`

### 2. 构建超时

**问题**：Build exceeds maximum duration

**解决方案**：
- 优化依赖：移除不必要的 devDependencies
- 升级 Vercel 计划（免费版有构建时间限制）

### 3. Root Directory 设置错误

**问题**：部署后 404 或找不到应用

**解决方案**：
- 确保 Root Directory 设置为 `apps/web`
- 不要设置为项目根目录

### 4. 多语言路由问题

**问题**：next-intl 路由不工作

**解决方案**：
项目已配置 `middleware.ts`，Vercel 会自动处理。确保：
- `apps/web/middleware.ts` 存在
- `next.config.ts` 包含 next-intl 插件配置

---

## 🎯 部署检查清单

部署前确认：

- [ ] 代码已推送到 GitHub
- [ ] `apps/web` 目录存在且包含 Next.js 应用
- [ ] `pnpm-lock.yaml` 已提交到 Git
- [ ] 环境变量已配置（如需要）
- [ ] Root Directory 设置为 `apps/web`
- [ ] Build Command 包含 monorepo 构建逻辑

部署后测试：

- [ ] 首页可以正常访问
- [ ] 中英文切换功能正常
- [ ] 搜索功能正常
- [ ] 优惠数据显示正确
- [ ] 所有页面路由可访问

---

## 📊 性能优化建议

### 1. 启用 Edge Runtime（可选）

在需要的页面添加：
```typescript
export const runtime = 'edge';
```

### 2. 图片优化

使用 Next.js Image 组件：
```typescript
import Image from 'next/image';
```

### 3. 数据缓存

利用 Next.js 15 的缓存策略：
```typescript
export const revalidate = 3600; // 1小时
```

---

## 🔗 相关资源

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Monorepo Support](https://vercel.com/docs/monorepos)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

## 🆘 获取帮助

如果遇到部署问题：

1. 查看 Vercel 部署日志：Dashboard → Deployments → 点击具体部署
2. 检查构建日志中的错误信息
3. 参考 [Vercel Support](https://vercel.com/support)
4. 提交 GitHub Issue
