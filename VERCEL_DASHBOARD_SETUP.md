# Vercel Dashboard 配置步骤

## 🎯 问题分析

CLI 部署时遇到的问题：
- Vercel 自动检测到 `apps/web` 作为 Next.js 项目
- 但使用 npm 而不是 pnpm 安装依赖
- `workspace:*` 依赖无法被 npm 识别

## ✅ 正确的配置方法

### 方法一：通过 Vercel Dashboard（推荐）

1. **访问 Vercel Dashboard**

   https://vercel.com/dashboard

2. **删除现有项目（如果已创建）**

   - 找到 `web` 项目
   - Settings → Advanced → Delete Project

3. **从 GitHub 导入项目**

   - 点击 "Add New..." → "Project"
   - 选择 `JS-banana/Awesome-Black-Friday-Cyber-Monday`
   - 点击 "Import"

4. **配置项目设置**（⚠️ 关键步骤）

   在 "Configure Project" 页面：

   ```
   Project Name: awesome-bfcm

   Framework Preset: Next.js

   Root Directory: apps/web  ← 点击 "Edit" 设置

   Build & Development Settings:

   Build Command:
   pnpm build

   Output Directory:
   .next (保持默认)

   Install Command:
   pnpm install

   Development Command:
   pnpm dev
   ```

5. **环境变量**（如需要）

   添加环境变量：
   ```
   SILICONFLOW_API_KEY=your_key_here
   ```

6. **部署**

   点击 "Deploy" 开始部署

### 方法二：修改现有项目配置

如果项目已经创建：

1. **访问项目设置**

   https://vercel.com/jsbananas-projects/web/settings

2. **修改 General 设置**

   - Root Directory: `apps/web`
   - Node.js Version: 20.x（推荐）

3. **修改 Build & Development Settings**

   ```
   Build Command: pnpm build
   Install Command: pnpm install
   Output Directory: .next
   Development Command: pnpm dev
   ```

4. **保存并重新部署**

   - Deployments 标签
   - 点击最新部署的 "..." 菜单
   - 选择 "Redeploy"

## 📋 配置检查清单

部署前确认：

- [ ] Root Directory 设置为 `apps/web`
- [ ] Install Command 设置为 `pnpm install`
- [ ] Build Command 设置为 `pnpm build`
- [ ] Framework Preset 为 Next.js
- [ ] Node.js 版本 >= 18

## 🔍 验证配置

部署开始后，查看构建日志应该看到：

```
✓ Installing dependencies with pnpm...
✓ pnpm install
✓ Running build command...
✓ pnpm build
```

而不是：
```
❌ npm install
❌ npm error code EUNSUPPORTEDPROTOCOL
```

## 🎉 成功标志

部署成功后你会看到：

```
✓ Build completed
✓ Deployment ready
Preview: https://awesome-bfcm-xxx.vercel.app
```

访问 URL 应该能看到你的网站。

## 📊 项目信息

- **GitHub**: https://github.com/JS-banana/Awesome-Black-Friday-Cyber-Monday
- **当前配置**: `vercel.json` 已更新
- **包管理器**: pnpm with workspaces
- **框架**: Next.js 15
- **多语言**: next-intl

## 🐛 常见错误

### 错误 1: `workspace:*` 无法识别

**原因**: 使用了 npm 而不是 pnpm

**解决**:
- 确保 Install Command 为 `pnpm install`
- 确保根目录有 `pnpm-lock.yaml`

### 错误 2: 找不到模块

**原因**: Root Directory 未设置

**解决**:
- Settings → General → Root Directory → `apps/web`

### 错误 3: Build 超时

**原因**: 依赖安装慢

**解决**:
- 检查 `pnpm-lock.yaml` 已提交
- 考虑升级 Vercel 计划

## 🔗 相关链接

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Monorepo 文档](https://vercel.com/docs/monorepos)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

**下一步**: 请访问 https://vercel.com/dashboard 按照上述步骤配置！
