# Vercel 快速部署指南

## 🚀 三种部署方式

### 方式一：一键部署（最快）

1. 点击下方按钮：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JS-banana/Awesome-Black-Friday-Cyber-Monday)

2. Vercel 会自动 fork 仓库并部署

3. **重要**：部署后需要手动配置：
   - 进入项目 Settings → General
   - 找到 **Root Directory**
   - 设置为 `apps/web`
   - 重新部署

---

### 方式二：从 GitHub 导入（推荐）

1. **访问 Vercel Dashboard**

   https://vercel.com/dashboard

2. **导入项目**

   点击 "Add New..." → "Project" → 选择你的 GitHub 仓库

3. **配置项目**（关键步骤）

   ```
   Framework Preset: Next.js
   Root Directory: apps/web  ← 必须设置！
   Build Command: cd ../.. && pnpm install && pnpm build --filter=web
   Install Command: pnpm install
   ```

4. **部署**

   点击 "Deploy" 开始部署

5. **等待完成**

   首次部署约需 2-3 分钟

---

### 方式三：使用 CLI 部署

1. **安装 Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **登录**

   ```bash
   vercel login
   ```

3. **运行部署脚本**

   ```bash
   ./scripts/deploy.sh
   ```

   或手动部署：

   ```bash
   cd apps/web
   vercel
   ```

---

## ⚙️ 核心配置说明

### 为什么需要特殊配置？

这是一个 **pnpm monorepo** 项目：

```
.
├── apps/web/          ← Next.js 应用
├── packages/          ← 共享代码
└── pnpm-workspace.yaml
```

### 必须的配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Root Directory** | `apps/web` | ⚠️ 必须设置 |
| **Build Command** | `cd ../.. && pnpm install && pnpm build --filter=web` | Monorepo 构建 |
| **Install Command** | `pnpm install` | 使用 pnpm |

### Build Command 解析

```bash
cd ../..                           # 回到项目根目录
pnpm install                       # 安装所有依赖
pnpm build --filter=web           # 只构建 web 应用
```

---

## ✅ 部署后检查

访问部署的网站，确认：

- [ ] 首页可以访问
- [ ] 中英文切换正常
- [ ] 搜索功能正常
- [ ] 优惠数据显示

---

## 🐛 常见问题

### 问题 1：404 Not Found

**原因**：Root Directory 未设置或设置错误

**解决**：
1. Settings → General → Root Directory
2. 设置为 `apps/web`
3. Deployments → 点击最新部署 → Redeploy

---

### 问题 2：Cannot find module '@awesome-bfcm/deals-schema'

**原因**：Build Command 未正确配置 monorepo

**解决**：
1. Settings → General → Build & Development Settings
2. Build Command 改为：
   ```bash
   cd ../.. && pnpm install && pnpm build --filter=web
   ```
3. Redeploy

---

### 问题 3：Build timeout

**原因**：首次构建较慢或依赖过多

**解决**：
- 等待几分钟后重试
- 检查 pnpm-lock.yaml 是否已提交
- 考虑升级 Vercel 计划

---

## 🎯 下一步

部署成功后：

1. **绑定自定义域名**

   Settings → Domains → 添加域名

2. **配置环境变量**（如需要）

   Settings → Environment Variables

   ```env
   SILICONFLOW_API_KEY=xxx
   ```

3. **设置自动部署**

   已默认开启：push 到 main 分支自动部署

4. **查看部署日志**

   Deployments → 点击具体部署 → Build Logs

---

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT.md)
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署](https://nextjs.org/docs/deployment)

---

## 🆘 需要帮助？

- 查看构建日志：Dashboard → Deployments → 点击部署
- Vercel Support: https://vercel.com/support
- 提交 Issue: https://github.com/JS-banana/Awesome-Black-Friday-Cyber-Monday/issues
