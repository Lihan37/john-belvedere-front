import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/common/AppShell'
import { requestPasswordReset, resetPassword } from '../services/authService'
import { useToast } from '../context/ToastContext'

function ForgotPassword() {
  const { showToast } = useToast()
  const [identity, setIdentity] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [issuedToken, setIssuedToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestReset = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await requestPasswordReset({ identity })
      setIssuedToken(response?.resetToken || '')
      showToast({
        tone: 'success',
        title: 'Reset token prepared',
        message: response?.resetToken
          ? 'Development reset token is shown below.'
          : 'If the account exists, reset instructions are prepared.',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await resetPassword({ token, password })
      setToken('')
      setPassword('')
      showToast({
        tone: 'success',
        title: 'Password updated',
        message: 'You can now return to login with your new password.',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-[32px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Password Reset
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight">Request a reset token</h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter the email or phone number linked to your account. For now, the reset token is shown in development mode until mail/SMS delivery is added.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleRequestReset}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email or phone</span>
              <input
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong disabled:opacity-50"
            >
              {loading ? 'Preparing...' : 'Request reset'}
            </button>
          </form>

          {issuedToken ? (
            <div className="mt-5 rounded-[22px] border border-border bg-surface-strong p-4">
              <p className="text-sm font-semibold">Development reset token</p>
              <p className="mt-2 break-all text-sm text-muted">{issuedToken}</p>
            </div>
          ) : null}
        </section>

        <section className="glass-panel rounded-[32px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Set New Password
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight">Finish password reset</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Paste the token and choose a new password.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Reset token</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">New password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-text px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Reset password'}
            </button>
          </form>

          <Link to="/login" className="mt-5 inline-flex text-sm font-semibold text-primary">
            Back to login
          </Link>
        </section>
      </div>
    </AppShell>
  )
}

export default ForgotPassword
