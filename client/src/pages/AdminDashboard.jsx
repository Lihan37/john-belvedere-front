import { useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, BellRing, LoaderCircle, LogOut, RefreshCw, Users, UtensilsCrossed, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import OrderCard from '../components/admin/OrderCard'
import {
  fetchDailyOrderReport,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from '../services/orderService'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import {
  clearAdminOrderAlertCount,
  formatDateInput,
  incrementAdminOrderAlertCount,
  playNotificationSound,
} from '../utils/helpers'

const POLLING_INTERVAL_MS = 15000

function AdminDashboard() {
  const { logout } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')
  const [updatingStatusId, setUpdatingStatusId] = useState('')
  const [updatingPaymentId, setUpdatingPaymentId] = useState('')
  const [pendingStatusValue, setPendingStatusValue] = useState('')
  const [pendingPaymentValue, setPendingPaymentValue] = useState('')
  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput())
  const knownOrderIdsRef = useRef(null)

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      const response = await fetchDailyOrderReport(selectedDate)
      const nextOrders = response.orders || []
      const nextOrderIds = new Set(nextOrders.map((order) => order._id))
      const isSelectedDateToday = selectedDate === formatDateInput()

      if (silent && isSelectedDateToday && knownOrderIdsRef.current) {
        const newOrders = nextOrders.filter((order) => !knownOrderIdsRef.current.has(order._id))

        if (newOrders.length) {
          const latestOrder = newOrders[0]
          setNewOrderAlert({
            count: newOrders.length,
            orderId: String(latestOrder._id).slice(0, 6),
            createdAt: latestOrder.createdAt,
          })
          incrementAdminOrderAlertCount(newOrders.length)
          playNotificationSound()
          showToast({
            tone: 'info',
            title: newOrders.length === 1 ? 'New order received' : `${newOrders.length} new orders received`,
            message:
              newOrders.length === 1
                ? `Order #${String(latestOrder._id).slice(0, 6)} just arrived.`
                : 'New customer orders just arrived on the dashboard.',
            duration: 5000,
          })
        }
      }

      setOrders(nextOrders)
      knownOrderIdsRef.current = nextOrderIds
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
      if (silent) {
        showToast({
          tone: 'error',
          title: 'Auto refresh failed',
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
    let active = true

    knownOrderIdsRef.current = null
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
  }, [selectedDate, showToast])

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
      setUpdatingStatusId(orderId)
      setPendingStatusValue(status)
      const updated = await updateOrderStatus(orderId, status)
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? { ...order, ...updated } : order)),
      )
      setLastUpdated(new Date())
      showToast({
        tone: 'success',
        title: 'Order updated',
        message: `Status changed to ${status}.`,
      })
    } catch (err) {
      setError(err.message)
      showToast({
        tone: 'error',
        title: 'Status update failed',
        message: err.message,
      })
    } finally {
      setUpdatingStatusId('')
      setPendingStatusValue('')
    }
  }

  const handlePaymentStatusChange = async (orderId, paymentStatus) => {
    try {
      setUpdatingPaymentId(orderId)
      setPendingPaymentValue(paymentStatus)
      const updated = await updateOrderPaymentStatus(orderId, paymentStatus)
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? { ...order, ...updated } : order)),
      )
      setLastUpdated(new Date())
      showToast({
        tone: 'success',
        title: paymentStatus === 'paid' ? 'Payment marked paid' : 'Payment marked unpaid',
        message: `Order #${String(orderId).slice(0, 6)} is now ${paymentStatus}.`,
      })
    } catch (err) {
      setError(err.message)
      showToast({
        tone: 'error',
        title: 'Payment update failed',
        message: err.message,
      })
    } finally {
      setUpdatingPaymentId('')
      setPendingPaymentValue('')
    }
  }

  const visibleOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return [...orders]
      .filter((order) => {
        if (statusFilter !== 'all' && order.status !== statusFilter) return false
        const paymentMethod = order.paymentMethod || 'counter'
        if (paymentFilter !== 'all' && paymentMethod !== paymentFilter) return false
        if (!normalizedSearch) return true

        const haystack = [
          String(order._id).slice(0, 6),
          paymentMethod,
          ...(order.items || []).map((item) => item.name),
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(normalizedSearch)
      })
      .sort((left, right) => {
        if (sortBy === 'oldest') return new Date(left.createdAt) - new Date(right.createdAt)
        if (sortBy === 'amount') return Number(right.totalPrice) - Number(left.totalPrice)
        return new Date(right.createdAt) - new Date(left.createdAt)
      })
  }, [orders, paymentFilter, search, sortBy, statusFilter])

  return (
    <AppShell>
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <SectionHeading
          eyebrow="Admin Dashboard"
          title="Kitchen and floor order management"
          description="Review one day at a time, track order progress, and go back to earlier dates whenever you need to audit past service."
        />
        <div className="grid w-full gap-2 sm:grid-cols-2 xl:flex xl:w-auto xl:flex-wrap">
          <Link
            to="/admin/menu"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong xl:w-auto"
          >
            <UtensilsCrossed size={16} />
            Manage menu
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong xl:w-auto"
          >
            <Users size={16} />
            Users
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong xl:w-auto"
          >
            <BarChart3 size={16} />
            Daily reports
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-muted xl:inline-flex">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong xl:w-auto"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-text px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90 xl:w-auto"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>

      {newOrderAlert ? (
        <section className="mt-6">
          <div className="glass-panel flex flex-col gap-4 rounded-[28px] border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary p-3 text-bg-strong">
                <BellRing size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                  Live Order Alert
                </p>
                <h2 className="mt-2 font-display text-2xl">
                  {newOrderAlert.count === 1
                    ? `Order #${newOrderAlert.orderId} just came in`
                    : `${newOrderAlert.count} new orders just came in`}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Keep the dashboard open to hear the alert sound whenever fresh orders arrive.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewOrderAlert(null)
                clearAdminOrderAlertCount()
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
            >
              <X size={16} />
              Dismiss
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ['Total orders', metrics.total],
          ['Pending', metrics.pending],
          ['Preparing', metrics.preparing],
          ['Served', metrics.served],
          ['Stripe payment', metrics.stripe],
          ['Counter', metrics.counter],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-3xl p-4 sm:rounded-[28px] sm:p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-semibold sm:text-4xl">{value}</p>
          </div>
        ))}
      </section>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <section className="mt-6 grid gap-3 xl:grid-cols-[0.9fr_1.2fr_0.8fr_0.8fr_0.8fr]">
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-[20px] border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order ID, item name..."
          className="rounded-[20px] border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-[20px] border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="served">Served</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="rounded-[20px] border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">All payments</option>
          <option value="counter">Counter</option>
          <option value="stripe">Stripe payment</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-[20px] border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount">Highest amount</option>
        </select>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-panel h-64 animate-pulse rounded-[28px] bg-surface-strong" />
            ))}
          </div>
        ) : !visibleOrders.length ? (
          <div className="glass-panel rounded-[28px] p-8 text-center">
            <h2 className="font-display text-3xl">No matching orders</h2>
            <p className="mt-3 text-sm text-muted">
              Adjust search or filter settings to see more results.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
                onPaymentStatusChange={handlePaymentStatusChange}
                statusUpdating={updatingStatusId === order._id}
                paymentUpdating={updatingPaymentId === order._id}
                statusPendingValue={pendingStatusValue}
                paymentPendingValue={pendingPaymentValue}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default AdminDashboard
