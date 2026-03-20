import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import CategoryTabs from '../components/menu/CategoryTabs'
import MenuCard from '../components/menu/MenuCard'
import { useCart } from '../context/CartContext'
import { fetchMenu } from '../services/menuService'
import { useAuth } from '../context/AuthContext'

function Menu() {
  const { addToCart } = useCart()
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

  return (
    <AppShell>
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
                    <MenuCard key={item._id} item={item} onAdd={addToCart} />
                  ))}
                </div>
              </section>
            ))}
          </div>
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
