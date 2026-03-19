import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, QrCode, ScanLine, Sparkles } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import CategoryTabs from '../components/menu/CategoryTabs'
import MenuCard from '../components/menu/MenuCard'
import { useCart } from '../context/CartContext'
import { fetchMenu } from '../services/menuService'
import { useAuth } from '../context/AuthContext'

function Menu() {
  const [searchParams] = useSearchParams()
  const tableNumber = searchParams.get('table') || 'T12'
  const { addToCart, itemCount } = useCart()
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadMenu() {
      try {
        setLoading(true)
        const items = await fetchMenu()
        if (!active) return
        setMenuItems(items)
      } catch (err) {
        if (!active) return
        setError(err.message)
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
    const values = Array.from(new Set(menuItems.map((item) => item.category)))
    return ['All', ...values]
  }, [menuItems])

  const visibleItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  return (
    <AppShell>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel grid-pattern rounded-[32px] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Scan. Order. Enjoy.
            </span>
            <span className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
              Table {tableNumber}
            </span>
          </div>
          <SectionHeading
            eyebrow="Digital Menu"
            title="Restaurant ordering designed for quick QR checkout."
            description="Explore curated plates, customize your table order, and send it straight to the kitchen. Built mobile-first for real restaurant traffic."
            action={
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
              >
                View cart
                <ArrowRight size={16} />
              </Link>
            }
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: QrCode, label: 'QR Experience', text: 'Direct mobile menu after scan.' },
              { icon: ScanLine, label: 'Fast Ordering', text: 'Add items in a few taps.' },
              { icon: Sparkles, label: 'Kitchen Ready', text: 'Live order flow for the dashboard.' },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="rounded-[24px] border border-border bg-surface-strong p-4">
                <Icon className="mb-4 text-primary" size={20} />
                <p className="font-semibold">{label}</p>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            Session
          </p>
          <h2 className="mt-3 font-display text-3xl">Your table is live</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {user
              ? `Signed in as ${user.name || user.email || user.phone}.`
              : 'Continue as guest or sign in to save future orders.'}
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-[24px] border border-border bg-surface-strong p-4">
              <p className="text-sm text-muted">Items in cart</p>
              <p className="mt-2 text-3xl font-semibold">{itemCount}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-surface-strong p-4">
              <p className="text-sm text-muted">Order type</p>
              <p className="mt-2 text-lg font-semibold">Dine-in, table {tableNumber}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            eyebrow="Menu"
            title="Fresh picks for the table"
            description="Category-based browsing with quick add actions."
          />
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="glass-panel h-[360px] animate-pulse rounded-[28px] bg-surface-strong"
              />
            ))}
          </div>
        ) : error ? (
          <div className="glass-panel rounded-[28px] p-6 text-sm text-red-500">{error}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <MenuCard key={item._id} item={item} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default Menu
