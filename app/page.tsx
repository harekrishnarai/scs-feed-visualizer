'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, TrendingUp, Shield, AlertCircle, Calendar, Target } from 'lucide-react'

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
    topSources: Array<{ source: string; mentions: number }>
    severityDistribution: Record<string, number>
  }
  dailyData: Array<{ date: string; totalReports: number }>
  trendsData: Array<{ date: string; actual: number; trend7day: number }>
}

// Fallback demo data when API is unavailable
const DEMO_DATA: SummaryData = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalDays: 276,
    totalReports: 5262,
    totalArticles: 5262,
    dateRange: { start: '2025-06-01', end: '2026-03-08' }
  },
  statistics: {
    averageReportsPerDay: '19.1',
    maxReportsDay: 309,
    minReportsDay: 0,
    topSources: [
      { source: 'The Hacker News', mentions: 5193 },
      { source: 'Schneier on Security', mentions: 234 },
      { source: 'CISA Alerts', mentions: 187 },
      { source: 'Dark Reading', mentions: 156 },
      { source: 'Infosecurity Magazine', mentions: 142 },
      { source: 'BleepingComputer', mentions: 128 },
      { source: 'SecurityWeek', mentions: 115 },
      { source: 'Threat Intelligence', mentions: 98 },
      { source: 'Supply Chain Security', mentions: 87 },
      { source: 'Cybersecurity News', mentions: 76 }
    ],
    severityDistribution: {
      critical: 312,
      high: 854,
      medium: 1847,
      low: 2249
    }
  },
  dailyData: Array.from({ length: 276 }, (_, i) => ({
    date: new Date(2025, 5, 1 + i).toISOString().split('T')[0],
    totalReports: Math.floor(Math.random() * 40) + 5
  })),
  trendsData: Array.from({ length: 270 }, (_, i) => ({
    date: new Date(2025, 5, 7 + i).toISOString().split('T')[0],
    actual: Math.floor(Math.random() * 40) + 5,
    trend7day: 19
  }))
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

function isSummaryData(value: unknown): value is SummaryData {
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

export default function Dashboard() {
  // Start with demo data so charts always render even if network fetch fails or hangs.
  const [data, setData] = useState<SummaryData>(DEMO_DATA)
  const [loading, setLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        // Try multiple paths to handle different deployments
        const paths = [
          './data/summary.json',
          '/scs-feed-visualizer/data/summary.json',
          '/data/summary.json'
        ]

        let loaded = false

        for (const path of paths) {
          try {
            const res = await fetchWithTimeout(path)
            if (res.ok) {
              const jsonData: unknown = await res.json()

              if (isSummaryData(jsonData)) {
                setData(jsonData)
                setUsingFallback(false)
                console.log('✅ Data loaded from:', path)
                loaded = true
                break
              }

              console.warn('⚠️ Invalid summary JSON shape at path:', path)
            } else {
              console.log('⚠️ Data path returned non-OK status:', path, res.status)
            }
          } catch (e) {
            console.log('⚠️ Failed to load from:', path, e)
          }
        }

        if (!loaded) {
          setData(DEMO_DATA)
          setUsingFallback(true)
          console.log('🧪 Using fallback demo data (all data paths failed or timed out)')
        }
      } catch (err) {
        console.error('Data loading error:', err)
        setData(DEMO_DATA)
        setUsingFallback(true)
        console.log('🧪 Using fallback demo data after load error')
      } finally {
        setLoading(false)
        console.log('ℹ️ loadData complete: setLoading(false) called')
      }
    }

    void loadData()
  }, [])

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Shield className="w-12 h-12 text-primary mx-auto" />
          </div>
          <p className="text-xl text-gray-300">Loading supply chain security data...</p>
        </div>
      </div>
    )
  }

  const severityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Shield className="w-10 h-10 text-primary" />
              SCS Feed Visualizer
            </h1>
            <p className="text-gray-400">Supply Chain Security Intelligence Dashboard</p>
            {usingFallback && (
              <span className="inline-flex mt-3 items-center rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                Demo Data
              </span>
            )}
          </div>
          <a href="/data/daily-reports.csv" download className="flex items-center gap-2 bg-primary hover:bg-secondary px-4 py-2 rounded-lg transition">
            <Download className="w-5 h-5" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<Calendar />}
          label="Days Tracked"
          value={data.metadata.totalDays}
        />
        <MetricCard
          icon={<TrendingUp />}
          label="Total Reports"
          value={data.metadata.totalReports}
        />
        <MetricCard
          icon={<Target />}
          label="Avg Reports/Day"
          value={data.statistics.averageReportsPerDay}
        />
        <MetricCard
          icon={<AlertCircle />}
          label="Total Articles"
          value={data.metadata.totalArticles}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            7-Day Trend Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="actual" stroke="#667eea" dot={false} name="Daily Reports" />
              <Line type="monotone" dataKey="trend7day" stroke="#764ba2" dot={false} name="7-Day Average" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Sources */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Top Security Sources
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.statistics.topSources}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="source" stroke="#999" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="mentions" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Security Severity Levels
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(data.statistics.severityDistribution).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#667eea"
                dataKey="value"
              >
                {Object.entries(data.statistics.severityDistribution).map(([key]) => (
                  <Cell key={key} fill={severityColors[key as keyof typeof severityColors] || '#667eea'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: '1px solid #667eea', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics Summary */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-6">Key Statistics</h2>
          <div className="space-y-4">
            <StatRow label="Date Range" value={`${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}`} />
            <StatRow label="Max Reports (Single Day)" value={data.statistics.maxReportsDay.toString()} />
            <StatRow label="Min Reports (Single Day)" value={data.statistics.minReportsDay.toString()} />
            <StatRow label="Unique Sources" value={data.statistics.topSources.length.toString()} />
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Top 3 Sources:</p>
              {data.statistics.topSources.slice(0, 3).map((source, idx) => (
                <p key={idx} className="text-sm text-gray-300">
                  {idx + 1}. {source.source} - {source.mentions} mentions
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Last updated: {new Date(data.metadata.generatedAt).toLocaleString()}</p>
        <p className="mt-2">Data source: <a href="https://github.com/harekrishnarai/scs-feed" target="_blank" className="text-primary hover:text-secondary transition">harekrishnarai/scs-feed</a></p>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700 hover:border-primary transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}
