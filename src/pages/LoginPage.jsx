import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const EyeIcon = ({ open }) => (
  <svg className="h-5 w-5 text-[#93a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.178 2.468M3 3l18 18" />
    )}
  </svg>
)

const MailIcon = () => (
  <svg className="h-5 w-5 text-[#93a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 11H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
  </svg>
)

const LockIcon = () => (
  <svg className="h-5 w-5 text-[#93a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.105 0 2 .895 2 2v2a2 2 0 11-4 0v-2c0-1.105.895-2 2-2zm6 8H6a2 2 0 01-2-2v-6a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2zm-9-8V8a3 3 0 116 0v3" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const AuthField = ({ label, icon, right, error, children }) => (
  <div>
    <label className="block">
      <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.22em] text-[#c2cbcc]">
        {label}
      </span>
      <div className={`flex items-center gap-4 rounded-[1.75rem] border px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all ${
        error 
          ? 'border-red-500/30 bg-gradient-to-r from-[#1a0f0f] to-[#0f0a0a]' 
          : 'border-white/5 bg-gradient-to-r from-[#102236] to-[#0c1a2f]'
      }`}>
        <span className="shrink-0">{icon}</span>
        <div className="flex-1">{children}</div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </label>
    {error && (
      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
        <ErrorIcon />
        {error}
      </p>
    )}
  </div>
)

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09182a] px-5 py-10 text-white">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(87,241,219,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_24%)]" />
    <div className="relative z-10 w-full max-w-[40rem]">
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-b from-[#62fae3] to-[#3cddc7] bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl">
          TellMe
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[#c2cbcc] sm:text-[2rem] sm:leading-[2.6rem]">
          {subtitle}
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-[#071426]/70 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">{title}</h2>
        {children}
        {footer}
      </div>
    </div>
  </div>
)

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard'

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = { email: '', password: '' }
    let isValid = true

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setGeneralError('')
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', form)
      login(data.user, data.token)
      navigate(redirect, { replace: true })
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
      setGeneralError(errorMessage)
      if (err.response?.data?.field) {
        setErrors((prev) => ({ ...prev, [err.response.data.field]: err.response.data.message }))
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = form.email && form.password && !errors.email && !errors.password

  return (
    <AuthShell
      title="Sign In"
      subtitle="Enter the focused sanctuary of conversation."
      footer={(
        <>
          <p className="mt-8 text-center text-base text-[#c2cbcc]">
            Don&apos;t have an account?{' '}
            <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-[#57f1db] hover:text-[#62fae3] transition-colors">
              Create one
            </Link>
          </p>
          <p className="mt-6 text-center text-sm leading-7 text-[#7f8c93]">
            By continuing, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
          </p>
        </>
      )}
    >
      {generalError && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-3 animate-in">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthField 
          label="Email Address" 
          icon={<MailIcon />}
          error={errors.email}
        >
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="alex@example.com"
            className="w-full border-none bg-transparent p-0 text-[1.15rem] text-[#c2cbcc] placeholder:text-[#7f8c93] focus:outline-none focus:ring-0"
            autoComplete="email"
            aria-label="Email address"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </AuthField>

        <AuthField
          label="Password"
          icon={<LockIcon />}
          error={errors.password}
          right={(
            <button 
              type="button" 
              onClick={() => setShowPass((v) => !v)} 
              className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#57f1db]/50 rounded p-1"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPass} />
            </button>
          )}
        >
          <input
            type={showPass ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            className="w-full border-none bg-transparent p-0 text-[1.15rem] text-[#c2cbcc] placeholder:text-[#7f8c93] focus:outline-none focus:ring-0"
            autoComplete="current-password"
            aria-label="Password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </AuthField>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3cddc7] to-[#62fae3] px-6 py-6 text-2xl font-bold text-[#07333b] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#62fae3]/50"
          aria-label="Sign in button"
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/8" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2cbcc]">Or continue with</p>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button type="button" disabled className="rounded-[1.5rem] border border-white/5 bg-[#101d33] px-4 py-5 text-lg font-semibold text-[#c2cbcc] opacity-70 transition-opacity">
            Google
          </button>
          <button type="button" disabled className="rounded-[1.5rem] border border-white/5 bg-[#101d33] px-4 py-5 text-lg font-semibold text-[#c2cbcc] opacity-70 transition-opacity">
            Apple
          </button>
        </div>
      </div>
    </AuthShell>
  )
}

export default LoginPage
