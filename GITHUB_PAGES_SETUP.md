# 🚀 GitHub Pages Auto-Deployment Setup Guide

## Overview

This guide covers automatic deployment of the SCS Feed Visualizer to GitHub Pages using GitHub Actions.

**What happens:**
1. ✅ Code pushed to `main` branch
2. ✅ GitHub Action triggers automatically
3. ✅ Next.js app builds
4. ✅ CSV data analysis generates
5. ✅ Static files deploy to `gh-pages` branch
6. ✅ Website live at `https://USERNAME.github.io/scs-feed-visualizer/`

---

## Prerequisites

- ✅ GitHub repository (already created)
- ✅ GitHub account with write permissions
- ✅ Node.js 18+ (for local testing)

---

## Step 1: Enable GitHub Pages

### In Repository Settings

1. Go to: **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `gh-pages`
   - **Folder**: Select `/ (root)`
3. Click **Save**

### Expected Result
- ✅ GitHub Pages enabled
- ✅ Website will be published at: `https://USERNAME.github.io/scs-feed-visualizer/`

---

## Step 2: Configure GitHub Actions

The workflows are already set up! Two options available:

### Option A: Auto-Deploy (Recommended)
**File**: `.github/workflows/deploy-github-pages.yml`

**Triggers:**
- ✅ On push to `main` branch
- ✅ Daily at 2 AM UTC (data refresh)
- ✅ Manual trigger from Actions tab
- ✅ On pull requests (preview build)

### Option B: Manual Deploy
**File**: `.github/workflows/manual-deploy.yml`

**How to use:**
1. Go to: **Actions** tab
2. Select: **"Manual Deploy to GitHub Pages"**
3. Click: **"Run workflow"**
4. Choose options:
   - ✅ Rebuild data? (Yes/No)
5. Click: **"Run workflow"**

---

## Step 3: Verify Workflow Permissions

1. Go to: **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - ✅ Select: "Read and write permissions"
   - ✅ Check: "Allow GitHub Actions to create and approve pull requests"
3. Click **Save**

---

## Step 4: Test the Deployment

### Method 1: Push to Main Branch
```bash
git add .
git commit -m "Trigger deployment"
git push origin main
```

Then:
1. Go to **Actions** tab
2. Watch: "Deploy to GitHub Pages" workflow
3. Wait for: ✅ All checks to pass
4. Visit: `https://USERNAME.github.io/scs-feed-visualizer/`

### Method 2: Manual Trigger
1. Go to **Actions** tab
2. Select: "Deploy to GitHub Pages" workflow
3. Click: "Run workflow" button
4. Click: "Run workflow" again to confirm
5. Wait ~2-3 minutes for build to complete

---

## Workflow Details

### deploy-github-pages.yml

**What it does:**
```
┌─────────────────────────────────────────┐
│ 1. Checkout code                        │
│ 2. Setup Node.js 18                     │
│ 3. Install npm dependencies             │
│ 4. Clone scs-feed data                  │
│ 5. Run data analysis script             │
│ 6. Build Next.js app                    │
│ 7. Deploy to GitHub Pages               │
│ 8. Verify deployment                    │
│ 9. Comment on PR (if applicable)        │
└─────────────────────────────────────────┘
```

**Triggers:**
| Event | When | Purpose |
|-------|------|---------|
| `push` | Main branch | Auto-deploy on code changes |
| `schedule` | Daily 2 AM UTC | Refresh data daily |
| `workflow_dispatch` | Manual click | Deploy on demand |
| `pull_request` | To main branch | Build preview |

**Time to deploy**: ~2-3 minutes
**Build size**: ~1.4 MB

### manual-deploy.yml

**What it does:**
```
┌─────────────────────────────────────────┐
│ 1. Checkout code                        │
│ 2. Setup Node.js 18                     │
│ 3. Install dependencies                 │
│ 4. Optionally rebuild data              │
│ 5. Build Next.js app                    │
│ 6. Deploy to GitHub Pages               │
└─────────────────────────────────────────┘
```

**Options:**
- `rebuild_data`: Skip data analysis (fast) or rebuild (slow)

**Time to deploy**: 
- Without data rebuild: ~1 minute
- With data rebuild: ~3-4 minutes

---

## File Generated During Deployment

### CSV Data Files
Located in: `out/data/`

```
✅ daily-reports.csv       (276 rows)
✅ source-statistics.csv   (17 rows)
✅ severity-breakdown.csv  (4 rows)
✅ articles.csv            (1,000 rows)
✅ summary.json            (metadata)
```

### Static HTML/JS
Located in: `out/`

```
✅ index.html              (Dashboard)
✅ _next/                  (React/Next.js bundles)
✅ data/                   (CSV files)
✅ .nojekyll               (Bypass Jekyll)
```

---

## Troubleshooting

### Deployment Status Not Showing in Pages Settings

**Solution:**
1. Go to **Settings** → **Pages**
2. Ensure **Source** is set to `gh-pages` branch
3. Ensure **Folder** is set to `/ (root)`
4. Wait 1-2 minutes and refresh

### Workflow Fails to Push to gh-pages

**Solution:**
1. Go to **Settings** → **Actions** → **General**
2. Change **Workflow permissions** to "Read and write permissions"
3. Re-run the workflow

### Build Fails with "npm ci" Error

**Solution:**
```bash
# Locally verify build works:
npm install
npm run analyze
npm run build
git push origin main
```

### Static Files Not Loading

**Solution:**
1. Check `next.config.js` includes `output: 'export'`
2. Verify `.nojekyll` file is in `out/` directory
3. Wait 5 minutes for GitHub Pages to refresh cache

---

## Customization

### Change Deployment Schedule

Edit `.github/workflows/deploy-github-pages.yml`:

```yaml
schedule:
  # Run at 2 AM UTC every day
  - cron: '0 2 * * *'
  
  # Alternative examples:
  # Every 6 hours:   - cron: '0 */6 * * *'
  # Weekly:          - cron: '0 0 * * 0'
  # Twice daily:     - cron: '0 0,12 * * *'
```

### Add Custom Domain

1. In repo settings, add your domain to **Pages** → **Custom domain**
2. Create file: `public/CNAME`
3. Add your domain (one per line):
   ```
   example.com
   ```

### Skip Data Rebuild (Faster Deployment)

If you don't need fresh data every push:

Edit `.github/workflows/deploy-github-pages.yml`:
```yaml
- name: Clone SCS feed data
  if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
  run: |
    git clone --depth 1 https://github.com/harekrishnarai/scs-feed.git scs_feed_data
```

---

## Monitoring Deployments

### View Workflow Runs
1. Go to **Actions** tab
2. Select **"Deploy to GitHub Pages"**
3. Click on a workflow run to see:
   - ✅ Build logs
   - ✅ Step-by-step progress
   - ✅ Deployment status
   - ✅ Any errors

### Check Deployment History
1. Go to **Deployments** tab
2. View all past deployments
3. See deployment timestamps
4. Check which commits triggered deploys

### View GitHub Pages Status
1. Go to **Settings** → **Pages**
2. See last deployment status
3. View published URL
4. Check custom domain status

---

## What Gets Deployed

### Dashboard Features (Dynamic)
- ✅ 7-Day Trend Chart
- ✅ Top Sources Bar Chart
- ✅ Severity Distribution Pie Chart
- ✅ Key Metrics Cards
- ✅ Export CSV buttons

### Data Files (Static)
- ✅ daily-reports.csv
- ✅ source-statistics.csv
- ✅ severity-breakdown.csv
- ✅ articles.csv
- ✅ summary.json

### Static Assets
- ✅ Next.js bundles
- ✅ CSS stylesheets
- ✅ JavaScript files
- ✅ Icons and images

---

## Performance Notes

### Build Time
- **Without data rebuild**: ~1 minute
- **With data rebuild**: ~3-4 minutes
- **Total (including GitHub latency)**: ~5 minutes

### Site Performance
- **First page load**: < 1 second (static HTML)
- **Dashboard interactive**: < 2 seconds
- **Chart rendering**: Instant (Recharts)
- **CSV export**: Immediate

### File Sizes
- **Index page**: ~5 KB gzipped
- **JavaScript bundles**: ~50 KB gzipped
- **Total site**: < 1.5 MB

---

## Environment Variables

GitHub Actions will automatically have access to:
- `GITHUB_TOKEN` - For push permissions
- `GITHUB_REPOSITORY` - Repository name
- `GITHUB_SHA` - Commit hash
- `GITHUB_REF` - Branch name

**No additional setup needed!**

---

## Security

✅ **No secrets stored**
✅ **No API keys required**
✅ **Public data only**
✅ **HTTPS by default**
✅ **Automatic HTTPS with GitHub Pages**

---

## Support & Debugging

### Check Workflow Logs
```bash
# View real-time logs during build
# Go to: Actions → Deploy to GitHub Pages → [Latest Run]
```

### Manual Testing
```bash
# Test build locally before pushing
npm install
npm run analyze
npm run build

# Check output
ls -la out/
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Pages not updating | Check if `gh-pages` branch exists and has commits |
| Build fails | Check Actions logs for specific error |
| Old content showing | Hard refresh (Ctrl+Shift+R) or clear cache |
| Missing CSV files | Verify `npm run analyze` completed in logs |

---

## Next Steps

1. **Enable GitHub Pages** (Settings → Pages)
2. **Verify workflows** (Actions → View runs)
3. **Push to main** or trigger manual deployment
4. **Visit dashboard** at your GitHub Pages URL
5. **Share the link!** 🎉

---

## Deployment URLs

**Personal Repository:**
```
https://USERNAME.github.io/scs-feed-visualizer/
```

**Organization Repository:**
```
https://ORGNAME.github.io/scs-feed-visualizer/
```

**With custom domain:**
```
https://your-domain.com/
```

---

## Reference

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Next.js Export Docs**: https://nextjs.org/docs/advanced-features/static-html-export
- **peaceiris/actions-gh-pages**: https://github.com/peaceiris/actions-gh-pages

---

**Ready to deploy? Push to main and watch the magic happen!** ✨
