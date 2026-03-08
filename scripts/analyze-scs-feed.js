#!/usr/bin/env node

/**
 * SCS Feed Analyzer
 * Generates CSV and JSON data from supply chain security feed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = 'scs_feed_data';
const PUBLIC_DATA_DIR = 'public/data';

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DATA_DIR)) {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
}

// Clone data if not present
if (!fs.existsSync(DATA_DIR)) {
  console.log('📥 Cloning SCS feed data...');
  execSync('git clone --depth 1 https://github.com/harekrishnarai/scs-feed.git scs_feed_data');
}

const analysis = {
  dailyReports: [],
  sourceStats: {},
  severityBreakdown: {},
  trendsData: [],
  articles: []
};

// Read all date folders
const folders = fs.readdirSync(DATA_DIR)
  .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f))
  .sort();

console.log(`📊 Found ${folders.length} days of data\n`);

let totalReports = 0;
let totalArticles = 0;

// Process each day
folders.forEach((dateFolder, idx) => {
  const summaryPath = path.join(DATA_DIR, dateFolder, 'summary.json');
  const reportPath = path.join(DATA_DIR, dateFolder, 'supply-chain-report.md');

  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    
    analysis.dailyReports.push({
      date: summary.date,
      totalReports: summary.totalReports,
      sources: summary.sources || [],
      week: getWeekNumber(new Date(summary.date)),
      day: new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long' })
    });

    // Track sources
    (summary.sources || []).forEach(source => {
      if (!analysis.sourceStats[source]) {
        analysis.sourceStats[source] = { count: 0, dates: [] };
      }
      analysis.sourceStats[source].count += summary.totalReports;
      analysis.sourceStats[source].dates.push(summary.date);
    });

    totalReports += summary.totalReports;
  }

  if (fs.existsSync(reportPath)) {
    const content = fs.readFileSync(reportPath, 'utf8');
    const articles = extractArticles(content, dateFolder);
    analysis.articles.push(...articles);
    totalArticles += articles.length;
  }

  if ((idx + 1) % 30 === 0) {
    process.stdout.write(`\r📈 Processed ${idx + 1}/${folders.length} days...`);
  }
});

console.log(`\r✅ Processed all ${folders.length} days\n`);

// Generate trends (7-day moving average)
let sum = 0;
for (let i = 0; i < analysis.dailyReports.length; i++) {
  sum += analysis.dailyReports[i].totalReports;
  if (i < 6) continue;
  
  const windowStart = i - 6;
  const windowEnd = i;
  const avg = Math.round(sum / 7);
  
  analysis.trendsData.push({
    date: analysis.dailyReports[i].date,
    actual: analysis.dailyReports[i].totalReports,
    trend7day: avg
  });
  
  sum -= analysis.dailyReports[windowStart].totalReports;
}

// Severity inference (based on keywords)
const severityKeywords = {
  critical: ['vulnerability', 'exploit', 'zero-day', 'critical', 'breach', 'malware'],
  high: ['attack', 'threat', 'backdoor', 'trojan', 'injection'],
  medium: ['issue', 'advisory', 'patch', 'update', 'security'],
  low: ['news', 'discussion', 'research']
};

analysis.articles.forEach(article => {
  const text = (article.title + ' ' + article.content).toLowerCase();
  let severity = 'low';
  
  for (const [level, keywords] of Object.entries(severityKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      severity = level;
      break;
    }
  }
  
  analysis.severityBreakdown[severity] = (analysis.severityBreakdown[severity] || 0) + 1;
  article.severity = severity;
});

// Generate CSV files
generateCSV('daily-reports.csv', analysis.dailyReports, [
  'date', 'totalReports', 'day', 'week'
]);

generateCSV('source-statistics.csv', 
  Object.entries(analysis.sourceStats).map(([source, data]) => ({
    source,
    totalMentions: data.count,
    daysActive: data.dates.length
  })),
  ['source', 'totalMentions', 'daysActive']
);

generateCSV('severity-breakdown.csv',
  Object.entries(analysis.severityBreakdown).map(([severity, count]) => ({
    severity,
    count,
    percentage: ((count / totalArticles) * 100).toFixed(2)
  })),
  ['severity', 'count', 'percentage']
);

generateCSV('articles.csv', analysis.articles.slice(0, 1000), [
  'date', 'source', 'title', 'severity'
]);

// Write JSON summary
const summary = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalDays: folders.length,
    totalReports,
    totalArticles: analysis.articles.length,
    dateRange: {
      start: analysis.dailyReports[0]?.date,
      end: analysis.dailyReports[analysis.dailyReports.length - 1]?.date
    }
  },
  statistics: {
    averageReportsPerDay: (totalReports / folders.length).toFixed(1),
    maxReportsDay: Math.max(...analysis.dailyReports.map(d => d.totalReports)),
    minReportsDay: Math.min(...analysis.dailyReports.map(d => d.totalReports)),
    topSources: Object.entries(analysis.sourceStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([source, data]) => ({ source, mentions: data.count })),
    severityDistribution: analysis.severityBreakdown
  },
  dailyData: analysis.dailyReports,
  trendsData: analysis.trendsData
};

fs.writeFileSync(
  path.join(PUBLIC_DATA_DIR, 'summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`\n📊 Analysis Complete!\n`);
console.log(`📈 Statistics:`);
console.log(`   Total Days: ${folders.length}`);
console.log(`   Total Reports: ${totalReports}`);
console.log(`   Total Articles: ${totalArticles}`);
console.log(`   Avg Reports/Day: ${(totalReports / folders.length).toFixed(1)}`);
console.log(`   Unique Sources: ${Object.keys(analysis.sourceStats).length}\n`);
console.log(`✅ CSV files generated in ${PUBLIC_DATA_DIR}/`);

// Helper functions
function generateCSV(filename, data, headers) {
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, filename), csv);
  console.log(`✅ ${filename} (${data.length} rows)`);
}

function extractArticles(content, date) {
  const articles = [];
  const lines = content.split('\n');
  
  let currentSource = 'Unknown';
  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSource = line.replace('## ', '').trim();
    }
    
    if (line.match(/^### \d+\. /)) {
      const title = line.replace(/^### \d+\. /, '').trim();
      articles.push({
        date,
        source: currentSource,
        title,
        content: title.toLowerCase()
      });
    }
  }
  
  return articles;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
