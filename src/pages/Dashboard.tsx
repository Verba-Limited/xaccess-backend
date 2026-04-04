import { useEffect, useState } from 'react'
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, Box, Users } from 'lucide-react'
import { fetchPlatformSummary } from '@/api/admin'
import type { PlatformSummary } from '@/api/types'

const subTrend = [
  { m: 'JAN', active: 2100, inactive: 800 },
  { m: 'FEB', active: 2400, inactive: 900 },
  { m: 'MAR', active: 2200, inactive: 1100 },
  { m: 'APR', active: 2600, inactive: 950 },
  { m: 'MAY', active: 2800, inactive: 1000 },
  { m: 'JUN', active: 3000, inactive: 1200 },
  { m: 'JUL', active: 2900, inactive: 1300 },
  { m: 'AUG', active: 3100, inactive: 1250 },
  { m: 'SEP', active: 3300, inactive: 1400 },
  { m: 'OCT', active: 3400, inactive: 1350 },
  { m: 'NOV', active: 3600, inactive: 1500 },
  { m: 'DEC', active: 3800, inactive: 1450 },
]

const facilityPerf = [
  { m: 'JAN', f1: 62, f2: 48, f3: 55 },
  { m: 'FEB', f1: 58, f2: 52, f3: 60 },
  { m: 'MAR', f1: 70, f2: 55, f3: 58 },
  { m: 'APR', f1: 65, f2: 60, f3: 62 },
  { m: 'MAY', f1: 72, f2: 58, f3: 64 },
  { m: 'JUN', f1: 68, f2: 65, f3: 70 },
  { m: 'JUL', f1: 75, f2: 62, f3: 68 },
  { m: 'AUG', f1: 78, f2: 70, f3: 72 },
  { m: 'SEP', f1: 80, f2: 68, f3: 75 },
  { m: 'OCT', f1: 82, f2: 72, f3: 78 },
  { m: 'NOV', f1: 85, f2: 75, f3: 80 },
  { m: 'DEC', f1: 88, f2: 78, f3: 82 },
]

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  icon: typeof Users
  tone: 'violet' | 'amber' | 'emerald'
}) {
  const ring =
    tone === 'violet'
      ? 'bg-violet-100 text-violet-600'
      : tone === 'amber'
        ? 'bg-amber-100 text-amber-600'
        : 'bg-emerald-100 text-emerald-600'
  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${ring}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [summary, setSummary] = useState<PlatformSummary | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetchPlatformSummary()
      .then(setSummary)
      .catch((e: Error) => setErr(e.message))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview and trends</p>
      </div>

      {err && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load live stats: {err}. Showing placeholders where needed.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Admins"
          value={summary?.communityAdminCount ?? '—'}
          icon={Users}
          tone="violet"
        />
        <StatCard
          title="Total Facilities"
          value={summary?.communityCount ?? '—'}
          icon={Box}
          tone="amber"
        />
        <StatCard
          title="Platform users"
          value={summary?.userCount ?? '—'}
          icon={Activity}
          tone="emerald"
        />
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <p className="text-sm text-gray-500">Current System Health</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>All systems good</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Attention needed</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span>Critical issues</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-1">
        <div className="rounded-xl border border-surface-border bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900">
            Subscription Trend Over Time
          </h2>
          <p className="text-xs text-gray-400">Demo chart — illustrative data</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active"
                  name="Active Subscription"
                  stroke="#6D28D9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="inactive"
                  name="Inactive Subscription"
                  stroke="#C4B5FD"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Facilities Performance Over Time
          </h2>
          <p className="text-xs text-gray-400">Demo chart — illustrative data</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={facilityPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => (v != null ? `${v}%` : '')} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="f1"
                  name="Facility 1"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="f2"
                  name="Facility 2"
                  stroke="#EC4899"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="f3"
                  name="Facility 3"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
