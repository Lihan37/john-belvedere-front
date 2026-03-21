import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Clock3, CreditCard, Download, LoaderCircle, ReceiptText, UserRound } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import { useAuth } from '../context/AuthContext'
import { fetchMyOrders } from '../services/orderService'
import { useToast } from '../context/ToastContext'
import { currency, downloadOrderVoucher, formatOrderTime } from '../utils/helpers'

const POLLING_INTERVAL_MS = 12000

function CustomerDashboard() {
  const { user, isAdmin, logout } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOrders({ silent = false } = {}) {
      try {
        if (silent) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }
        setError('')
        const response = await fetchMyOrders()
        if (!active) return
        setOrders(response)
        setLastUpdated(new Date())
      } catch (err) {
        if (!active) return
        setError(err.message)
        if (silent) {
          showToast({
            tone: 'error',
            title: 'Live tracking paused',
            message: err.message,
          })
        }
      } finally {
        if (active) {
          if (silent) {
            setRefreshing(false)
          } else {
            setLoading(false)
          }
        }
      }
    }

    loadOrders()
    const intervalId = window.setInterval(() => {
      if (!active) return
      loadOrders({ silent: true })
    }, POLLING_INTERVAL_MS)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [showToast])

  const metrics = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0)
    const activeOrders = orders.filter((order) => ['pending', 'preparing'].includes(order.status)).length
    return {
      activeOrders,
      totalOrders: orders.length,
      totalSpent,
    }
  }, [orders])

  const activeOrders = orders.filter((order) => ['pending', 'preparing'].includes(order.status))

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <AppShell>
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Customer Dashboard"
            title="Menu and orders, nothing extra."
            description="Quick access to active orders and your recent purchases."
          />

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5">
              <UserRound size={15} className="text-primary" />
              {user?.name || 'Customer'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5">
              {refreshing ? <LoaderCircle size={15} className="animate-spin" /> : <Clock3 size={15} />}
              {refreshing
                ? 'Refreshing...'
                : lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Waiting for sync'}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Orders placed', metrics.totalOrders, ReceiptText],
              ['Active orders', metrics.activeOrders, Clock3],
              ['Total spent', currency(metrics.totalSpent), CreditCard],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-[24px] border border-border bg-surface-strong p-4">
                <Icon size={18} className="text-primary" />
                <p className="mt-4 text-sm text-muted">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Account
          </p>
          <div className="mt-5 flex items-start gap-4 rounded-[24px] border border-border bg-surface-strong p-5">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <UserRound size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl">{user?.name || 'Customer'}</h2>
              <p className="mt-2 break-all text-sm text-muted">{user?.email || 'No email saved'}</p>
              <p className="mt-1 text-sm text-muted">{user?.phone || 'No phone saved'}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              to="/menu"
              className="inline-flex w-full items-center justify-between rounded-[22px] border border-border px-4 py-4 text-sm font-semibold transition hover:bg-surface-strong"
            >
              Browse menu
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/cart"
              className="inline-flex w-full items-center justify-between rounded-[22px] border border-border px-4 py-4 text-sm font-semibold transition hover:bg-surface-strong"
            >
              Review cart
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full items-center justify-between rounded-[22px] bg-text px-4 py-4 text-sm font-semibold text-bg transition hover:opacity-90"
            >
              Logout
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading
          eyebrow="Live Orders"
          title="Orders currently moving through the kitchen"
          description="Pending and preparing orders refresh automatically so you can follow active requests."
        />

        <div className="mt-6 space-y-4">
          {activeOrders.length ? (
            activeOrders.map((order) => (
              <article key={`active-${order._id}`} className="glass-panel rounded-[28px] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                      Active order
                    </p>
                    <h3 className="mt-2 font-display text-2xl">Order #{String(order._id).slice(0, 6)}</h3>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                    {order.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted">
                  {order.status === 'pending'
                    ? 'Your order is waiting in the kitchen queue.'
                    : 'Your order is being prepared right now.'}
                </p>
              </article>
            ))
          ) : (
            <div className="glass-panel rounded-[28px] p-8 text-center">
              <h2 className="font-display text-3xl">No active orders right now</h2>
              <p className="mt-3 text-sm text-muted">
                As soon as you place an order, live kitchen status will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading
          eyebrow="Order History"
          title="Recent orders"
          description="Your latest orders, payment method choice, and kitchen status."
        />

        {error ? <p className="mt-5 text-sm text-red-500">{error}</p> : null}

        <div className="mt-6 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="glass-panel h-48 animate-pulse rounded-[28px] bg-surface-strong" />
            ))
          ) : !orders.length ? (
            <div className="glass-panel rounded-[28px] p-8 text-center">
              <h2 className="font-display text-3xl">No orders yet</h2>
              <p className="mt-3 text-sm text-muted">
                When you place your first order, it will appear here with payment and kitchen status.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <article key={order._id} className="glass-panel rounded-[28px] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                      Previous order
                    </p>
                    <h3 className="mt-2 font-display text-2xl">Order #{String(order._id).slice(0, 6)}</h3>
                    <p className="mt-2 text-sm text-muted">{formatOrderTime(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                      {order.status}
                    </span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase text-secondary">
                      {order.paymentMethod === 'stripe' ? 'Stripe later' : 'Counter'}
                    </span>
                    <span className="rounded-full bg-text/10 px-3 py-1 text-xs font-semibold uppercase text-text">
                      {order.paymentStatus || 'unpaid'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <div
                      key={`${order._id}-${item.name}`}
                      className="rounded-[20px] border border-border bg-surface-strong px-4 py-3"
                    >
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.quantity} x {currency(item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-sm text-muted">Total</span>
                    <p className="text-lg font-semibold text-primary">{currency(order.totalPrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadOrderVoucher(order, { title: 'John Belvedere Customer Voucher' })}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
                  >
                    <Download size={16} />
                    Download voucher
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  )
}

export default CustomerDashboard
