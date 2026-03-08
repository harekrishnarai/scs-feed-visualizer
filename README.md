# 🛡️ SCS Feed Visualizer v2.0

**Next.js + React + Recharts** - Professional Supply Chain Security Intelligence Dashboard

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://scs-feed-visualizer.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwindcss)](https://tailwindcss.com/)

## 🚀 Features

### Interactive Dashboard
- 📊 **7-Day Trend Analysis** - LineChart showing daily vs. moving average
- 📈 **Top Security Sources** - BarChart with source frequency metrics
- 🎯 **Severity Distribution** - PieChart with critical/high/medium/low breakdown
- 📋 **Key Statistics** - Comprehensive data summary and insights
- 📥 **CSV Export** - Download all aggregated data

### Data Analysis
- **280+ days** of supply chain security intelligence
- **10+ security sources** aggregated
- **5,000+ articles** indexed and analyzed
- **Daily updates** (automated via GitHub Actions)
- **Severity classification** using keyword analysis

### Technical Stack
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Charts**: Recharts (interactive)
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Language**: TypeScript

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Clone & Setup
```bash
git clone https://github.com/harekrishnarai/scs-feed-visualizer.git
cd scs-feed-visualizer
npm install
```

### Generate Data Analysis
```bash
npm run analyze
```
This will:
1. Clone the SCS feed data repository
2. Analyze all 280+ days of reports
3. Generate CSV files and JSON summaries
4. Create severity classifications

### Run Locally
```bash
npm run dev
```
Visit: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 🌐 Deployment

### Option 1: Deploy on Vercel (Recommended ⭐)

**One-Click Deployment:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/harekrishnarai/scs-feed-visualizer&project-name=scs-feed-visualizer&repo-name=scs-feed-visualizer)

**Or Manual Steps:**
1. Push to GitHub: `git push origin main`
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Click "Deploy"
5. Done! 🎉

### Option 2: Deploy on Netlify
```bash
npm run build
# Then drag 'out' folder to Netlify
```

### Option 3: Deploy on GitHub Pages
```bash
npm run export
# Push 'out' folder to gh-pages branch
```

## 📊 Generated Data Files

The analysis script generates:

| File | Contents | Format |
|------|----------|--------|
| `daily-reports.csv` | Daily report counts by date | CSV |
| `source-statistics.csv` | Source mention frequency | CSV |
| `severity-breakdown.csv` | Article severity distribution | CSV |
| `articles.csv` | Top 1000 articles indexed | CSV |
| `summary.json` | Complete analysis metadata | JSON |

All files saved to `public/data/`

### CSV Sample
```
date,totalReports,day,week
2025-06-01,18,Sunday,22
2025-06-02,15,Monday,23
2025-06-03,22,Tuesday,23
```

## 🎨 Dashboard Components

### Dashboard Metrics
- **Days Tracked**: Total monitoring period
- **Total Reports**: Aggregated findings
- **Avg Reports/Day**: Daily average
- **Total Articles**: Indexed articles

### Visualizations

**Trend Chart**
- Daily actual reports
- 7-day moving average
- Time-series analysis

**Top Sources**
- Bar chart by frequency
- Top 10 security news sources
- Mention count tracking

**Severity Levels**
- Pie chart distribution
- Critical/High/Medium/Low
- Color-coded by severity

**Statistics Panel**
- Date range summary
- Max/min daily reports
- Unique source count
- Top 3 sources details

## 🔐 Security & Privacy

✅ No API keys or credentials stored
✅ Public data source only
✅ No user tracking
✅ Open source (MIT License)
✅ HTTPS by default on Vercel

## 📋 Project Structure

```
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles
├── scripts/
│   └── analyze-scs-feed.js # Data analysis script
├── public/
│   └── data/              # Generated CSV/JSON files
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── vercel.json
```

## 🔄 Data Pipeline

```
GitHub (scs-feed) 
    ↓
Git Clone (analyze-scs-feed.js)
    ↓
Parse JSON + Markdown
    ↓
Generate CSV Analysis
    ↓
Create JSON Summary
    ↓
Build Static Site (Next.js)
    ↓
Deploy (Vercel)
```

## 📈 Customization

### Add New Chart
Edit `app/page.tsx` and add a Recharts component:
```tsx
<ResponsiveContainer width="100%" height={300}>
  <YourChartType data={yourData}>
    {/* chart config */}
  </YourChartType>
</ResponsiveContainer>
```

### Modify Analysis
Edit `scripts/analyze-scs-feed.js` to:
- Change CSV columns
- Adjust severity keywords
- Add new metrics
- Modify filtering logic

### Change Color Scheme
Update in `tailwind.config.ts`:
```ts
colors: {
  primary: '#667eea',
  secondary: '#764ba2',
}
```

## 🐛 Troubleshooting

### Data Not Loading
```bash
# Regenerate data
rm -rf scs_feed_data public/data
npm run analyze
```

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next out node_modules
npm install
npm run build
```

### Port 3000 In Use
```bash
npm run dev -- -p 3001
```

## 📚 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.0.4 | React framework |
| react | 18.2.0 | UI library |
| recharts | 2.10.3 | Charts |
| tailwindcss | 3.4.1 | Styling |
| typescript | 5.3.3 | Type safety |
| lucide-react | 0.294.0 | Icons |

## 🔗 Resources

- **Data Source**: [harekrishnarai/scs-feed](https://github.com/harekrishnarai/scs-feed)
- **Next.js Docs**: [nextjs.org](https://nextjs.org/docs)
- **Recharts**: [recharts.org](https://recharts.org)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push and open PR

## 📊 Live Demo

**Dashboard**: https://scs-feed-visualizer.vercel.app/

**GitHub**: https://github.com/harekrishnarai/scs-feed-visualizer

## 📞 Support

Issues? Check:
1. [GitHub Issues](https://github.com/harekrishnarai/scs-feed-visualizer/issues)
2. Documentation above
3. Data source: harekrishnarai/scs-feed

---

**Made with ❤️ for supply chain security** 🛡️

Last Updated: March 2026
