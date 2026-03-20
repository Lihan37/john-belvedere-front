import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import AppShell from '../components/common/AppShell'

function Success() {
  const location = useLocation()
  const orderId = location.state?.orderId

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[32px] border border-border bg-surface p-8 text-center shadow-soft">
        <div className="rounded-full bg-emerald-500/15 p-4 text-emerald-500">
          <CheckCircle2 size={48} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
          Order Confirmed
        </p>
        <h1 className="mt-4 font-display text-4xl">Order placed successfully</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Your order has been sent to the kitchen. Staff can now manage the status from the admin dashboard.
        </p>
        {orderId ? (
          <div className="mt-6 rounded-[24px] border border-border bg-surface-strong px-5 py-4 text-sm text-muted">
            Order ID: <span className="font-semibold text-text">{orderId}</span>
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/menu"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong"
          >
            Back to menu
          </Link>
          <Link
            to="/cart"
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface-strong"
          >
            View cart
          </Link>
        </div>
      </div>
    </AppShell>
  )
}

export default Success
