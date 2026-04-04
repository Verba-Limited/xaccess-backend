import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const PLACEHOLDER = 'Input Emai'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-center sm:gap-6">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div>{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function FacilityInvoicePlanCreate() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      void navigate('/facility/invoices/plans', { replace: true })
    }, 400)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <div className="flex items-start gap-3">
        <Link
          to="/facility/invoices/plans"
          className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8ED] bg-white text-gray-800 shadow-sm hover:bg-gray-50"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Invoice Plan</h1>
          <p className="mt-1 text-sm text-gray-500">Define a new billing plan for residents.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-10 rounded-2xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
        <Section title="Invoice Plan Details">
          <Field label="Name">
            <input
              type="text"
              placeholder={PLACEHOLDER}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            />
          </Field>
          <Field label="Service Type">
            <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2">
              <option value="">{PLACEHOLDER}</option>
              <option value="Service Charge">Service Charge</option>
              <option value="Utilities">Utilities</option>
            </select>
          </Field>
          <Field label="Due Date">
            <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2">
              <option value="">{PLACEHOLDER}</option>
              <option value="2024-01-01">2024-01-01</option>
            </select>
          </Field>
        </Section>

        <Section title="Billing Details">
          <Field label="Amount">
            <input
              type="text"
              placeholder={PLACEHOLDER}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            />
          </Field>
          <Field label="Billing Frequency">
            <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2">
              <option value="">{PLACEHOLDER}</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </Field>
        </Section>

        <Section title="Category Type">
          <Field label="Category Type">
            <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2">
              <option value="">{PLACEHOLDER}</option>
              <option value="all">All Category</option>
            </select>
          </Field>
        </Section>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Create Invoice Plan'}
        </button>
      </form>
    </div>
  )
}
