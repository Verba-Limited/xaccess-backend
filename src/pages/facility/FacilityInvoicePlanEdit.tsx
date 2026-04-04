import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getInvoicePlanById } from '@/pages/facility/invoiceFacilityMock'

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

export function FacilityInvoicePlanEdit() {
  const { id } = useParams<{ id: string }>()
  const plan = useMemo(() => (id ? getInvoicePlanById(id) : undefined), [id])
  const [done, setDone] = useState(true)

  if (!id || !plan) {
    return (
      <div className="rounded-xl border border-[#E8E8ED] bg-white p-8 text-center text-sm text-gray-600">
        Plan not found.
        <div className="mt-4">
          <Link to="/facility/invoices/plans" className="font-semibold text-brand hover:underline">
            Back to Manage Invoice Plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/facility/invoices/plans"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8ED] bg-white text-gray-800 shadow-sm hover:bg-gray-50"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Invoice Plan</h1>
            <p className="mt-1 text-sm text-gray-500">Update billing plan details.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:pt-1">
          <button
            type="button"
            role="switch"
            aria-checked={done}
            onClick={() => setDone((d) => !d)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              done ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                done ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm font-semibold text-brand">Done</span>
        </div>
      </div>

      <form
        className="space-y-10 rounded-2xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <Section title="Invoice Plan Details">
          <Field label="Name">
            <input
              type="text"
              defaultValue={plan.name}
              placeholder={PLACEHOLDER}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            />
          </Field>
          <Field label="Service Type">
            <select
              defaultValue={plan.serviceType}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            >
              <option value="">{PLACEHOLDER}</option>
              <option value="Service Charge">Service Charge</option>
            </select>
          </Field>
          <Field label="Due Date">
            <select
              defaultValue={plan.dueDate}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            >
              <option value="">{PLACEHOLDER}</option>
              <option value="2024-01-01">2024-01-01</option>
            </select>
          </Field>
        </Section>

        <Section title="Billing Details">
          <Field label="Amount">
            <input
              type="text"
              defaultValue={plan.amount}
              placeholder={PLACEHOLDER}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            />
          </Field>
          <Field label="Billing Frequency">
            <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2">
              <option value="">{PLACEHOLDER}</option>
              <option value="monthly">Monthly</option>
            </select>
          </Field>
        </Section>

        <Section title="Category Type">
          <Field label="Category Type">
            <select
              defaultValue={plan.category}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            >
              <option value="">{PLACEHOLDER}</option>
              <option value="All Category">All Category</option>
            </select>
          </Field>
        </Section>

        <button
          type="button"
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
