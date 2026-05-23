import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, RefreshCw, Settings2, Zap } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  fetchCommunityUtilityConfig,
  fetchCommunityUtilityResidents,
  fetchCommunityUtilitySummary,
  patchCommunityUtilityConfig,
  postResidentUtilityConsumption,
  type CommunityUtilityConfigRow,
  type CommunityUtilitySummary,
  type ResidentUtilityRow,
} from '@/api/facility'

const POWER_COLOR = '#3B82F6'
const WATER_COLOR = '#8B5CF6'

const PERIODS: { value: CommunityUtilityConfigRow['measurementPeriod']; label: string }[] = [
  { value: 'DAY', label: 'Per day' },
  { value: 'WEEK', label: 'Per week' },
  { value: 'MONTH', label: 'Per month' },
  { value: 'YEAR', label: 'Per year' },
]

function formatMinor(n: number, currency: string) {
  const major = n / 100
  return `${currency} ${major.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function FacilityUtilities() {
  const [tab, setTab] = useState<'overview' | 'config'>('overview')
  const [summary, setSummary] = useState<CommunityUtilitySummary | null>(null)
  const [residents, setResidents] = useState<ResidentUtilityRow[]>([])
  const [config, setConfig] = useState<CommunityUtilityConfigRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [consumeFor, setConsumeFor] = useState<ResidentUtilityRow | null>(null)
  const [cPower, setCPower] = useState('')
  const [cWater, setCWater] = useState('')
  const [consumeBusy, setConsumeBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    Promise.all([
      fetchCommunityUtilitySummary(),
      fetchCommunityUtilityResidents(),
      fetchCommunityUtilityConfig(),
    ])
      .then(([s, r, c]) => {
        setSummary(s)
        setResidents(r)
        setConfig(c)
      })
      .catch((e: Error) => setErr(e.message ?? 'Failed to load utilities'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const chartData =
    summary?.chartPoints.map((p) => ({
      name: p.label,
      Power: p.electricityKwh,
      Water: p.waterM3,
    })) ?? []

  const saveConfig = () => {
    if (!config) return
    setSavingConfig(true)
    setSaveSuccess(false)
    setErr(null)
    patchCommunityUtilityConfig({
      measurementPeriod: config.measurementPeriod,
      serviceChargeMinor: Math.round(Number(config.serviceChargeMinor)),
      includedPowerKwh: Number(config.includedPowerKwh),
      includedWaterM3: Number(config.includedWaterM3),
      currency: config.currency.trim() || 'NGN',
      isActive: config.isActive,
    })
      .then((row) => {
        setConfig(row)
        setErr(null)
        setSaveSuccess(true)
        window.setTimeout(() => setSaveSuccess(false), 5000)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        setErr(msg || 'Save failed')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .finally(() => setSavingConfig(false))
  }

  const submitConsumption = () => {
    if (!consumeFor) return
    const p = parseFloat(cPower) || 0
    const w = parseFloat(cWater) || 0
    if (p <= 0 && w <= 0) {
      setErr('Enter power (kWh) and/or water (m³) to record.')
      return
    }
    setConsumeBusy(true)
    setErr(null)
    postResidentUtilityConsumption(consumeFor.residentId, {
      powerKwh: p || undefined,
      waterM3: w || undefined,
    })
      .then(() => {
        setConsumeFor(null)
        setCPower('')
        setCWater('')
        void load()
      })
      .catch((e: Error) => setErr(e.message ?? 'Could not record consumption'))
      .finally(() => setConsumeBusy(false))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Utility Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure prepaid power & water for this estate, then track usage and resident
            quotas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          type="button"
          onClick={() => setTab('overview')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === 'overview'
              ? 'border border-b-white border-gray-200 bg-white text-gray-900'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setTab('config')}
          className={`inline-flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === 'config'
              ? 'border border-b-white border-gray-200 bg-white text-gray-900'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Settings2 className="h-4 w-4" strokeWidth={2} />
          Facility configuration
        </button>
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {loading && !summary ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : tab === 'config' && config ? (
        <div className="max-w-xl space-y-4 rounded-xl border border-[#E8E8ED] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Prepaid utility rules</h2>
          <p className="text-xs text-gray-500">
            Residents pay the service charge each period to unlock the included kWh and m³.
            When their allocation is exhausted, remote power/water controls are blocked until the
            next period payment.
          </p>
          <label className="block text-xs font-medium text-gray-600">
            Measurement period
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={config.measurementPeriod}
              onChange={(e) =>
                setConfig({
                  ...config,
                  measurementPeriod: e.target.value as CommunityUtilityConfigRow['measurementPeriod'],
                })
              }
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Service charge (minor units, e.g. kobo)
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={config.serviceChargeMinor}
              onChange={(e) =>
                setConfig({ ...config, serviceChargeMinor: Number(e.target.value) })
              }
            />
            <span className="mt-0.5 block text-xs text-gray-400">
              Preview: {formatMinor(config.serviceChargeMinor, config.currency)}
            </span>
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Included power per period (kWh)
            <input
              type="number"
              min={0}
              step="0.1"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={config.includedPowerKwh}
              onChange={(e) =>
                setConfig({ ...config, includedPowerKwh: Number(e.target.value) })
              }
            />
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Included water per period (m³)
            <input
              type="number"
              min={0}
              step="0.01"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={config.includedWaterM3}
              onChange={(e) =>
                setConfig({ ...config, includedWaterM3: Number(e.target.value) })
              }
            />
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Currency
            <input
              type="text"
              maxLength={8}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase"
              value={config.currency}
              onChange={(e) =>
                setConfig({ ...config, currency: e.target.value.toUpperCase() })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
            />
            Utility program active
          </label>
          {saveSuccess && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
              role="status"
            >
              Configuration saved. Residents will use these rules for new billing periods.
            </div>
          )}
          <button
            type="button"
            disabled={savingConfig}
            onClick={() => void saveConfig()}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {savingConfig ? 'Saving…' : 'Save configuration'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="h-4 w-4 text-amber-500" strokeWidth={2} />
                Total power (window)
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
                {summary?.totals.electricityKwh.toLocaleString('en-US', {
                  maximumFractionDigits: 1,
                }) ?? '—'}{' '}
                <span className="text-lg font-semibold text-gray-500">kWh</span>
              </p>
            </div>
            <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Droplets className="h-4 w-4 text-sky-500" strokeWidth={2} />
                Total water (window)
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
                {summary?.totals.waterM3.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                }) ?? '—'}{' '}
                <span className="text-lg font-semibold text-gray-500">m³</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                ≈{' '}
                {summary
                  ? Math.round(summary.totals.waterM3 * 1000).toLocaleString('en-US')
                  : '—'}{' '}
                liters combined
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-gray-900">Community usage trend</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Last {summary?.monthsInView ?? 0} month(s) — sum of all resident readings per month
            </p>
            <div className="mt-4 h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-gray-500" />
                    <YAxis tick={{ fontSize: 11 }} className="text-gray-500" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 12,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Power" fill={POWER_COLOR} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Water" fill={WATER_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No utility readings recorded for this community yet.
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Residents & prepaid quota</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Latest meter month and current period subscription (after residents pay in the
                mobile app).
              </p>
            </div>
            {residents.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">No active residents.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Resident
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Meter month
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Period
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                        Paid
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        Rem. kWh
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        Rem. m³
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {residents.map((r) => (
                      <tr key={r.residentId} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{r.unitLabel ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{r.lastReadingMonth ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {r.utilityPeriodKey ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.utilityPaidForPeriod
                                ? 'bg-green-50 text-green-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {r.utilityPaidForPeriod ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-800">
                          {r.utilityRemainingPowerKwh != null
                            ? r.utilityRemainingPowerKwh.toFixed(1)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-800">
                          {r.utilityRemainingWaterM3 != null
                            ? r.utilityRemainingWaterM3.toFixed(2)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={!r.utilityPaidForPeriod}
                              onClick={() => {
                                setConsumeFor(r)
                                setCPower('')
                                setCWater('')
                              }}
                              className="text-xs font-medium text-brand hover:underline disabled:text-gray-300 disabled:no-underline"
                            >
                              Record use
                            </button>
                            <Link
                              to={`/facility/residents/${r.residentId}`}
                              className="text-xs font-medium text-gray-600 hover:underline"
                            >
                              Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {consumeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Record consumption</h3>
            <p className="mt-1 text-sm text-gray-500">
              {consumeFor.fullName} — add to used totals for the current prepaid period (e.g. from
              smart meter delta).
            </p>
            <label className="mt-4 block text-xs font-medium text-gray-600">
              Power (kWh)
              <input
                type="number"
                min={0}
                step="0.1"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={cPower}
                onChange={(e) => setCPower(e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-gray-600">
              Water (m³)
              <input
                type="number"
                min={0}
                step="0.01"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={cWater}
                onChange={(e) => setCWater(e.target.value)}
                placeholder="0"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setConsumeFor(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={consumeBusy}
                onClick={() => void submitConsumption()}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
              >
                {consumeBusy ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
