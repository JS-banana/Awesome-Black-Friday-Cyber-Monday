# Awesome-Black-Friday-Cyber-Monday

- 总是使用中文和我交流沟通,但是专业术语、代码和命令、专有名词等可保留英文

## 项目介绍

- `README.md`：该文件收集整理了和黑色星期五相关的优惠活动
- `data` 目录：以 `README.md` 文件作为参考，同时维护中文版的结构化数据，供脚本与前端复用
- `apps/web`：Next.js 多语言网站，提供中英文切换与检索体验

## 翻译体系

- 统一使用 SiliconFlow `THUDM/GLM-4-9B-0414`，命令：`npm run translate:deals -- --provider siliconflow --limit <n> --batch-size 20 --concurrency 5 --request-timeout 20000`
- SiliconFlow 并发额度 5000 req/min，可在合理范围内拉高 `--concurrency` 与 `--batch-size`，但仍需关注超时日志
- 翻译脚本仅保留 `siliconflow|silicon|glm49b` 三种 provider alias，并在写入前统一清理 ANSI / 换行等脏数据
- 当前 `data/deals.zh.json` 已完成全量翻译；`productivity-desktop-apps-time-distraction-focus-daily-time-tracking` 在英文源数据存在 `' / ’` 两个版本，若重新抽取英文数据需优先去重

## 网站

- `apps/web` 仍待联调，需用最新中文数据验证页面与切换逻辑

## 当前进度

1. `data/deals.zh.json` 已跑完所有翻译并清理控制字符
2. 翻译脚本专注 SiliconFlow，其他 provider 已移除
3. `apps/web` 尚未做端到端自测

## TODO

1. 翻译质量抽检 & 针对个别重复英文记录的策略（定位 README/source 去重）
2. `apps/web` 页面联调（多语言切换、搜索过滤、构建部署）
3. 梳理数据更新流程：`extract-deals` → `translate-deals` → `export-zh-md`
