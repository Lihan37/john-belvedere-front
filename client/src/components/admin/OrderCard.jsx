import { Download, LoaderCircle } from 'lucide-react'
import { currency, downloadOrderVoucher, formatOrderTime } from '../../utils/helpers'

const statuses = ['pending', 'preparing', 'served']
const paymentStatuses = ['unpaid', 'paid']

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  preparing: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  served: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
}

const paymentMethodStyles = {
  counter: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',
  stripe: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
}

const paymentStatusStyles = {
  unpaid: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  paid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
}

function OrderCard({
  order,
  onStatusChange,
  onPaymentStatusChange,
  statusUpdating = false,
  paymentUpdating = false,
  statusPendingValue = '',
  paymentPendingValue = '',
}) {
  return (
    <article className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Customer order
          </p>
          <h3 className="mt-2 font-display text-xl sm:text-2xl">Order #{order._id.slice(0, 6)}</h3>
          <p className="mt-2 text-sm text-muted">{formatOrderTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[order.status]}`}>
            {order.status}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${paymentMethodStyles[order.paymentMethod || 'counter']}`}
          >
            {order.paymentMethod || 'counter'}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${paymentStatusStyles[order.paymentStatus || 'unpaid']}`}
          >
            {order.paymentStatus || 'unpaid'}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[22px] border border-border bg-surface-strong p-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Payment</p>
          <p className="mt-2 font-semibold">
            {order.paymentMethod === 'stripe' ? 'Stripe later' : 'Counter cash'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Amount</p>
          <p className="mt-2 font-semibold">{currency(order.totalPrice || 0)}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {order.items.map((item) => (
          <div
            key={`${order._id}-${item.name}`}
            className="flex items-start justify-between gap-3 rounded-[18px] border border-border/70 bg-surface-strong px-3 py-3 text-sm"
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

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(order._id, status)}
            disabled={statusUpdating}
            className={`rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              order.status === status
                ? 'border-primary bg-primary text-bg-strong'
                : 'border-border bg-surface hover:bg-surface-strong'
            } ${statusUpdating ? 'cursor-progress opacity-70' : 'cursor-pointer'}`}
          >
            {statusUpdating && statusPendingValue === status ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle size={14} className="animate-spin" />
                Saving
              </span>
            ) : (
              status
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        {paymentStatuses.map((paymentStatus) => (
          <button
            key={paymentStatus}
            type="button"
            onClick={() => onPaymentStatusChange(order._id, paymentStatus)}
            disabled={paymentUpdating}
            className={`rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              (order.paymentStatus || 'unpaid') === paymentStatus
                ? 'border-text bg-text text-bg'
                : 'border-border bg-surface hover:bg-surface-strong'
            } ${paymentUpdating ? 'cursor-progress opacity-70' : 'cursor-pointer'}`}
          >
            {paymentUpdating && paymentPendingValue === paymentStatus ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle size={14} className="animate-spin" />
                Saving
              </span>
            ) : (
              paymentStatus
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => downloadOrderVoucher(order, { title: 'John Belvedere Admin Voucher' })}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-surface-strong"
        >
          <Download size={14} />
          Voucher
        </button>
      </div>
    </article>
  )
}

export default OrderCard
