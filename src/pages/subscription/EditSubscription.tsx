import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  fetchSubscriptionDetail,
  patchSubscription,
} from '@/api/subscriptions'
import { MOCK_PLANS } from './mockData'

const useSubscriptionApi = import.meta.env.VITE_USE_SUBSCRIPTION_API === 'true'

export function EditSubscription() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [adminName, setAdminName] = useState('')
  const [facility, setFacility] = useState('')
  const [plan, setPlan] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    setReady(false)
    fetchSubscriptionDetail(id)
      .then((d) => {
        if (!d) {
          setLoadError('Subscription not found')
          return
        }
        setAdminName(d.adminName)
        setFacility(d.facility)
        setPlan(d.plan)
        setStartDate(d.startDate)
        setEndDate(d.endDate)
        setActive(d.active)
        setReady(true)
      })
      .catch(() => setLoadError('Could not load subscription'))
      .finally(() => setLoading(false))
  }, [id])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setSubmitError(null)
    try {
      if (useSubscriptionApi) {
        await patchSubscription(id, {
          adminName,
          facility,
          plan,
          startDate,
          endDate,
          isActive: active,
        })
      } else {
        await new Promise((r) => setTimeout(r, 300))
      }
      void navigate(`/subscription/subscriptions/${id}`, { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return <p className="text-red-600">Invalid subscription.</p>
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }

  if (!loading && !ready && loadError) {
    return (
      <div className="space-y-4">
        <Link
          to="/subscription"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subscriptions
        </Link>
        <p className="text-red-600">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        to={`/subscription/subscriptions/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit subscription</h1>
        <button
          type="submit"
          form="edit-subscription-form"
          disabled={saving}
          className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {!useSubscriptionApi && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Mock mode: changes are not saved. Set{' '}
          <code className="rounded bg-amber-100 px-1">VITE_USE_SUBSCRIPTION_API=true</code> to call{' '}
          <code className="rounded bg-amber-100 px-1">PATCH /api/v1/admin/subscriptions/:id</code>.
        </p>
      )}

      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      )}

      <form
        id="edit-subscription-form"
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-xl border border-surface-border bg-white p-8 shadow-card"
      >
        <div className="space-y-6">
          <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <label htmlFor="es-admin" className="text-sm font-medium text-gray-600">
              Admin name
            </label>
            <input
              id="es-admin"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <label htmlFor="es-facility" className="text-sm font-medium text-gray-600">
              Facility
            </label>
            <input
              id="es-facility"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <label htmlFor="es-plan" className="text-sm font-medium text-gray-600">
              Plan
            </label>
            <select
              id="es-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            >
              {!MOCK_PLANS.some((p) => p.name === plan) && plan ? (
                <option value={plan}>{plan}</option>
              ) : null}
              {MOCK_PLANS.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <label htmlFor="es-start" className="text-sm font-medium text-gray-600">
              Start date
            </label>
            <input
              id="es-start"
              type="date"
              value={startDate.length >= 10 ? startDate.slice(0, 10) : startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <label htmlFor="es-end" className="text-sm font-medium text-gray-600">
              End date
            </label>
            <input
              id="es-end"
              type="date"
              value={endDate.length >= 10 ? endDate.slice(0, 10) : endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setActive(!active)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  active ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 translate-x-0.5 transform rounded-full bg-white shadow ring-0 transition ${
                    active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              {active ? 'Active' : 'Inactive'}
            </label>
          </div>
        </div>
      </form>
    </div>
  )
}
