'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Download,
  TrendingUp,
  Shield,
  AlertCircle,
  Calendar,
  Target,
  Newspaper,
  Table as TableIcon,
  Search,
  ArrowUpDown
} from 'lucide-react'

type Severity = 'critical' | 'high' | 'medium' | 'low'
type SortDirection = 'asc' | 'desc'

interface Article {
  id: string
  title: string
  source: string
  publishedAt: string
  severity: Severity
  url: string
}

interface TopSource {
  source: string
  mentions: number
}

interface SummaryData {
  metadata: {
    generatedAt: string
    totalDays: number
    totalReports: number
    totalArticles: number
    dateRange: { start: string; end: string }
  }
  statistics: {
    averageReportsPerDay: string
    maxReportsDay: number
    minReportsDay: number
    topSources: TopSource[]
    severityDistribution: Record<Severity, number>
  }
  dailyData: Array<{ date: string; totalReports: number }>
  trendsData: Array<{ date: string; actual: number; trend7day: number }>
  articles: Article[]
}

const severityConfig: Record<Severity, { color: string; badgeClass: string }> = {
  critical: {
    color: '#ef4444',
    badgeClass: 'bg-red-500/20 text-red-300 border border-red-500/40'
  },
  high: {
    color: '#f97316',
    badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
  },
  medium: {
    color: '#eab308',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
  },
  low: {
    color: '#22c55e',
    badgeClass: 'bg-green-500/20 text-green-300 border border-green-500/40'
  }
}

const severityOrder: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
}

function seededValue(index: number, min: number, max: number) {
  const seed = Math.abs(Math.sin(index * 12.9898 + 78.233) * 43758.5453) % 1
  return Math.round(min + seed * (max - min))
}

function generateDailyData(startDate: Date, days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate)
    date.setUTCDate(startDate.getUTCDate() + i)

    const dayOfWeek = date.getUTCDay()
    const weekendPenalty = dayOfWeek === 0 || dayOfWeek === 6 ? 10 : 0
    const seasonalSwing = Math.round(8 * Math.sin(i / 16))
    const totalReports = Math.max(4, seededValue(i, 18, 56) + seasonalSwing - weekendPenalty)

    return {
      date: date.toISOString().slice(0, 10),
      totalReports
    }
  })
}

function generateTrendData(dailyData: Array<{ date: string; totalReports: number }>) {
  return dailyData.slice(6).map((item, idx) => {
    const window = dailyData.slice(idx, idx + 7)
    const average = window.reduce((sum, day) => sum + day.totalReports, 0) / 7

    return {
      date: item.date,
      actual: item.totalReports,
      trend7day: Number(average.toFixed(1))
    }
  })
}

const demoDailyData = generateDailyData(new Date(Date.UTC(2025, 5, 1)), 282)

const demoArticles: Article[] = [
  {
    id: 'intel-001',
    title: 'Zero-day in Build Orchestrator Used by Fortune 500 Exposes CI Secrets',
    source: 'The Hacker News',
    publishedAt: '2026-03-08T22:15:00Z',
    severity: 'critical',
    url: 'https://intel-wire.example/news/build-orchestrator-zero-day'
  },
  {
    id: 'intel-002',
    title: 'CISA Flags Active Exploitation of Package Signing Infrastructure Weakness',
    source: 'CISA Alerts',
    publishedAt: '2026-03-08T18:40:00Z',
    severity: 'critical',
    url: 'https://intel-wire.example/news/cisa-package-signing-exploitation'
  },
  {
    id: 'intel-003',
    title: 'Threat Actors Weaponize npm Typosquat Libraries Targeting DevOps Teams',
    source: 'SecurityWeek',
    publishedAt: '2026-03-08T14:10:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/npm-typosquat-devops-campaign'
  },
  {
    id: 'intel-004',
    title: 'Ransomware Affiliate Breaches Artifact Registry via Stolen API Token',
    source: 'BleepingComputer',
    publishedAt: '2026-03-08T11:25:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/artifact-registry-api-token-breach'
  },
  {
    id: 'intel-005',
    title: 'Compromised GitHub Action Injects Backdoor into Release Pipelines',
    source: 'Dark Reading',
    publishedAt: '2026-03-07T20:00:00Z',
    severity: 'critical',
    url: 'https://intel-wire.example/news/compromised-github-action-backdoor'
  },
  {
    id: 'intel-006',
    title: 'Open-source Dependency Confusion Wave Hits Financial Sector Projects',
    source: 'Infosecurity Magazine',
    publishedAt: '2026-03-07T16:35:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/dependency-confusion-financial-sector'
  },
  {
    id: 'intel-007',
    title: 'APT Group Mimics Vendor Security Updates to Deliver Credential Stealer',
    source: 'Threat Intelligence',
    publishedAt: '2026-03-07T09:05:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/apt-fake-vendor-updates'
  },
  {
    id: 'intel-008',
    title: 'New SBOM Parsing Flaw Allows Malicious Components to Evade Detection',
    source: 'Schneier on Security',
    publishedAt: '2026-03-06T22:50:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/sbom-parser-evasion-flaw'
  },
  {
    id: 'intel-009',
    title: 'Cloud Build Agent Malware Campaign Linked to Initial Access Brokers',
    source: 'Cybersecurity News',
    publishedAt: '2026-03-06T15:15:00Z',
    severity: 'critical',
    url: 'https://intel-wire.example/news/cloud-build-agent-malware'
  },
  {
    id: 'intel-010',
    title: 'Nation-state Operators Target Certificate Authorities in Supply Chain Push',
    source: 'The Hacker News',
    publishedAt: '2026-03-06T09:20:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/ca-targeting-supply-chain'
  },
  {
    id: 'intel-011',
    title: 'Malicious PyPI Package Downloads Stage-2 Loader Through CDN Redirect',
    source: 'The Hacker News',
    publishedAt: '2026-03-05T19:45:00Z',
    severity: 'medium',
    url: 'https://intel-wire.example/news/malicious-pypi-cdn-loader'
  },
  {
    id: 'intel-012',
    title: 'Vendor Patch Tuesday Includes Fix for Build System Privilege Escalation',
    source: 'SecurityWeek',
    publishedAt: '2026-03-05T12:00:00Z',
    severity: 'medium',
    url: 'https://intel-wire.example/news/build-system-priv-esc-fix'
  },
  {
    id: 'intel-013',
    title: 'Researchers Expose Data Exfiltration Path in Legacy CI Connector',
    source: 'Dark Reading',
    publishedAt: '2026-03-04T17:30:00Z',
    severity: 'high',
    url: 'https://intel-wire.example/news/legacy-ci-connector-exfil'
  },
  {
    id: 'intel-014',
    title: 'OpenSSF Publishes Hardening Guidance for Release Provenance Checks',
    source: 'Supply Chain Security',
    publishedAt: '2026-03-04T10:55:00Z',
    severity: 'low',
    url: 'https://intel-wire.example/news/ossf-provenance-guidance'
  },
  {
    id: 'intel-015',
    title: 'Credential Stuffing Activity Detected Against Popular Git Hosting Service',
    source: 'BleepingComputer',
    publishedAt: '2026-03-03T22:10:00Z',
    severity: 'medium',
    url: 'https://intel-wire.example/news/credential-stuffing-git-hosting'
  }
]

// Fallback demo data when API is unavailable.
const DEMO_DATA: SummaryData = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalDays: 282,
    totalReports: 7341,
    totalArticles: 8421,
    dateRange: { start: '2025-06-01', end: '2026-03-09' }
  },
  statistics: {
    averageReportsPerDay: '26.0',
    maxReportsDay: 78,
    minReportsDay: 4,
    topSources: [
      { source: 'The Hacker News', mentions: 1748 },
      { source: 'CISA Alerts', mentions: 1216 },
      { source: 'Dark Reading', mentions: 947 },
      { source: 'BleepingComputer', mentions: 790 },
      { source: 'SecurityWeek', mentions: 701 },
      { source: 'Infosecurity Magazine', mentions: 664 },
      { source: 'Threat Intelligence', mentions: 516 },
      { source: 'Cybersecurity News', mentions: 488 },
      { source: 'Schneier on Security', mentions: 421 },
      { source: 'Supply Chain Security', mentions: 312 }
    ],
    severityDistribution: {
      critical: 689,
      high: 1562,
      medium: 2894,
      low: 3276
    }
  },
  dailyData: demoDailyData,
  trendsData: generateTrendData(demoDailyData),
  articles: demoArticles
}

const FETCH_TIMEOUT_MS = 4000

async function fetchWithTimeout(path: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    return await fetch(path, { signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timeout)
  }
}

function isSummaryData(value: unknown): value is Omit<SummaryData, 'articles'> & { articles?: Article[] } {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<SummaryData>
  return Boolean(
    candidate.metadata &&
      candidate.statistics &&
      Array.isArray(candidate.dailyData) &&
      Array.isArray(candidate.trendsData)
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function normalizeActivityLevel(mentions: number) {
  if (mentions >= 1200) return { label: 'Very High', className: 'text-red-300' }
  if (mentions >= 700) return { label: 'High', className: 'text-orange-300' }
  if (mentions >= 450) return { label: 'Moderate', className: 'text-yellow-300' }
  return { label: 'Low', className: 'text-green-300' }
}

export default function Dashboard() {
  const [data, setData] = useState<SummaryData>(DEMO_DATA)
  const [loading, setLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')

  const [newsSearch, setNewsSearch] = useState('')
  const [dailySearch, setDailySearch] = useState('')
  const [sourceSearch, setSourceSearch] = useState('')

  const [newsSort, setNewsSort] = useState<{ key: 'title' | 'source' | 'publishedAt' | 'severity'; direction: SortDirection }>({
    key: 'publishedAt',
    direction: 'desc'
  })
  const [dailySort, setDailySort] = useState<{ key: 'date' | 'totalReports' | 'trendValue'; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  })
  const [sourceSort, setSourceSort] = useState<{ key: 'source' | 'mentions' | 'activityScore'; direction: SortDirection }>({
    key: 'mentions',
    direction: 'desc'
  })
  const [severitySort, setSeveritySort] = useState<{ key: 'severity' | 'count' | 'percentage'; direction: SortDirection }>({
    key: 'count',
    direction: 'desc'
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        const paths = [
          './data/summary.json',
          '/scs-feed-visualizer/data/summary.json',
          '/data/summary.json'
        ]

        let loaded = false

        for (const path of paths) {
          try {
            const res = await fetchWithTimeout(path)
            if (!res.ok) {
              continue
            }

            const jsonData: unknown = await res.json()
            if (!isSummaryData(jsonData)) {
              continue
            }

            const candidate = jsonData as Omit<SummaryData, 'articles'> & { articles?: Article[] }
            setData({
              ...candidate,
              articles: Array.isArray(candidate.articles) && candidate.articles.length > 0 ? candidate.articles : DEMO_DATA.articles
            })
            setUsingFallback(false)
            loaded = true
            break
          } catch {
            // Continue trying alternate data paths.
          }
        }

        if (!loaded) {
          setData(DEMO_DATA)
          setUsingFallback(true)
        }
      } catch {
        setData(DEMO_DATA)
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const severityChartData = useMemo(() => {
    return Object.entries(data.statistics.severityDistribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      rawSeverity: name as Severity,
      value
    }))
  }, [data.statistics.severityDistribution])

  const totalSeverityCount = useMemo(() => {
    return Object.values(data.statistics.severityDistribution).reduce((sum, count) => sum + count, 0)
  }, [data.statistics.severityDistribution])

  const dailyRows = useMemo(() => {
    return data.dailyData.map((entry, index) => {
      const prev = index > 0 ? data.dailyData[index - 1].totalReports : entry.totalReports
      const trendValue = prev === 0 ? 0 : ((entry.totalReports - prev) / prev) * 100
      return {
        ...entry,
        trendValue
      }
    })
  }, [data.dailyData])

  const sourceRows = useMemo(() => {
    return data.statistics.topSources.map((source) => {
      const activity = normalizeActivityLevel(source.mentions)
      const activityScore = source.mentions
      return {
        ...source,
        activity,
        activityScore
      }
    })
  }, [data.statistics.topSources])

  const criticalNewsRows = useMemo(() => {
    return data.articles
      .filter((article) => article.severity === 'critical' || article.severity === 'high')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)
  }, [data.articles])

  const filteredSortedNews = useMemo(() => {
    const filtered = criticalNewsRows.filter((row) => {
      const q = newsSearch.toLowerCase().trim()
      if (!q) return true
      return (
        row.title.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q) ||
        row.severity.toLowerCase().includes(q)
      )
    })

    return filtered.sort((a, b) => {
      let result = 0
      if (newsSort.key === 'publishedAt') {
        result = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      } else if (newsSort.key === 'severity') {
        result = severityOrder[a.severity] - severityOrder[b.severity]
      } else if (newsSort.key === 'title') {
        result = a.title.localeCompare(b.title)
      } else {
        result = a.source.localeCompare(b.source)
      }
      return newsSort.direction === 'asc' ? result : -result
    })
  }, [criticalNewsRows, newsSearch, newsSort])

  const filteredSortedDaily = useMemo(() => {
    const filtered = dailyRows.filter((row) => {
      const q = dailySearch.toLowerCase().trim()
      if (!q) return true
      return row.date.includes(q)
    })

    return filtered.sort((a, b) => {
      let result = 0
      if (dailySort.key === 'date') {
        result = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (dailySort.key === 'totalReports') {
        result = a.totalReports - b.totalReports
      } else {
        result = a.trendValue - b.trendValue
      }
      return dailySort.direction === 'asc' ? result : -result
    })
  }, [dailyRows, dailySearch, dailySort])

  const filteredSortedSources = useMemo(() => {
    const filtered = sourceRows.filter((row) => {
      const q = sourceSearch.toLowerCase().trim()
      if (!q) return true
      return row.source.toLowerCase().includes(q) || row.activity.label.toLowerCase().includes(q)
    })

    return filtered.sort((a, b) => {
      let result = 0
      if (sourceSort.key === 'source') {
        result = a.source.localeCompare(b.source)
      } else if (sourceSort.key === 'mentions') {
        result = a.mentions - b.mentions
      } else {
        result = a.activityScore - b.activityScore
      }
      return sourceSort.direction === 'asc' ? result : -result
    })
  }, [sourceRows, sourceSearch, sourceSort])

  const severityRows = useMemo(() => {
    return Object.entries(data.statistics.severityDistribution).map(([severity, count]) => {
      const percentage = totalSeverityCount === 0 ? 0 : (count / totalSeverityCount) * 100
      return {
        severity: severity as Severity,
        count,
        percentage
      }
    })
  }, [data.statistics.severityDistribution, totalSeverityCount])

  const sortedSeverityRows = useMemo(() => {
    return [...severityRows].sort((a, b) => {
      let result = 0
      if (severitySort.key === 'severity') {
        result = severityOrder[a.severity] - severityOrder[b.severity]
      } else if (severitySort.key === 'count') {
        result = a.count - b.count
      } else {
        result = a.percentage - b.percentage
      }
      return severitySort.direction === 'asc' ? result : -result
    })
  }, [severityRows, severitySort])

  const toggleSort = <T extends string>(
    current: { key: T; direction: SortDirection },
    setSort: (next: { key: T; direction: SortDirection }) => void,
    key: T
  ) => {
    if (current.key === key) {
      setSort({ key, direction: current.direction === 'asc' ? 'desc' : 'asc' })
      return
    }
    setSort({ key, direction: 'desc' })
  }

  const chartDailyWindow = data.dailyData.slice(-45)

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Shield className="w-9 h-9 text-primary" />
              SCS Feed Visualizer
            </h1>
            <p className="text-gray-400">Supply Chain Security Intelligence Dashboard</p>
            {usingFallback && (
              <span className="inline-flex mt-3 items-center rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                Demo Data
              </span>
            )}
            {loading && <p className="mt-2 text-sm text-gray-400">Refreshing dashboard data...</p>}
          </div>
          <a
            href="/data/daily-reports.csv"
            download
            className="flex items-center gap-2 bg-primary hover:bg-secondary px-4 py-2 rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={<Calendar />} label="Days Tracked" value={data.metadata.totalDays} />
        <MetricCard icon={<TrendingUp />} label="Total Reports" value={data.metadata.totalReports} />
        <MetricCard icon={<Target />} label="Avg Reports/Day" value={data.statistics.averageReportsPerDay} />
        <MetricCard icon={<AlertCircle />} label="Total Articles" value={data.metadata.totalArticles} />
      </div>

      <div className="mb-6 border border-gray-700 rounded-lg bg-gray-800/70 p-1 flex w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            activeTab === 'details' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          Details
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
            <ChartCard title="7-Day Trend Analysis" icon={<TrendingUp className="w-5 h-5 text-primary" />}>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={data.trendsData.slice(-90)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#999" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#999" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="actual" stroke="#60a5fa" dot={false} name="Daily Reports" />
                  <Line type="monotone" dataKey="trend7day" stroke="#a78bfa" dot={false} name="7-Day Average" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Security Sources" icon={<Target className="w-5 h-5 text-primary" />}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.statistics.topSources.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="source" stroke="#999" style={{ fontSize: '10px' }} angle={-35} textAnchor="end" height={70} />
                  <YAxis stroke="#999" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }} />
                  <Bar dataKey="mentions" fill="#667eea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ChartCard title="Security Severity Levels" icon={<AlertCircle className="w-5 h-5 text-primary" />}>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={severityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={78}
                    dataKey="value"
                  >
                    {severityChartData.map((entry) => (
                      <Cell key={entry.rawSeverity} fill={severityConfig[entry.rawSeverity].color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Daily Reports (Last 45 Days)" icon={<TableIcon className="w-5 h-5 text-primary" />}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartDailyWindow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#999" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#999" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }} />
                  <Bar dataKey="totalReports" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {activeTab === 'details' && (
        <>
          <section className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-red-400" />
                Critical News & Alerts
              </h2>
              <SearchField placeholder="Search alerts by title/source/severity" value={newsSearch} onChange={setNewsSearch} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead className="text-gray-300 border-b border-gray-700">
                  <tr>
                    <SortableHeader
                      title="Article"
                      isActive={newsSort.key === 'title'}
                      direction={newsSort.direction}
                      onClick={() => toggleSort(newsSort, setNewsSort, 'title')}
                    />
                    <SortableHeader
                      title="Source"
                      isActive={newsSort.key === 'source'}
                      direction={newsSort.direction}
                      onClick={() => toggleSort(newsSort, setNewsSort, 'source')}
                    />
                    <SortableHeader
                      title="Date"
                      isActive={newsSort.key === 'publishedAt'}
                      direction={newsSort.direction}
                      onClick={() => toggleSort(newsSort, setNewsSort, 'publishedAt')}
                    />
                    <SortableHeader
                      title="Severity"
                      isActive={newsSort.key === 'severity'}
                      direction={newsSort.direction}
                      onClick={() => toggleSort(newsSort, setNewsSort, 'severity')}
                    />
                  </tr>
                </thead>
                <tbody>
                  {filteredSortedNews.map((article) => (
                    <tr key={article.id} className="border-b border-gray-700/70 hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 pr-4">
                        <a href={article.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200 underline">
                          {article.title}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-gray-200">{article.source}</td>
                      <td className="py-3 pr-4 text-gray-300">{formatDateTime(article.publishedAt)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${severityConfig[article.severity].badgeClass}`}>
                          {article.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <section className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold">Daily Reports Table</h2>
                <SearchField placeholder="Search by date (YYYY-MM-DD)" value={dailySearch} onChange={setDailySearch} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="text-gray-300 border-b border-gray-700">
                    <tr>
                      <SortableHeader
                        title="Date"
                        isActive={dailySort.key === 'date'}
                        direction={dailySort.direction}
                        onClick={() => toggleSort(dailySort, setDailySort, 'date')}
                      />
                      <SortableHeader
                        title="Total Reports"
                        isActive={dailySort.key === 'totalReports'}
                        direction={dailySort.direction}
                        onClick={() => toggleSort(dailySort, setDailySort, 'totalReports')}
                      />
                      <SortableHeader
                        title="Trend"
                        isActive={dailySort.key === 'trendValue'}
                        direction={dailySort.direction}
                        onClick={() => toggleSort(dailySort, setDailySort, 'trendValue')}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedDaily.slice(0, 90).map((row) => {
                      const trendClass = row.trendValue > 0 ? 'text-red-300' : row.trendValue < 0 ? 'text-green-300' : 'text-gray-300'
                      const sign = row.trendValue > 0 ? '+' : ''
                      return (
                        <tr key={row.date} className="border-b border-gray-700/70 hover:bg-gray-700/50 transition-colors">
                          <td className="py-2.5 pr-4 text-gray-200">{formatDate(row.date)}</td>
                          <td className="py-2.5 pr-4 font-semibold text-white">{row.totalReports}</td>
                          <td className={`py-2.5 pr-4 font-medium ${trendClass}`}>{sign}{row.trendValue.toFixed(1)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold">Security Sources Table</h2>
                <SearchField placeholder="Search source/activity" value={sourceSearch} onChange={setSourceSearch} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="text-gray-300 border-b border-gray-700">
                    <tr>
                      <SortableHeader
                        title="Source"
                        isActive={sourceSort.key === 'source'}
                        direction={sourceSort.direction}
                        onClick={() => toggleSort(sourceSort, setSourceSort, 'source')}
                      />
                      <SortableHeader
                        title="Mentions"
                        isActive={sourceSort.key === 'mentions'}
                        direction={sourceSort.direction}
                        onClick={() => toggleSort(sourceSort, setSourceSort, 'mentions')}
                      />
                      <SortableHeader
                        title="Activity Level"
                        isActive={sourceSort.key === 'activityScore'}
                        direction={sourceSort.direction}
                        onClick={() => toggleSort(sourceSort, setSourceSort, 'activityScore')}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedSources.map((row) => (
                      <tr key={row.source} className="border-b border-gray-700/70 hover:bg-gray-700/50 transition-colors">
                        <td className="py-2.5 pr-4 text-gray-200">{row.source}</td>
                        <td className="py-2.5 pr-4 font-semibold text-white">{row.mentions}</td>
                        <td className={`py-2.5 pr-4 font-medium ${row.activity.className}`}>{row.activity.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Severity Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead className="text-gray-300 border-b border-gray-700">
                  <tr>
                    <SortableHeader
                      title="Severity"
                      isActive={severitySort.key === 'severity'}
                      direction={severitySort.direction}
                      onClick={() => toggleSort(severitySort, setSeveritySort, 'severity')}
                    />
                    <SortableHeader
                      title="Count"
                      isActive={severitySort.key === 'count'}
                      direction={severitySort.direction}
                      onClick={() => toggleSort(severitySort, setSeveritySort, 'count')}
                    />
                    <SortableHeader
                      title="Percentage"
                      isActive={severitySort.key === 'percentage'}
                      direction={severitySort.direction}
                      onClick={() => toggleSort(severitySort, setSeveritySort, 'percentage')}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedSeverityRows.map((row) => (
                    <tr key={row.severity} className="border-b border-gray-700/70 hover:bg-gray-700/50 transition-colors">
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${severityConfig[row.severity].badgeClass}`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-semibold text-white">{row.count}</td>
                      <td className="py-2.5 pr-4 text-gray-200">{row.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Last updated: {new Date(data.metadata.generatedAt).toLocaleString()}</p>
        <p className="mt-2">
          Data source:{' '}
          <a href="https://github.com/harekrishnarai/scs-feed" target="_blank" rel="noreferrer" className="text-primary hover:text-secondary transition">
            harekrishnarai/scs-feed
          </a>
        </p>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-xl border border-gray-700 hover:border-primary transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

function SearchField({
  placeholder,
  value,
  onChange
}: {
  placeholder: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="relative w-full sm:w-72">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900/80 border border-gray-600 text-sm rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  )
}

function SortableHeader({
  title,
  isActive,
  direction,
  onClick
}: {
  title: string
  isActive: boolean
  direction: SortDirection
  onClick: () => void
}) {
  return (
    <th className="text-left py-3 pr-4 font-semibold">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-white transition">
        {title}
        <ArrowUpDown className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
        {isActive ? <span className="text-xs text-primary uppercase">{direction}</span> : null}
      </button>
    </th>
  )
}
