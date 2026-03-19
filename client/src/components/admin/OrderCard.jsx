import { formatOrderTime } from '../../utils/helpers'

const statuses = ['pending', 'preparing', 'served']

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  preparing: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  served: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
}

function OrderCard({ order, onStatusChange }) {
  return (
    <article className="glass-panel rounded-[28px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Table {order.tableNumber}
          </p>
          <h3 className="mt-2 font-display text-2xl">Order #{order._id.slice(0, 6)}</h3>
          <p className="mt-2 text-sm text-muted">{formatOrderTime(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {order.items.map((item) => (
          <div key={`${order._id}-${item.name}`} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">
              {item.quantity}x {item.name}
            </span>
            <span className="font-semibold">{item.price * item.quantity} BDT</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(order._id, status)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              order.status === status
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface hover:bg-surface-strong'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </article>
  )
}

export default OrderCard
