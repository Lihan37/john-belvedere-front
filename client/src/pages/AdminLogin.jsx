import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/common/AppShell'
import { useAuth } from '../context/AuthContext'
import { getAllowedAdminPhones } from '../utils/helpers'

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginAsAdmin, loading } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const redirectTo = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await loginAsAdmin({ phone, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="glass-panel rounded-[32px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Admin Access
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Restricted dashboard login for restaurant operations.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            The frontend is prepared for multiple admin numbers later. For now, only whitelisted phone numbers can enter.
          </p>
          <div className="mt-6 rounded-[24px] border border-border bg-surface-strong p-5">
            <p className="text-sm font-semibold">Current allowed number(s)</p>
            <p className="mt-2 text-sm text-muted">{getAllowedAdminPhones().join(', ') || 'Configured from env'}</p>
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Admin phone number</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                placeholder="01716285196"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                placeholder="Enter admin password"
                required
              />
            </label>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong disabled:opacity-50"
            >
              {loading ? 'Checking access...' : 'Login to dashboard'}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  )
}

export default AdminLogin
