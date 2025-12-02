# Awesome Black Friday & Cyber Monday Deals Assistant

> An automated data pipeline and multilingual web app to discover and manage Black Friday/Cyber Monday deals.

[中文文档](./README-zh.md) | [Original Deals List](./README-origin.md)

## ✨ Features

- 📊 **Structured Data** - Extract deals from Markdown and generate reusable JSON
- 🌐 **AI Translation** - Auto-translate deals using SiliconFlow GLM-4-9B
- 🔍 **Multilingual Search** - Next.js website with Chinese/English support
- 🚀 **Automation** - One-command data extraction, translation, and export

## 🚀 Quick Start

### Install Dependencies

```bash
pnpm install
```

### Data Processing

```bash
# Extract deals from README-origin.md
npm run extract:deals

# Translate to Chinese
npm run translate:deals -- --provider siliconflow --limit 10

# Export Chinese Markdown
npm run export:zh-md
```

### Launch Web App

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Visit: http://localhost:3000

## 🛠️ Tech Stack

- **Backend**: TypeScript, unified/remark, Zod
- **Frontend**: Next.js 15, React 18, next-intl
- **AI**: SiliconFlow GLM-4-9B (5000 req/min)
- **Styling**: TailwindCSS, shadcn/ui

## 🌐 Live Demo

**Production**: https://awesome-bfcm.vercel.app

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Vercel Quick Start](./VERCEL_QUICKSTART.md)
- [Deployment Success Report](./DEPLOYMENT_SUCCESS.md)

## 📁 Project Structure

```
.
├── data/                    # Structured data
│   ├── deals.en.json       # English deals
│   └── deals.zh.json       # Chinese translations
├── apps/web/               # Next.js app
├── packages/deals-schema/  # Data models
├── scripts/                # Automation scripts
└── README-origin.md        # Source deals list
```

## 🎯 Credits

This project is inspired by and uses data from the original [Awesome-Black-Friday-Cyber-Monday](https://github.com/trungdq88/Awesome-Black-Friday-Cyber-Monday) repository by [@trungdq88](https://github.com/trungdq88).

We've built an automated pipeline and multilingual web interface on top of the original deals list to make it more accessible to Chinese-speaking users.

## 📜 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

⭐ If this project helps you, please give it a star!
