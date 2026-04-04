import { useLayoutEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { getSecurityById } from '@/pages/facility/securityMockData'

function FormRow({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,200px)_1fr] sm:items-center sm:gap-8">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
      />
    </div>
  )
}

function PasswordRow({
  label,
  value,
  onChange,
  show,
  onToggleShow,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,200px)_1fr] sm:items-start sm:gap-8">
      <label className="pt-2.5 text-sm font-medium text-gray-600">{label}</label>
      <div>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={onToggleShow}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EditSecurityProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const person = useMemo(() => (id ? getSecurityById(id) : undefined), [id])

  const [active, setActive] = useState(true)
  const [securityName, setSecurityName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [credEmail, setCredEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useLayoutEffect(() => {
    if (!id) return
    const p = getSecurityById(id)
    if (!p) return
    setActive(p.isActive)
    setSecurityName(p.securityName)
    setEmail(p.email)
    setPhone(p.phone)
    setHomeAddress(p.homeAddress)
    setCredEmail(p.credentialEmail)
    setPassword('')
    setConfirmPassword('')
  }, [id])

  function onDone(e: React.FormEvent) {
    e.preventDefault()
    if (id) {
      navigate(`/facility/security/${id}`, { replace: true })
    } else {
      navigate(-1)
    }
  }

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
      <form onSubmit={onDone}>
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
              Edit Security Profile
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
            <button
              type="submit"
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark"
            >
              Done
            </button>
          </div>
        </div>

        <div className="space-y-10 rounded-xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-10">
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-gray-600">Security Details</h2>
            <div className="space-y-5">
              <FormRow label="Security Name" value={securityName} onChange={setSecurityName} />
              <FormRow
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
              />
              <FormRow label="Phone Number" value={phone} onChange={setPhone} type="tel" />
              <FormRow label="Home Address" value={homeAddress} onChange={setHomeAddress} />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-base font-semibold text-gray-600">Credentials</h2>
            <div className="space-y-5">
              <FormRow
                label="Email"
                value={credEmail}
                onChange={setCredEmail}
                type="email"
              />
              <PasswordRow
                label="Password"
                value={password}
                onChange={setPassword}
                show={showPwd}
                onToggleShow={() => setShowPwd((s) => !s)}
              />
              <PasswordRow
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggleShow={() => setShowConfirm((s) => !s)}
              />
              <div className="pt-1 sm:pl-[calc(min(200px,25%)+2rem)]">
                <Link
                  to="/facility/settings/password"
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
