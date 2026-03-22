import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, HandCoins, ShieldCheck } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import CartItemRow from '../components/cart/CartItemRow'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { createOrder, createStripeCheckout } from '../services/orderService'
import { currency } from '../utils/helpers'

function Cart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState('counter')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!items.length) return
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location },
      })
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const payload = {
        paymentMethod,
        items: items.map(({ _id, name, price, quantity }) => ({
          menuItemId: _id,
          name,
          price,
          quantity,
        })),
        totalPrice: total,
        customerId: user?.id,
      }

      if (paymentMethod === 'stripe') {
        const checkout = await createStripeCheckout(payload)
        clearCart()
        window.location.assign(checkout.checkoutUrl)
        return
      }

      const order = await createOrder(payload)
      clearCart()
      showToast({
        tone: 'success',
        title: 'Order placed',
        message: 'Your order has been sent to the kitchen.',
      })
      navigate('/success', {
        state: {
          orderId: order._id,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionHeading
            eyebrow="Your Cart"
            title="Review your table order before sending it."
            description="Quantity controls and order summary are ready for quick dine-in checkout."
            action={
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
              >
                <ArrowLeft size={16} />
                Back to menu
              </Link>
            }
          />

          <div className="mt-6 space-y-4">
            {items.length ? (
              items.map((item) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            ) : (
              <div className="glass-panel rounded-[28px] p-8 text-center">
                <h2 className="font-display text-3xl">Your cart is empty</h2>
                <p className="mt-3 text-sm text-muted">Add a few dishes from the menu to place your order.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="glass-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Order Summary
          </p>
          <div className="mt-4 rounded-[24px] border border-border bg-surface-strong p-5">
            <p className="text-sm font-semibold">Payment method</p>
            <div className="mt-4 grid gap-3">
              {[
                {
                  id: 'counter',
                  label: 'Cash at counter',
                  description: 'Pay in person at the restaurant counter.',
                  icon: HandCoins,
                  available: true,
                },
                {
                  id: 'stripe',
                  label: 'Stripe',
                  description: 'Pay online with Stripe Checkout in test mode.',
                  icon: CreditCard,
                  available: true,
                },
              ].map(({ id, label, description, icon: Icon, available }) => {
                const active = paymentMethod === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`rounded-[22px] border p-4 text-left transition ${
                      active
                        ? 'border-primary bg-primary/8'
                        : 'border-border hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-2xl p-2 ${active ? 'bg-primary text-bg-strong' : 'bg-surface text-text'}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                          available
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                        }`}
                      >
                        {available ? 'Active' : 'Soon'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-[24px] border border-border bg-surface-strong p-5">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span>{currency(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Payment</span>
              <span>{paymentMethod === 'counter' ? 'Counter' : 'Stripe later'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 font-semibold">
              <span>Total</span>
              <span className="text-primary">{currency(total)}</span>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-border bg-secondary/10 p-4 text-sm text-muted">
            <div className="flex items-center gap-2 font-semibold text-secondary">
              <ShieldCheck size={16} />
              Secure checkout flow
            </div>
            <p className="mt-2">
              {isAuthenticated
                ? paymentMethod === 'counter'
                  ? 'Counter payment is active now. The order is created immediately and stays unpaid until staff marks it paid.'
                  : 'Stripe will redirect you to Checkout. After successful payment, the order is confirmed and marked paid automatically.'
                : 'Login is required before checkout. You can still review your cart first.'}
            </p>
          </div>

          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={!items.length || submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Placing order...' : isAuthenticated ? 'Checkout' : 'Login to checkout'}
          </button>
        </aside>
      </div>
    </AppShell>
  )
}

export default Cart
