import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, LoaderCircle, Minus, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import CategoryTabs from '../components/menu/CategoryTabs'
import { createCounterOrder } from '../services/orderService'
import { fetchMenu } from '../services/menuService'
import { calculateCartTotal, currency, isDrinkCategory } from '../utils/helpers'
import { useToast } from '../context/useToast'

function CounterOrder() {
  const { showToast } = useToast()
  const [menuItems, setMenuItems] = useState([])
  const [items, setItems] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdOrder, setCreatedOrder] = useState(null)

  useEffect(() => {
    let active = true

    async function loadMenu() {
      try {
        setLoading(true)
        setError('')
        const response = await fetchMenu()
        if (active) setMenuItems(response)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMenu()
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const values = Array.from(new Set(menuItems.map((item) => item.category))).sort((left, right) => {
      if (isDrinkCategory(left) !== isDrinkCategory(right)) {
        return isDrinkCategory(left) ? 1 : -1
      }
      return left.localeCompare(right)
    })

    return ['All', ...values]
  }, [menuItems])

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return menuItems
      .filter((item) => activeCategory === 'All' || item.category === activeCategory)
      .filter((item) => {
        if (!normalizedSearch) return true
        return `${item.name} ${item.category}`.toLowerCase().includes(normalizedSearch)
      })
      .sort((left, right) => {
        if (left.category !== right.category) return left.category.localeCompare(right.category)
        return Number(left.price) - Number(right.price)
      })
  }, [activeCategory, menuItems, search])

  const total = useMemo(() => calculateCartTotal(items), [items])
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  )

  const addItem = (menuItem) => {
    setCreatedOrder(null)
    setItems((current) => {
      const existing = current.find((item) => item._id === menuItem._id)
      if (existing) {
        return current.map((item) =>
          item._id === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...menuItem, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId, nextQuantity) => {
    setItems((current) => {
      if (nextQuantity <= 0) return current.filter((item) => item._id !== itemId)
      return current.map((item) => (item._id === itemId ? { ...item, quantity: nextQuantity } : item))
    })
  }

  const resetOrder = () => {
    setItems([])
    setCustomerName('')
    setCreatedOrder(null)
    setError('')
  }

  const submitOrder = async (event) => {
    event.preventDefault()
    const trimmedName = customerName.trim()

    if (!trimmedName) {
      setError('Customer name is required.')
      return
    }

    if (!items.length) {
      setError('Select at least one menu item.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const order = await createCounterOrder({
        customerName: trimmedName,
        items: items.map(({ _id, name, price, quantity }) => ({
          menuItemId: _id,
          name,
          price,
          quantity,
        })),
        totalPrice: total,
      })

      setCreatedOrder(order)
      setItems([])
      setCustomerName('')
      showToast({
        tone: 'success',
        title: 'Counter order placed',
        message: `Order #${String(order._id).slice(0, 6)} was sent to admin.`,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell hideCartButton>
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div>
          <SectionHeading
            eyebrow="Counter Ordering"
            title="Place a pay-at-counter order"
            description="Select food, enter the customer name, and send the order directly to the admin dashboard."
          />

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_0.45fr]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search food or drinks"
                className="h-14 w-full rounded-[20px] border border-border bg-surface pl-12 pr-4 text-base outline-none transition focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={resetOrder}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] border border-border bg-surface px-4 text-sm font-semibold transition hover:bg-surface-strong"
            >
              <RefreshCw size={16} />
              New order
            </button>
          </div>

          <div className="mt-5">
            <CategoryTabs categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>

          {loading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="glass-panel h-40 animate-pulse rounded-[24px] bg-surface-strong" />
              ))}
            </div>
          ) : error && !menuItems.length ? (
            <div className="glass-panel mt-6 rounded-[28px] p-6 text-sm text-red-500">{error}</div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) => {
                const selectedItem = items.find((selected) => selected._id === item._id)
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => addItem(item)}
                    className={`glass-panel min-h-40 rounded-[24px] p-4 text-left transition hover:-translate-y-0.5 hover:bg-surface-strong ${
                      selectedItem ? 'border-primary bg-primary/10' : ''
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
                      {item.category}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-tight">{item.name}</h3>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold text-primary">{currency(item.price)}</span>
                      <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-text px-3 text-sm font-semibold text-bg">
                        {selectedItem ? `x${selectedItem.quantity}` : <Plus size={18} />}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <form onSubmit={submitOrder} className="glass-panel h-fit rounded-[28px] p-5 xl:sticky xl:top-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Current order</p>
          <label className="mt-5 block">
            <span className="text-sm font-semibold">Customer name</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Enter name"
              className="mt-2 h-14 w-full rounded-[20px] border border-border bg-surface px-4 text-lg outline-none transition focus:border-primary"
            />
          </label>

          <div className="mt-5 space-y-3">
            {items.length ? (
              items.map((item) => (
                <div key={item._id} className="rounded-[20px] border border-border bg-surface-strong p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">{currency(item.price)} each</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, 0)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface transition hover:bg-surface-strong"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-surface transition hover:bg-surface-strong"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="h-11 rounded-2xl border border-border bg-surface px-3 text-center text-lg font-semibold leading-[44px]">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-surface transition hover:bg-surface-strong"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-border bg-surface-strong p-5 text-center text-sm text-muted">
                Select items from the menu.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[22px] border border-border bg-surface-strong p-4">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{currency(total)}</span>
            </div>
            <p className="mt-3 text-sm text-muted">Payment: counter cash</p>
          </div>

          {createdOrder ? (
            <div className="mt-5 rounded-[22px] border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                Order #{String(createdOrder._id).slice(0, 6)} sent
              </div>
              <p className="mt-2">Admin can now track it in today's dashboard.</p>
            </div>
          ) : null}

          {error && menuItems.length ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !items.length}
            className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-primary px-5 text-base font-semibold text-bg-strong transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Sending order
              </>
            ) : (
              'Send to admin'
            )}
          </button>
        </form>
      </section>
    </AppShell>
  )
}

export default CounterOrder
