import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Trash2 } from 'lucide-react'
import { getSecurityById } from '@/pages/facility/securityMockData'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(160px,240px)_1fr] sm:items-baseline sm:gap-8">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

export function SecurityInformation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const person = useMemo(() => (id ? getSecurityById(id) : undefined), [id])
  const [active, setActive] = useState(person?.isActive ?? true)
  const [showPwd, setShowPwd] = useState(false)
  const [deleteInfoOpen, setDeleteInfoOpen] = useState(false)

  useEffect(() => {
    if (person) setActive(person.isActive)
  }, [person])

  const displayPwd = showPwd ? 'SamplePassword123!' : '••••••••••'

  if (!id) {
    return <p className="text-sm text-gray-600">Invalid link.</p>
  }

  if (!person) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm text-gray-600">Security profile not found.</p>
        <Link to="/facility/security" className="text-sm font-semibold text-brand">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      {deleteInfoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              Removing a security account is not available in this release.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark"
              onClick={() => setDeleteInfoOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-gray-800 transition-colors hover:bg-gray-100"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Security Information
          </h1>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 sm:justify-end">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setActive((a) => !a)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              active ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          <Link
            to={`/facility/security/${id}/edit`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => setDeleteInfoOpen(true)}
            className="text-brand hover:opacity-80"
            aria-label="Delete"
          >
            <Trash2 className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-10">
        <section className="mb-12">
          <h2 className="mb-6 text-base font-semibold text-gray-600">Security Details</h2>
          <dl className="space-y-5">
            <DetailRow label="Security Name" value={person.securityName} />
            <DetailRow label="Email" value={person.email} />
            <DetailRow label="Phone Number" value={person.phone} />
            <DetailRow label="Home Address" value={person.homeAddress} />
            <DetailRow label="Status" value={active ? 'Active' : 'Inactive'} />
            <DetailRow label="Registration Date" value={person.registrationDate} />
          </dl>
        </section>

        <section>
          <h2 className="mb-6 text-base font-semibold text-gray-600">Credentials</h2>
          <dl className="space-y-5">
            <DetailRow label="Email" value={person.credentialEmail} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(160px,240px)_1fr] sm:items-center sm:gap-8">
              <dt className="text-sm text-gray-500">Password</dt>
              <dd className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium tracking-wider text-gray-900">
                  {displayPwd}
                </span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </dd>
            </div>
            <div className="pt-1">
              <Link
                to="/facility/settings/password"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Change Password
              </Link>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
