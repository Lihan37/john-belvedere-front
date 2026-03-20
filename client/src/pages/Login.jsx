import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/common/AppShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const initialRegister = {
  name: '',
  email: '',
  phone: '',
  password: '',
}

const initialLogin = {
  identity: '',
  password: '',
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, login, loading } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState('login')
  const [registerData, setRegisterData] = useState(initialRegister)
  const [loginData, setLoginData] = useState(initialLogin)
  const [error, setError] = useState('')
  const [accountExistsModal, setAccountExistsModal] = useState(false)
  const [accountMissingWarning, setAccountMissingWarning] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/menu'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setAccountExistsModal(false)
    setAccountMissingWarning(false)

    try {
      if (mode === 'register') {
        if (!registerData.email.trim() && !registerData.phone.trim()) {
          setError('Email or phone is required.')
          return
        }
        await signUp(registerData)
        showToast({
          tone: 'success',
          title: 'Account created',
          message: 'You are now logged in.',
        })
      } else {
        await login(loginData)
        showToast({
          tone: 'success',
          title: 'Welcome back',
          message: 'Login successful.',
        })
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.code === 'ACCOUNT_EXISTS') {
        setAccountExistsModal(true)
        return
      }
      if (err.code === 'ACCOUNT_NOT_FOUND') {
        setAccountMissingWarning(true)
        setMode('register')
        showToast({
          tone: 'info',
          title: 'Sign up first',
          message: 'No account was found for that email or phone.',
        })
        return
      }
      setError(err.message)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <section className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
              Customer Access
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Sign up first if you are new
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Already registered? Login and continue. If you do not have an account yet, create one first before trying to sign in.
            </p>
            <Link to="/admin/login" className="mt-4 inline-flex text-sm font-semibold text-primary">
              Admin login
            </Link>
          </div>

          <div className="inline-flex rounded-full border border-border p-1">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${
                  mode === tab ? 'bg-primary text-bg-strong' : 'text-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {accountMissingWarning ? (
              <div className="rounded-[22px] border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                No account found with that email or phone. Please sign up first.
              </div>
            ) : null}
            {mode === 'register' ? (
              <>
                <Field
                  label="Full name"
                  value={registerData.name}
                  onChange={(value) => setRegisterData((current) => ({ ...current, name: value }))}
                />
                <Field
                  label="Email"
                  type="email"
                  required={false}
                  value={registerData.email}
                  onChange={(value) => setRegisterData((current) => ({ ...current, email: value }))}
                />
                <Field
                  label="Phone"
                  required={false}
                  value={registerData.phone}
                  onChange={(value) => setRegisterData((current) => ({ ...current, phone: value }))}
                />
                <Field
                  label="Password"
                  type="password"
                  value={registerData.password}
                  onChange={(value) => setRegisterData((current) => ({ ...current, password: value }))}
                />
              </>
            ) : (
              <>
                <Field
                  label="Email or phone"
                  value={loginData.identity}
                  onChange={(value) => setLoginData((current) => ({ ...current, identity: value }))}
                />
                <Field
                  label="Password"
                  type="password"
                  value={loginData.password}
                  onChange={(value) => setLoginData((current) => ({ ...current, password: value }))}
                />
              </>
            )}

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-text px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Login'}
            </button>
            {mode === 'login' ? (
              <Link to="/forgot-password" className="inline-flex text-sm font-semibold text-primary">
                Forgot password?
              </Link>
            ) : null}
          </form>
        </section>
      </div>
      {accountExistsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-surface-strong p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
              Account Found
            </p>
            <h2 className="mt-4 font-display text-3xl">You already have an account</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Use the login form with your existing email or phone number instead of signing up again.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAccountExistsModal(false)
                  setMode('login')
                }}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong"
              >
                Go to login
              </button>
              <button
                type="button"
                onClick={() => setAccountExistsModal(false)}
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

function Field({ label, type = 'text', value, onChange, required = true }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
        required={required}
      />
    </label>
  )
}

export default Login
