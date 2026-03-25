import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Mail, Phone, RefreshCw, Search, Shield, UserRound } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import { useToast } from '../context/useToast'
import { fetchAdminUsers } from '../services/adminUsersService'

function AdminUsers() {
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    customerCount: 0,
    adminCount: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const loadUsers = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      const response = await fetchAdminUsers({ page, limit: 50, search })
      setUsers(response.users || [])
      setPagination(response.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 })
      setStats(response.stats || { totalUsers: 0, customerCount: 0, adminCount: 0 })
    } catch (err) {
      setError(err.message)
      if (silent) {
        showToast({
          tone: 'error',
          title: 'Refresh failed',
          message: err.message,
        })
      }
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadUsers()
  }, [page, search])

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Admin Users"
          title="Registered customers and admins"
          description="View basic account details for everyone who has created an account in the system."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => loadUsers({ silent: true })}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh users
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Total users', stats.totalUsers],
          ['Customers', stats.customerCount],
          ['Admins', stats.adminCount],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[24px] p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-4xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <section className="mt-6">
        <div className="glass-panel rounded-[28px] p-4">
          <label className="flex items-center gap-3 rounded-[20px] border border-border bg-surface-strong px-4 py-3">
            <Search size={16} className="text-muted" />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name, email, phone, role..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-panel h-48 animate-pulse rounded-[28px] bg-surface-strong" />
            ))}
          </div>
        ) : !users.length ? (
          <div className="glass-panel rounded-[28px] p-8 text-center">
            <h2 className="font-display text-3xl">No matching users</h2>
            <p className="mt-3 text-sm text-muted">Try another search keyword.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
            {users.map((user) => (
              <article key={user._id} className="glass-panel rounded-[28px] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <UserRound size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-2xl">{user.name || 'Unnamed user'}</h3>
                        <p className="mt-1 text-sm text-muted">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    user.role === 'admin'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {user.role || 'customer'}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3 rounded-[18px] border border-border bg-surface-strong px-4 py-3">
                    <Mail size={16} className="text-muted" />
                    <span className="break-all">{user.email || 'No email saved'}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-[18px] border border-border bg-surface-strong px-4 py-3">
                    <Phone size={16} className="text-muted" />
                    <span>{user.phone || 'No phone saved'}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-[18px] border border-border bg-surface-strong px-4 py-3">
                    <Shield size={16} className="text-muted" />
                    <span>{user.role === 'admin' ? 'Admin account' : 'Customer account'}</span>
                  </div>
                </div>
              </article>
            ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border bg-surface-strong px-4 py-3">
              <p className="text-sm text-muted">
                Page {pagination.page} of {pagination.totalPages} • Showing up to {pagination.limit} users per page • {pagination.total} matched
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-bg-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-bg-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  )
}

export default AdminUsers
