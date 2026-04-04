import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { MOCK_PLANS } from './mockData'

const PLAN_TYPES = [
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'custom', label: 'Custom' },
]

export function EditSubscriptionPlan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [active, setActive] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const plan = MOCK_PLANS.find((p) => p.id === id)
    if (plan) {
      setType(plan.type)
      setMonthlyPrice(String(plan.monthlyPrice))
    }
  }, [id])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      void navigate('/subscription', { replace: true })
    }, 400)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/subscription"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Back to subscription management"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2]" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Edit Subscription Plan
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-5 sm:pt-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
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
            <span className="text-gray-600">Active</span>
          </label>
          <button
            type="submit"
            form="edit-plan-form"
            disabled={busy}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Done'}
          </button>
        </div>
      </div>

      <form
        id="edit-plan-form"
        onSubmit={onSubmit}
        className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]"
      >
        <div className="space-y-10">
          <div className="grid gap-3 sm:grid-cols-[minmax(160px,200px)_minmax(0,1fr)] sm:items-center sm:gap-8">
            <label
              htmlFor="edit-plan-type"
              className="text-sm font-medium leading-none text-gray-600 sm:pt-0.5"
            >
              Type
            </label>
            <div className="relative">
              <select
                id="edit-plan-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-4 pr-12 text-sm text-gray-900 shadow-sm outline-none transition-colors hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Select Type</option>
                {PLAN_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(160px,200px)_minmax(0,1fr)] sm:items-center sm:gap-8">
            <label
              htmlFor="edit-monthly-price"
              className="text-sm font-medium leading-none text-gray-600 sm:pt-0.5"
            >
              Monthly Price
            </label>
            <input
              id="edit-monthly-price"
              type="text"
              inputMode="decimal"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
