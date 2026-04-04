import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

/** Placeholders match design mock (including “Input Emai”). */
const PH_EMAIL = 'Input Emai'
const PH_PASSWORD = 'Input Password'

function FormRow({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,200px)_1fr] sm:items-center sm:gap-8">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-brand focus:ring-2"
      />
    </div>
  )
}

function PasswordRow({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,200px)_1fr] sm:items-center sm:gap-8">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-brand focus:ring-2"
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
  )
}

export function CreateSecurityAccount() {
  const navigate = useNavigate()
  const [securityName, setSecurityName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // API not available — design-only flow
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg text-gray-800 transition-colors hover:bg-gray-100"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
        Create Security Account
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-10 space-y-10 rounded-xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-10"
      >
        <section className="space-y-6">
          <h2 className="text-base font-semibold text-gray-600">Security Details</h2>
          <div className="space-y-5">
            <FormRow
              label="Security Name"
              placeholder={PH_EMAIL}
              value={securityName}
              onChange={setSecurityName}
              autoComplete="name"
            />
            <FormRow
              label="Email"
              placeholder={PH_EMAIL}
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />
            <FormRow
              label="Phone Number"
              placeholder={PH_EMAIL}
              value={phone}
              onChange={setPhone}
              type="tel"
              autoComplete="tel"
            />
            <FormRow
              label="Home Address"
              placeholder={PH_EMAIL}
              value={homeAddress}
              onChange={setHomeAddress}
              autoComplete="street-address"
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-base font-semibold text-gray-600">Credentials</h2>
          <div className="space-y-5">
            <FormRow
              label="Username"
              placeholder={PH_EMAIL}
              value={username}
              onChange={setUsername}
              autoComplete="username"
            />
            <PasswordRow
              label="Password"
              placeholder={PH_PASSWORD}
              value={password}
              onChange={setPassword}
              show={showPwd}
              onToggleShow={() => setShowPwd((s) => !s)}
              autoComplete="new-password"
            />
            <PasswordRow
              label="Confirm Password"
              placeholder={PH_PASSWORD}
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((s) => !s)}
              autoComplete="new-password"
            />
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="w-full max-w-md rounded-lg bg-brand py-3.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark"
          >
            Create Secuity Account
          </button>
        </div>
      </form>
    </div>
  )
}
