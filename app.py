import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import json
import os
import re
from pathlib import Path
from collections import Counter, defaultdict
import numpy as np

# Page configuration
st.set_page_config(
    page_title="SCS Feed Visualizer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        padding: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 0.5rem;
        color: white;
        margin-bottom: 1rem;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .metric-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
</style>
""", unsafe_allow_html=True)

# Cache data loading
@st.cache_data
def load_data():
    """Load all SCS feed data from the cloned repository"""
    data = []
    repo_path = "scs_feed_data"  # Will be mounted by GitHub Actions
    
    if not os.path.exists(repo_path):
        st.warning("Data not found. Attempting to clone from GitHub...")
        os.system("git clone https://github.com/harekrishnarai/scs-feed.git scs_feed_data")
    
    # Walk through all date folders
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file == "summary.json":
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r') as f:
                        summary = json.load(f)
                        data.append(summary)
                except Exception as e:
                    st.error(f"Error loading {file_path}: {e}")
    
    return sorted(data, key=lambda x: x.get('date', ''))

@st.cache_data
def load_detailed_reports():
    """Load detailed report data"""
    reports = []
    repo_path = "scs_feed_data"
    
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file == "supply-chain-report.md":
                file_path = os.path.join(root, file)
                date = os.path.basename(root)
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        reports.append({
                            'date': date,
                            'content': content,
                            'path': file_path
                        })
                except Exception as e:
                    st.warning(f"Could not read {file_path}")
    
    return sorted(reports, key=lambda x: x.get('date', ''))

def extract_articles_from_report(content):
    """Extract article information from markdown report"""
    articles = []
    
    # Split by headers to identify sections (sources)
    sections = re.split(r'^## ', content, flags=re.MULTILINE)
    
    for section in sections[1:]:  # Skip the first split
        lines = section.split('\n')
        source = lines[0].strip() if lines else "Unknown"
        
        # Find all article patterns
        article_pattern = r'^### \d+\. (.+)$'
        link_pattern = r'^\*\*Link:\*\* (.+)$'
        
        for i, line in enumerate(lines):
            match = re.match(article_pattern, line)
            if match:
                title = match.group(1)
                # Look for link in next lines
                link = ""
                for j in range(i + 1, min(i + 5, len(lines))):
                    link_match = re.match(link_pattern, lines[j])
                    if link_match:
                        link = link_match.group(1)
                        break
                
                articles.append({
                    'title': title,
                    'source': source,
                    'link': link
                })
    
    return articles

def create_heatmap_data(data):
    """Create data for calendar heatmap"""
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Group by week and day
    df['week'] = df['date'].dt.isocalendar().week
    df['day_of_week'] = df['date'].dt.day_name()
    df['year'] = df['date'].dt.year
    
    return df

# Load data
try:
    data = load_data()
    if not data:
        st.error("No data found. Please ensure the repository is properly cloned.")
        st.stop()
    
    detailed_reports = load_detailed_reports()
except Exception as e:
    st.error(f"Error loading data: {e}")
    st.stop()

# Convert to DataFrame
df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['date'])
df = df.sort_values('date')

# ============= HEADER =============
col1, col2 = st.columns([3, 1])
with col1:
    st.title("🛡️ Supply Chain Security Feed")
    st.markdown("Real-time visualization of supply chain security intelligence")
with col2:
    st.metric("Days Tracked", len(df))

# ============= KEY METRICS =============
st.markdown("---")
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_reports = df['totalReports'].sum()
    st.metric("📈 Total Reports", f"{total_reports:,}")

with col2:
    avg_reports = df['totalReports'].mean()
    st.metric("📊 Avg Reports/Day", f"{avg_reports:.1f}")

with col3:
    all_sources = []
    for sources in df['sources']:
        if isinstance(sources, list):
            all_sources.extend(sources)
    unique_sources = len(set(all_sources))
    st.metric("🔍 Unique Sources", unique_sources)

with col4:
    latest_date = df['date'].max().strftime("%Y-%m-%d")
    st.metric("📅 Latest Report", latest_date)

# ============= SIDEBAR FILTERS =============
st.sidebar.title("🎯 Filters & Options")

date_range = st.sidebar.date_input(
    "Select Date Range",
    value=(df['date'].min().date(), df['date'].max().date()),
    min_value=df['date'].min().date(),
    max_value=df['date'].max().date()
)

# Filter data by date range
if len(date_range) == 2:
    df_filtered = df[(df['date'] >= pd.Timestamp(date_range[0])) & 
                      (df['date'] <= pd.Timestamp(date_range[1]))]
else:
    df_filtered = df

# ============= MAIN VISUALIZATIONS =============
st.markdown("---")
st.subheader("📊 Daily Reports Trend")

# Create line chart
fig_trend = go.Figure()
fig_trend.add_trace(go.Scatter(
    x=df_filtered['date'],
    y=df_filtered['totalReports'],
    mode='lines+markers',
    name='Reports',
    line=dict(color='#667eea', width=3),
    marker=dict(size=6),
    fill='tozeroy',
    fillcolor='rgba(102, 126, 234, 0.2)'
))

fig_trend.update_layout(
    title="Daily Supply Chain Security Reports Count",
    xaxis_title="Date",
    yaxis_title="Number of Reports",
    hovermode='x unified',
    height=400,
    template='plotly_white',
    font=dict(size=11)
)
st.plotly_chart(fig_trend, use_container_width=True)

# ============= TWO COLUMN LAYOUT =============
col1, col2 = st.columns(2)

with col1:
    st.subheader("📰 Top News Sources")
    
    # Count source appearances
    source_counts = defaultdict(int)
    for sources_list in df_filtered['sources']:
        if isinstance(sources_list, list):
            for source in sources_list:
                source_counts[source] += 1
    
    if source_counts:
        sources_df = pd.DataFrame(
            list(source_counts.items()),
            columns=['Source', 'Mentions']
        ).sort_values('Mentions', ascending=True)
        
        fig_sources = px.barh(
            sources_df,
            x='Mentions',
            y='Source',
            color='Mentions',
            color_continuous_scale='Viridis',
            title="Source Frequency"
        )
        fig_sources.update_layout(height=400, showlegend=False)
        st.plotly_chart(fig_sources, use_container_width=True)
    else:
        st.info("No source data available for selected date range")

with col2:
    st.subheader("📈 Report Distribution")
    
    # Statistics
    stats = {
        'Min Reports': df_filtered['totalReports'].min(),
        'Max Reports': df_filtered['totalReports'].max(),
        'Median': df_filtered['totalReports'].median(),
        'Std Dev': df_filtered['totalReports'].std()
    }
    
    for label, value in stats.items():
        st.metric(label, f"{value:.1f}")
    
    # Distribution chart
    fig_dist = px.histogram(
        df_filtered,
        x='totalReports',
        nbins=20,
        color_discrete_sequence=['#667eea'],
        title="Reports Distribution"
    )
    fig_dist.update_layout(height=350, showlegend=False)
    st.plotly_chart(fig_dist, use_container_width=True)

# ============= CALENDAR HEATMAP =============
st.markdown("---")
st.subheader("📅 Activity Calendar Heatmap")

heatmap_data = create_heatmap_data(df_filtered.to_dict('records'))

# Create calendar heatmap
fig_calendar = go.Figure()

for year in heatmap_data['year'].unique():
    year_data = heatmap_data[heatmap_data['year'] == year]
    
    fig_calendar.add_trace(go.Scatter(
        x=year_data['date'],
        y=year_data['day_of_week'],
        mode='markers',
        marker=dict(
            size=year_data['totalReports'] / 2,
            color=year_data['totalReports'],
            colorscale='Viridis',
            showscale=True,
            colorbar=dict(title="Reports")
        ),
        text=year_data.apply(
            lambda r: f"Date: {r['date'].strftime('%Y-%m-%d')}<br>Reports: {r['totalReports']}", axis=1
        ),
        hoverinfo='text',
        name=f"Year {year}"
    ))

fig_calendar.update_layout(
    title="Report Activity Calendar",
    xaxis_title="Date",
    yaxis_title="Day of Week",
    height=300,
    template='plotly_white',
    hovermode='closest'
)
st.plotly_chart(fig_calendar, use_container_width=True)

# ============= DETAILED REPORTS EXPLORER =============
st.markdown("---")
st.subheader("🔎 Report Details Explorer")

# Get available dates for selection
available_dates = sorted([r['date'] for r in detailed_reports])

if available_dates:
    selected_date = st.selectbox(
        "Select a date to view detailed report:",
        options=available_dates,
        format_func=lambda x: f"{x} ({pd.to_datetime(x).strftime('%A, %B %d, %Y')})"
    )
    
    # Find and display the report
    for report in detailed_reports:
        if report['date'] == selected_date:
            st.write(f"**Report Date:** {selected_date}")
            
            # Extract summary info
            summary = next((s for s in data if s.get('date') == selected_date), None)
            if summary:
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Reports", summary.get('totalReports', 0))
                with col2:
                    st.metric("Active Sources", len(summary.get('sources', [])))
                with col3:
                    st.metric("Report Path", "Available")
            
            # Display report content
            with st.expander("📄 Full Report", expanded=True):
                st.markdown(report['content'])
            
            break
else:
    st.info("No detailed reports available")

# ============= STATISTICS SECTION =============
st.markdown("---")
st.subheader("📊 Statistical Analysis")

col1, col2 = st.columns(2)

with col1:
    st.write("**Daily Reports Statistics**")
    st.dataframe(df_filtered[['date', 'totalReports']].describe().round(2))

with col2:
    st.write("**Data Summary**")
    summary_stats = {
        'Total Days Tracked': len(df_filtered),
        'Date Range': f"{df_filtered['date'].min().strftime('%Y-%m-%d')} to {df_filtered['date'].max().strftime('%Y-%m-%d')}",
        'Total Reports': int(df_filtered['totalReports'].sum()),
        'Average per Day': f"{df_filtered['totalReports'].mean():.2f}",
        'Busiest Day': f"{df_filtered.loc[df_filtered['totalReports'].idxmax(), 'date'].strftime('%Y-%m-%d')} ({df_filtered['totalReports'].max()} reports)"
    }
    for key, value in summary_stats.items():
        st.write(f"**{key}:** {value}")

# ============= FOOTER =============
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666; font-size: 0.9rem;'>
    <p>Supply Chain Security Feed Visualizer | Data from <a href='https://github.com/harekrishnarai/scs-feed' target='_blank'>harekrishnarai/scs-feed</a></p>
    <p>Last updated: {}</p>
</div>
""".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")), unsafe_allow_html=True)
