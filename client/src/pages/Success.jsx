import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import { fetchStripeCheckoutSessionStatus } from '../services/orderService'

function Success() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [stripeOrder, setStripeOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const orderId = location.state?.orderId || stripeOrder?._id
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    let active = true
    let intervalId

    async function loadStripeOrder() {
      if (!sessionId) return

      try {
        if (!stripeOrder) {
          setLoading(true)
        }
        setError('')
        const response = await fetchStripeCheckoutSessionStatus(sessionId)
        if (!active) return
        if (response.order) {
          setStripeOrder(response.order)
          window.clearInterval(intervalId)
        }
      } catch (err) {
        if (!active) return
        setError(err.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadStripeOrder()

    if (sessionId) {
      intervalId = window.setInterval(() => {
        if (!active) return
        loadStripeOrder()
      }, 2500)
    }

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [sessionId, stripeOrder])

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[32px] border border-border bg-surface p-8 text-center shadow-soft">
        <div className="rounded-full bg-emerald-500/15 p-4 text-emerald-500">
          <CheckCircle2 size={48} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
          Order Confirmed
        </p>
        <h1 className="mt-4 font-display text-4xl">
          {sessionId ? 'Payment completed successfully' : 'Order placed successfully'}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          {sessionId
            ? stripeOrder
              ? 'Stripe confirmed your payment. The order is now recorded and marked paid for the admin team.'
              : 'Stripe payment was successful. We are confirming your order with the restaurant now.'
            : 'Your order has been sent to the kitchen. Staff can now manage the status from the admin dashboard.'}
        </p>
        {loading ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-[24px] border border-border bg-surface-strong px-5 py-4 text-sm text-muted">
            <LoaderCircle size={16} className="animate-spin" />
            Loading payment confirmation...
          </div>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        {orderId ? (
          <div className="mt-6 rounded-[24px] border border-border bg-surface-strong px-5 py-4 text-sm text-muted">
            Order ID: <span className="font-semibold text-text">{orderId}</span>
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/account"
            className="rounded-full border border-secondary/20 bg-secondary/8 px-5 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary/12"
          >
            Track order
          </Link>
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
