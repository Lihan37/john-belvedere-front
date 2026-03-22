import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CalendarDays, Download, LoaderCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import { fetchDailyOrderReport } from '../services/orderService'
import { currency, downloadOrderVoucher, formatDateInput, formatOrderTime } from '../utils/helpers'

function AdminReports() {
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadReport = async ({ silent = false, date = selectedDate } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      const response = await fetchDailyOrderReport(date)
      setReport(response)
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
    loadReport({ date: selectedDate })
  }, [selectedDate])

  const summaryCards = useMemo(() => {
    const summary = report?.summary || {
      totalOrders: 0,
      paidIncome: 0,
      unpaidAmount: 0,
      totalItems: 0,
      paidOrders: 0,
      unpaidOrders: 0,
    }

    return [
      ['Paid income', currency(summary.paidIncome || 0)],
      ['Total orders', String(summary.totalOrders || 0)],
      ['Unpaid amount', currency(summary.unpaidAmount || 0)],
      ['Items sold', String(summary.totalItems || 0)],
    ]
  }, [report])

  const summary = report?.summary || {
    byStatus: { pending: 0, preparing: 0, served: 0 },
    byPaymentMethod: { counter: 0, stripe: 0 },
    paidOrders: 0,
    unpaidOrders: 0,
  }

  return (
    <AppShell>
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <SectionHeading
          eyebrow="Admin Reports"
          title="Daily orders and recognized income"
          description="Income counts only orders marked as paid. Review day performance, open balances, and download vouchers from one place."
        />
        <div className="grid w-full gap-2 sm:grid-cols-2 xl:flex xl:w-auto xl:flex-wrap">
          <Link
            to="/admin/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong xl:w-auto"
          >
            <BarChart3 size={16} />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => loadReport({ silent: true })}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong xl:w-auto"
          >
            {refreshing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[32px] p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                Selected day
              </p>
              <h2 className="mt-3 font-display text-3xl">Operational snapshot</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Paid orders contribute to income. Unpaid orders remain visible as outstanding value.
              </p>
            </div>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <CalendarDays size={15} />
                Report date
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-[18px] border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-border bg-surface-strong p-4">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-3 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Mix
          </p>
          <h2 className="mt-3 font-display text-3xl">Status and payment spread</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Pending', summary.byStatus.pending || 0],
              ['Preparing', summary.byStatus.preparing || 0],
              ['Served', summary.byStatus.served || 0],
              ['Paid', summary.paidOrders || 0],
              ['Unpaid', summary.unpaidOrders || 0],
              ['Counter', summary.byPaymentMethod.counter || 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[22px] border border-border bg-surface-strong p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted">{label}</span>
                  <span className="text-lg font-semibold">{value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-bg">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.max(
                        8,
                        ((Number(value) || 0) / Math.max(1, summary.totalOrders || 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <section className="mt-8">
        <div className="glass-panel rounded-[32px] p-6 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                Order Register
              </p>
              <h2 className="mt-3 font-display text-3xl">Orders for {selectedDate}</h2>
            </div>
            <p className="text-sm text-muted">
              Income only includes rows already marked paid.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[24px] bg-surface-strong" />
              ))
            ) : !report?.orders?.length ? (
              <div className="rounded-[24px] border border-border bg-surface-strong p-8 text-center">
                <h3 className="font-display text-3xl">No orders on this day</h3>
                <p className="mt-3 text-sm text-muted">
                  Choose another date or wait for new orders to come in.
                </p>
              </div>
            ) : (
              report.orders.map((order) => (
                <article
                  key={order._id}
                  className="rounded-[24px] border border-border bg-surface-strong p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                        Order #{String(order._id).slice(0, 6)}
                      </p>
                      <h3 className="mt-2 font-display text-2xl">{formatOrderTime(order.createdAt)}</h3>
                      <p className="mt-3 text-sm text-muted">
                        {order.items.length} items, {order.paymentMethod === 'stripe' ? 'Stripe payment' : 'Counter cash'}.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                        {order.status}
                      </span>
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase text-secondary">
                        {order.paymentStatus || 'unpaid'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          downloadOrderVoucher(order, { title: 'John Belvedere Daily Voucher' })
                        }
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-bg"
                      >
                        <Download size={14} />
                        Voucher
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={`${order._id}-${item.name}`}
                          className="flex items-center justify-between gap-3 rounded-[18px] border border-border/70 bg-bg px-4 py-3 text-sm"
                        >
                          <span className="min-w-0 text-muted">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="shrink-0 font-semibold">
                            {currency(Number(item.price || 0) * Number(item.quantity || 0))}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[20px] border border-border bg-bg px-5 py-4 lg:min-w-52">
                      <p className="text-xs uppercase tracking-[0.25em] text-muted">Recognized income</p>
                      <p className="mt-3 text-2xl font-semibold text-primary">
                        {order.paymentStatus === 'paid' ? currency(order.totalPrice || 0) : currency(0)}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        {order.paymentStatus === 'paid'
                          ? 'Included in daily income.'
                          : 'Excluded until marked paid.'}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

export default AdminReports
