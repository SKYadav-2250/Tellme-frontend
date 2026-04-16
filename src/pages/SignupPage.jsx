import { useState, useMemo } from 'react'
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

const UserIcon = () => (
  <svg className="h-5 w-5 text-[#93a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19a4 4 0 10-8 0m4-7a3 3 0 100-6 3 3 0 000 6z" />
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

const OtpIcon = () => (
  <svg className="h-5 w-5 text-[#93a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: '' }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    }
    
    Object.values(checks).forEach((check) => {
      if (check) score++
    })
    
    return {
      score,
      checks,
      text: score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : 'Strong',
      color: score <= 1 ? 'text-red-400' : score <= 3 ? 'text-yellow-400' : 'text-green-400',
      bg: score <= 1 ? 'bg-red-500/20' : score <= 3 ? 'bg-yellow-500/20' : 'bg-green-500/20',
      border: score <= 1 ? 'border-red-500/30' : score <= 3 ? 'border-yellow-500/30' : 'border-green-500/30',
    }
  }, [password])

  if (!password) return null

  return (
    <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${strength.border} ${strength.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold ${strength.color}`}>Password Strength: {strength.text}</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 w-1.5 rounded-full transition-colors ${
                i < strength.score ? strength.color : 'bg-[#2d3449]'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1 text-xs text-[#bacac5]">
        {[
          { label: 'Minimum 8 characters', check: strength.checks.length },
          { label: 'Uppercase letter', check: strength.checks.uppercase },
          { label: 'Lowercase letter', check: strength.checks.lowercase },
          { label: 'Number', check: strength.checks.number },
          { label: 'Special character', check: strength.checks.special },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {item.check ? <CheckIcon /> : <span className="h-4 w-4" />}
            <span className={item.check ? 'text-green-300' : ''}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SignupPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', about: '' })
  const [errors, setErrors] = useState({ name: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard'

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '' }
    let isValid = true

    if (!form.name.trim()) {
      newErrors.name = 'Username is required'
      isValid = false
    } else if (form.name.length < 3) {
      newErrors.name = 'Username must be at least 3 characters'
      isValid = false
    }

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
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      await axios.post('/api/auth/signup', form)
      setStep(2)
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Signup failed. Please try again.')
      if (err.response?.data?.field) {
        setErrors((prev) => ({ ...prev, [err.response.data.field]: err.response.data.message }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    
    if (!otp.trim()) {
      setGeneralError('Verification code is required')
      return
    }

    if (otp.length !== 6) {
      setGeneralError('Verification code must be 6 digits')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { ...form, otp })
      login(data.user, data.token)
      navigate(redirect, { replace: true })
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Verification failed. Please check your code.')
    } finally {
      setLoading(false)
    }
  }

  const isStep1Valid = form.name && form.email && form.password && !errors.name && !errors.email && !errors.password

  return (
    <AuthShell
      title={step === 1 ? 'Create Account' : 'Verify Email'}
      subtitle="Enter the focused sanctuary of conversation."
      footer={(
        <>
          {step === 1 ? (
            <p className="mt-8 text-center text-base text-[#c2cbcc]">
              Already have an account?{' '}
              <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-[#57f1db] hover:text-[#62fae3] transition-colors">
                Sign in
              </Link>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="mt-8 w-full text-center text-sm font-medium text-[#57f1db] hover:text-[#62fae3] transition-colors"
            >
              Go back and edit details
            </button>
          )}
          <p className="mt-6 text-center text-sm leading-7 text-[#7f8c93]">
            By clicking "Create Account", you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
          </p>
        </>
      )}
    >
      {generalError && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSignupSubmit} className="space-y-6">
          <AuthField 
            label="Username" 
            icon={<UserIcon />}
            error={errors.name}
          >
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="alex_rivera"
              className="w-full border-none bg-transparent p-0 text-[1.15rem] text-[#c2cbcc] placeholder:text-[#7f8c93] focus:outline-none focus:ring-0"
              autoComplete="name"
              aria-label="Username"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </AuthField>

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
              aria-label="Email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </AuthField>

          <div>
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
                placeholder="Minimum 8 characters"
                className="w-full border-none bg-transparent p-0 text-[1.15rem] text-[#c2cbcc] placeholder:text-[#7f8c93] focus:outline-none focus:ring-0"
                autoComplete="new-password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
            </AuthField>
            <PasswordStrengthMeter password={form.password} />
          </div>

          <button
            type="submit"
            disabled={loading || !isStep1Valid}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3cddc7] to-[#62fae3] px-6 py-6 text-2xl font-bold text-[#07333b] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#62fae3]/50"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="mt-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/8" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2cbcc]">Or continue with</p>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button type="button" disabled className="rounded-[1.5rem] border border-white/5 bg-[#101d33] px-4 py-5 text-lg font-semibold text-[#c2cbcc] opacity-70">
                Google
              </button>
              <button type="button" disabled className="rounded-[1.5rem] border border-white/5 bg-[#101d33] px-4 py-5 text-lg font-semibold text-[#c2cbcc] opacity-70">
                Apple
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="rounded-[1.75rem] border border-[#57f1db]/10 bg-[#0f2135] px-5 py-4 text-sm text-[#c2cbcc]">
            Enter the verification code sent to <span className="font-semibold text-white">{form.email}</span>
          </div>

          <AuthField label="Verification Code" icon={<OtpIcon />}>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setOtp(value)
                setGeneralError('')
              }}
              placeholder="123456"
              className="w-full border-none bg-transparent p-0 text-[1.3rem] tracking-[0.35em] text-[#c2cbcc] placeholder:text-[#7f8c93] focus:outline-none focus:ring-0"
              autoComplete="one-time-code"
              maxLength={6}
              inputMode="numeric"
              aria-label="Verification code"
            />
          </AuthField>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3cddc7] to-[#62fae3] px-6 py-6 text-2xl font-bold text-[#07333b] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#62fae3]/50"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying...
              </>
            ) : (
              'Verify & Create Account'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default SignupPage
