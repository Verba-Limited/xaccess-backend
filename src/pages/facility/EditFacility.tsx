import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Info } from 'lucide-react'
import { enrichFacilityDetail, getFacilityById } from './mockData'

export function EditFacility() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [active, setActive] = useState(true)
  const [facilityName, setFacilityName] = useState('')
  const [idNo, setIdNo] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [facilityAdmin, setFacilityAdmin] = useState('')
  const [location, setLocation] = useState('')
  const [statusLabel, setStatusLabel] = useState('Active')
  const [registrationDate, setRegistrationDate] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [lastLogin, setLastLogin] = useState('')
  const [credEmail, setCredEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    setReady(false)
    const row = getFacilityById(id)
    if (!row) {
      setLoadError('Facility not found')
      setLoading(false)
      return
    }
    const d = enrichFacilityDetail(row)
    setFacilityName(d.facilityName)
    setIdNo(d.idNo)
    setEmail(d.email)
    setPhone(d.phone)
    setFacilityAdmin(d.facilityAdmin)
    setLocation(d.location)
    setStatusLabel(d.status === 'active' ? 'Active' : 'Inactive')
    setRegistrationDate(d.registrationDate)
    setActive(d.status === 'active')
    setAdminName(d.adminName)
    setAdminEmail(d.adminEmail)
    setAdminPhone(d.adminPhone)
    setLastLogin(d.lastLogin)
    setCredEmail(d.email)
    setReady(true)
    setLoading(false)
  }, [id])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      void navigate(`/facilities/${id}`, { replace: true })
    }, 400)
  }

  if (!id) {
    return <p className="text-red-600">Invalid facility.</p>
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }

  if (!ready && loadError) {
    return (
      <div className="space-y-4">
        <Link
          to="/facilities"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to facilities
        </Link>
        <p className="text-red-600">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        to={`/facilities/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Facility Information</h1>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => {
                setActive((prev) => {
                  const next = !prev
                  setStatusLabel(next ? 'Active' : 'Inactive')
                  return next
                })
              }}
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
            <span className="text-gray-600">{active ? 'Active' : 'Inactive'}</span>
          </label>
          <button
            type="submit"
            form="edit-facility-form"
            disabled={saving}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Done'}
          </button>
        </div>
      </div>

      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      )}

      <form
        id="edit-facility-form"
        onSubmit={onSubmit}
        className="space-y-10 rounded-xl border border-surface-border bg-white px-8 py-10 shadow-card"
      >
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Facility Details</h2>
          <div className="space-y-5">
            <FieldRow label="Facility Name">
              <input
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                required
              />
            </FieldRow>
            <FieldRow label="Facility ID">
              <div className="relative">
                <input
                  value={idNo}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 pr-10 text-sm text-gray-900"
                />
                <Info
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
              </div>
            </FieldRow>
            <FieldRow label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Phone Number">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Facility Admin">
              <input
                value={facilityAdmin}
                onChange={(e) => setFacilityAdmin(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Location">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Status">
              <input
                value={statusLabel}
                onChange={(e) => setStatusLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Registration Date">
              <input
                value={registrationDate}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm"
              />
            </FieldRow>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Admin Info</h2>
          <div className="space-y-5">
            <FieldRow label="Admin Name">
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Email">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Phone Number">
              <input
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Last Login">
              <input
                value={lastLogin}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm"
              />
            </FieldRow>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
          <div className="space-y-5">
            <FieldRow label="Facility ID">
              <div className="relative">
                <input
                  value={idNo}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 pr-10 text-sm"
                />
                <Info
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
              </div>
            </FieldRow>
            <FieldRow label="Email">
              <input
                type="email"
                value={credEmail}
                onChange={(e) => setCredEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </FieldRow>
            <FieldRow label="Password">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </FieldRow>
            <FieldRow label="Confirm Password">
              <div className="relative">
                <input
                  type={showPw2 ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                  onClick={() => setShowPw2(!showPw2)}
                  aria-label={showPw2 ? 'Hide password' : 'Show password'}
                >
                  {showPw2 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </FieldRow>
            <div className="pt-1">
              <Link
                to="/admin-management/change-password"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Change Password
              </Link>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(140px,200px)_1fr] sm:items-center sm:gap-8">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
