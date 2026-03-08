# 🛡️ SCS Feed Visualizer

A professional interactive dashboard for visualizing Supply Chain Security (SCS) feed data collected from [harekrishnarai/scs-feed](https://github.com/harekrishnarai/scs-feed).

![Dashboard Preview](https://img.shields.io/badge/Status-Active-green?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square)
![Streamlit](https://img.shields.io/badge/Streamlit-1.28.1-red?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 📊 Features

### Core Visualizations
- **📈 Daily Reports Trend** - Interactive line chart tracking daily report counts
- **📰 Top News Sources** - Horizontal bar chart showing source frequency and impact
- **📊 Report Distribution** - Histogram showing reports distribution across days
- **📅 Calendar Heatmap** - Visual activity calendar with intensity indicators
- **🔎 Report Explorer** - Detailed view and search through individual reports

### Analytics & Insights
- **Key Metrics Dashboard** - Total reports, averages, unique sources, latest updates
- **Statistical Analysis** - Descriptive statistics, trends, and patterns
- **Date Range Filtering** - Focus on specific periods of interest
- **Source Analysis** - Understand which sources generate the most reports

### Technical Highlights
- 🎨 Modern, professional UI with gradient theme
- ⚡ Cached data loading for fast performance
- 🔄 Auto-updating (scheduled daily)
- 📱 Fully responsive design
- 🌐 GitHub Pages deployment
- 📊 Interactive Plotly charts with hover details

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/harekrishnarai/scs-feed-visualizer.git
   cd scs-feed-visualizer
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Clone data repository**
   ```bash
   git clone --depth 1 https://github.com/harekrishnarai/scs-feed.git scs_feed_data
   ```

5. **Run the app**
   ```bash
   streamlit run app.py
   ```

6. **Open in browser**
   - Navigate to `http://localhost:8501`

### Deployment on GitHub Pages

This repository includes GitHub Actions workflows for automatic deployment:

1. **Initial Setup**
   ```bash
   # Push code to GitHub
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

3. **Automatic Deployment**
   - The workflow runs automatically on push
   - Runs daily at 2 AM UTC to fetch fresh data
   - View deployment status in Actions tab

4. **Access Dashboard**
   - Visit: `https://harekrishnarai.github.io/scs-feed-visualizer/`

## 📋 Project Structure

```
scs-feed-visualizer/
├── app.py                          # Main Streamlit application
├── requirements.txt                # Python dependencies
├── .streamlit/
│   └── config.toml                # Streamlit configuration
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions workflow
├── README.md                       # This file
└── LICENSE
```

## 🎯 Data Source

This visualizer consumes data from:
- **Repository**: [harekrishnarai/scs-feed](https://github.com/harekrishnarai/scs-feed)
- **Data Format**: Daily JSON summaries + Markdown reports
- **Update Frequency**: Daily (automated via GitHub Actions)
- **Data Range**: June 2025 onwards

### Data Structure
```
scs-feed/
├── 2025-06-01/
│   ├── summary.json               # Metadata: date, report count, sources
│   └── supply-chain-report.md    # Detailed report
├── 2025-06-02/
│   ├── summary.json
│   └── supply-chain-report.md
└── ... (daily folders)
```

## 📊 Visualization Details

### Daily Reports Trend
- **Type**: Line chart with area fill
- **Data**: Daily total reports from all sources
- **Insights**: Identify busy periods and trends

### Top News Sources
- **Type**: Horizontal bar chart
- **Data**: Frequency of each source appearing
- **Purpose**: Understand which sources generate most content

### Report Distribution
- **Type**: Histogram
- **Data**: Distribution of daily report counts
- **Insights**: Statistical spread and patterns

### Calendar Heatmap
- **Type**: Calendar scatter plot
- **Data**: Reports per day with intensity coloring
- **Purpose**: Visual activity calendar

### Report Explorer
- **Type**: Markdown viewer with interactive selection
- **Data**: Full detailed reports from selected dates
- **Features**: Date picker, expandable content

## 🔧 Configuration

### Streamlit Settings (`config.toml`)
```toml
[theme]
primaryColor = "#667eea"           # Purple
backgroundColor = "#f5f7fa"        # Light background
secondaryBackgroundColor = "#ececf1"
textColor = "#262730"              # Dark text

[server]
baseURLPath = "scs-feed-visualizer"  # GitHub Pages path
headless = true
enableXsrfProtection = false
```

### GitHub Actions (`deploy.yml`)
- **Trigger**: Push to main, daily schedule (2 AM UTC), manual dispatch
- **Data**: Clones latest from scs-feed repository
- **Output**: Static HTML deployed to gh-pages branch
- **Caching**: Python pip cache for faster builds

## 📈 Performance

- **Load Time**: < 2 seconds for typical deployments
- **Data Caching**: Streamlit @st.cache_data for efficient updates
- **File Size**: ~15KB compressed
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

## 🛠️ Development

### Adding New Visualizations

1. **Add chart function in `app.py`**
   ```python
   def create_custom_chart(data):
       fig = px.line(data, x='date', y='metric', title='Title')
       return fig
   ```

2. **Add to app layout**
   ```python
   st.subheader("📊 Custom Chart")
   fig = create_custom_chart(df_filtered)
   st.plotly_chart(fig, use_container_width=True)
   ```

3. **Test locally**
   ```bash
   streamlit run app.py
   ```

### Modifying Data Source

Update the `load_data()` function to change where data is sourced from:

```python
@st.cache_data
def load_data():
    # Modify repository URL or path here
    repo_path = "scs_feed_data"
    # ... rest of function
```

## 🔄 Updating Data

The dashboard automatically updates:
- **On Deploy**: When code is pushed to main branch
- **Daily**: Scheduled at 2 AM UTC
- **Manual**: Trigger via GitHub Actions workflow dispatch

To manually trigger:
1. Go to GitHub Actions tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## 🐛 Troubleshooting

### Data Not Loading Locally
```bash
# Ensure data repository is cloned
git clone --depth 1 https://github.com/harekrishnarai/scs-feed.git scs_feed_data
```

### Port 8501 Already in Use
```bash
streamlit run app.py --server.port 8502
```

### GitHub Pages Not Updating
1. Check Actions tab for workflow status
2. Verify Pages settings in repository Settings
3. Check that gh-pages branch was created

### Missing Dependencies
```bash
pip install --upgrade -r requirements.txt
```

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| streamlit | 1.28.1 | Web framework |
| pandas | 2.1.4 | Data manipulation |
| plotly | 5.18.0 | Interactive charts |
| numpy | 1.24.3 | Numerical computing |
| requests | 2.31.0 | HTTP requests |

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Contribution Ideas
- [ ] Additional chart types (pie, bubble, network)
- [ ] Advanced filtering options
- [ ] Export functionality (PDF, CSV)
- [ ] Search/full-text search
- [ ] Dark mode theme
- [ ] Mobile optimization
- [ ] Alert notifications
- [ ] Caching improvements

## 🔗 Related Projects

- [harekrishnarai/scs-feed](https://github.com/harekrishnarai/scs-feed) - Data source
- [Streamlit Documentation](https://docs.streamlit.io/)
- [Plotly Documentation](https://plotly.com/python/)

## 📞 Support

For issues, questions, or suggestions:
1. Check existing GitHub Issues
2. Review project documentation
3. Create a new GitHub Issue with:
   - Clear description
   - Steps to reproduce (if applicable)
   - Expected vs actual behavior
   - Screenshots (if relevant)

## 🎯 Roadmap

### v1.0 (Current)
- ✅ Daily trends visualization
- ✅ Source analysis
- ✅ Calendar heatmap
- ✅ Report explorer
- ✅ GitHub Pages deployment

### v1.1 (Planned)
- Advanced filtering and search
- Export to PDF/CSV
- Threat severity scoring
- Trend prediction/forecasting
- Alert notifications

### v2.0 (Future)
- Real-time updates via WebSocket
- Integration with other security feeds
- Custom dashboard creation
- API endpoint for programmatic access
- Mobile app

## 📊 Dashboard Statistics

- **Lines of Code**: ~450
- **Data Points**: 280+ days of data
- **Sources**: 10+ security news sources
- **Update Frequency**: Daily
- **Deployment**: GitHub Pages (free)

---

**Created with ❤️ for supply chain security**

Last Updated: March 8, 2024
