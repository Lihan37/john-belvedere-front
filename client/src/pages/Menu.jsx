import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import CategoryTabs from '../components/menu/CategoryTabs'
import MenuCard from '../components/menu/MenuCard'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/useToast'
import { fetchMenu } from '../services/menuService'
import { useAuth } from '../context/useAuth'

const initialLoaderMinDurationMs = 650

function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve()
      return
    }

    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = url
  })
}

function Menu() {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [menuItems, setMenuItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadMenu() {
      const startedAt = Date.now()

      try {
        setLoading(true)
        setError('')
        const items = await fetchMenu()
        await Promise.allSettled(items.slice(0, 6).map((item) => preloadImage(item.image)))

        const elapsed = Date.now() - startedAt
        if (elapsed < initialLoaderMinDurationMs) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, initialLoaderMinDurationMs - elapsed),
          )
        }

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

  const visibleItems = useMemo(() => {
    const scopedItems =
      activeCategory === 'All'
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory)

    return [...scopedItems].sort((left, right) => {
      if (left.category !== right.category) {
        return left.category.localeCompare(right.category)
      }

      return Number(left.price) - Number(right.price)
    })
  }, [activeCategory, menuItems])

  const groupedVisibleItems = useMemo(() => {
    if (activeCategory !== 'All') {
      return []
    }

    return categories
      .filter((category) => category !== 'All')
      .map((category) => ({
        category,
        items: visibleItems.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0)
  }, [activeCategory, categories, visibleItems])

  const handleAddToCart = (item) => {
    addToCart(item)
    showToast({
      tone: 'success',
      title: 'Added to cart',
      message: `${item.name} is ready in your cart.`,
      duration: 2200,
    })
  }

  return (
    <AppShell>
      {loading && !menuItems.length ? (
        <section className="flex min-h-[calc(100vh-11rem)] items-center justify-center">
          <div className="glass-panel grid-pattern relative w-full max-w-3xl overflow-hidden rounded-[36px] px-6 py-14 text-center sm:px-10 sm:py-16">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-secondary">
                John Belvedere
              </p>
              <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
                Preparing the menu experience.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
                Loading categories, featured dishes, and visuals so the menu opens cleanly instead of appearing in pieces.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-surface/80 px-5 py-3 text-sm font-semibold text-text shadow-soft">
                <LoaderCircle size={18} className="animate-spin text-primary" />
                Getting everything ready...
              </div>
              <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-surface-strong">
                <div className="loader-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!loading || menuItems.length ? (
        <>
      <section>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel grid-pattern rounded-[32px] p-6 text-center sm:p-7"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Scan. Order. Enjoy.
              </span>
              <span className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                Dine-in ordering
              </span>
            </div>
            <SectionHeading
              title="Browse and order fast."
              description="A simple QR ordering flow built for quick menu access and smooth checkout."
            />
            <div className="mx-auto mt-5 w-full max-w-sm rounded-[22px] border border-border bg-surface-strong p-4 text-center">
              <p className="text-sm text-muted">Signed in</p>
              <p className="mt-2 text-base font-semibold">
                {user ? user.name || user.email || user.phone : 'Guest browsing'}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mt-8">
        <div className="mb-6">
          <div className="max-w-xl">
            <SectionHeading
              eyebrow="Menu"
              title="Fresh picks for the table"
              description="Category-based browsing with quick add actions."
            />
          </div>
          <div className="mt-5">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
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
        ) : activeCategory === 'All' ? (
          <div className="space-y-10">
            {groupedVisibleItems.map((group) => (
              <section key={group.category}>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                    Category
                  </p>
                  <h3 className="mt-2 font-display text-3xl">{group.category}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <MenuCard key={item._id} item={item} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <MenuCard key={item._id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
        </>
      ) : null}
    </AppShell>
  )
}

export default Menu
