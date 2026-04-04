import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'

const PLAN_TYPES = [
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'custom', label: 'Custom' },
]

export function CreateSubscriptionPlan() {
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [busy, setBusy] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!type) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      void navigate('/subscription', { replace: true })
    }, 400)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Figma: back arrow only above title, generous spacing */}
      <div className="mb-10">
        <Link
          to="/subscription"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Back to subscription management"
        >
          <ArrowLeft className="h-5 w-5 stroke-[2]" />
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Create Subscription Plan
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]"
      >
        <div className="space-y-10">
          {/* Horizontal label + control (matches Figma admin forms) */}
          <div className="grid gap-3 sm:grid-cols-[minmax(160px,200px)_minmax(0,1fr)] sm:items-center sm:gap-8">
            <label
              htmlFor="plan-type"
              className="text-sm font-medium leading-none text-gray-600 sm:pt-0.5"
            >
              Type
            </label>
            <div className="relative">
              <select
                id="plan-type"
                required
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
              htmlFor="monthly-price"
              className="text-sm font-medium leading-none text-gray-600 sm:pt-0.5"
            >
              Monthly Price
            </label>
            <input
              id="monthly-price"
              type="text"
              inputMode="decimal"
              required
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <div className="mt-12">
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand py-4 text-base font-semibold text-white shadow-md transition hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Create Subscription Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}
