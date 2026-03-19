import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, LogOut, RefreshCw } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import OrderCard from '../components/admin/OrderCard'
import { fetchOrders, updateOrderStatus } from '../services/orderService'
import { useAuth } from '../context/AuthContext'

const POLLING_INTERVAL_MS = 15000

function AdminDashboard() {
  const { logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      const response = await fetchOrders()
      setOrders(response)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    let active = true

    loadOrders()

    const intervalId = window.setInterval(async () => {
      if (!active) return
      await loadOrders({ silent: true })
    }, POLLING_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOrders({ silent: true })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      active = false
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const metrics = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === 'pending').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      served: orders.filter((order) => order.status === 'served').length,
      stripe: orders.filter((order) => order.paymentMethod === 'stripe').length,
      counter: orders.filter((order) => (order.paymentMethod || 'counter') === 'counter').length,
    }),
    [orders],
  )

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status)
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? { ...order, ...updated } : order)),
      )
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Admin Dashboard"
          title="Kitchen and floor order management"
          description="Monitor table activity, track order status, and prepare for future real-time event updates."
        />
        <div className="flex gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-muted sm:inline-flex">
            {refreshing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {refreshing
              ? 'Auto refreshing...'
              : lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Waiting for sync'}
          </div>
          <button
            type="button"
            onClick={() => loadOrders({ silent: true })}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-text px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ['Total orders', metrics.total],
          ['Pending', metrics.pending],
          ['Preparing', metrics.preparing],
          ['Served', metrics.served],
          ['Stripe later', metrics.stripe],
          ['Counter', metrics.counter],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-semibold sm:text-4xl">{value}</p>
          </div>
        ))}
      </section>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <section className="mt-8">
        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-panel h-64 animate-pulse rounded-[28px] bg-surface-strong" />
            ))}
          </div>
        ) : !orders.length ? (
          <div className="glass-panel rounded-[28px] p-8 text-center">
            <h2 className="font-display text-3xl">No orders yet</h2>
            <p className="mt-3 text-sm text-muted">
              New customer orders will appear here automatically every few seconds.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default AdminDashboard
