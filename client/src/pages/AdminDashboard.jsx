import { useEffect, useMemo, useState } from 'react'
import { LogOut, RefreshCw } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import OrderCard from '../components/admin/OrderCard'
import { fetchOrders, updateOrderStatus } from '../services/orderService'
import { useAuth } from '../context/AuthContext'

function AdminDashboard() {
  const { token, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchOrders(token)
      setOrders(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const metrics = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === 'pending').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      served: orders.filter((order) => order.status === 'served').length,
    }),
    [orders],
  )

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status, token)
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? { ...order, ...updated } : order)),
      )
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
          <button
            type="button"
            onClick={loadOrders}
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

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total orders', metrics.total],
          ['Pending', metrics.pending],
          ['Preparing', metrics.preparing],
          ['Served', metrics.served],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-4xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <section className="mt-8">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-panel h-64 animate-pulse rounded-[28px] bg-surface-strong" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
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
