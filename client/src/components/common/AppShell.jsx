import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUp, BarChart3, LayoutDashboard, LogOut, Menu, ShoppingBag, User, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/useAuth'
import {
  getAdminOrderAlertCount,
  getAdminOrderAlertEventName,
  getAdminOrderLastSeenAt,
  getCloudinaryImageUrl,
  prepareNotificationAudio,
  setAdminOrderAlertCount,
} from '../../utils/helpers'
import { fetchDailyOrderReport } from '../../services/orderService'

const ADMIN_BADGE_POLLING_INTERVAL_MS = 15000

function AppShell({ children }) {
  const location = useLocation()
  const { itemCount } = useCart()
  const { isAdmin, isAuthenticated, logout, user } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('jb_theme') || 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [adminOrderAlertCount, setAdminOrderAlertCount] = useState(() => getAdminOrderAlertCount())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('jb_theme', theme)
  }, [theme])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    prepareNotificationAudio()
    setAdminOrderAlertCount(getAdminOrderAlertCount())

    const eventName = getAdminOrderAlertEventName()
    const handleAlertCountChange = (event) => {
      const nextCount = Number(event.detail?.count ?? getAdminOrderAlertCount())
      setAdminOrderAlertCount(Number.isFinite(nextCount) ? Math.max(0, nextCount) : 0)
    }

    window.addEventListener(eventName, handleAlertCountChange)
    return () => {
      window.removeEventListener(eventName, handleAlertCountChange)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return

    let active = true
    const isDashboardPage = location.pathname === '/admin/dashboard'

    const syncAdminOrderBadge = async () => {
      if (isDashboardPage) {
        setAdminOrderAlertCount(0)
        return
      }

      try {
        const response = await fetchDailyOrderReport()
        if (!active) return

        const lastSeenAt = getAdminOrderLastSeenAt()
        const unseenCount = (response.orders || []).filter((order) => {
          if (!lastSeenAt) return true
          return new Date(order.createdAt) > new Date(lastSeenAt)
        }).length

        setAdminOrderAlertCount(unseenCount)
      } catch {
        // Ignore badge polling failures here; dashboard handles detailed errors.
      }
    }

    syncAdminOrderBadge()
    const intervalId = window.setInterval(syncAdminOrderBadge, ADMIN_BADGE_POLLING_INTERVAL_MS)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [isAdmin, location.pathname])

  const showBottomCartButton = !isAdmin

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const customerAccountAction = !isAdmin && isAuthenticated ? (
    <NavLink
      to="/account"
      onClick={() => setMobileMenuOpen(false)}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
    >
      <User size={16} />
      <span>{user?.name || 'Account'}</span>
    </NavLink>
  ) : null

  const customerAuthAction = !isAdmin ? (
    isAuthenticated ? (
      <button
        type="button"
        onClick={logout}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
      >
        <User size={16} />
        <span>Log out</span>
        <LogOut size={16} />
      </button>
    ) : (
      <NavLink
        to="/login"
        onClick={() => setMobileMenuOpen(false)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
      >
        <User size={16} />
        Customer login
      </NavLink>
    )
  ) : null

  const primaryActions = isAdmin ? (
    <>
      <NavLink
        to="/admin/dashboard"
        onClick={() => setMobileMenuOpen(false)}
        className="relative inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
      >
        <LayoutDashboard size={16} />
        Dashboard
        {adminOrderAlertCount ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-bg-strong shadow-soft">
            {adminOrderAlertCount > 9 ? '9+' : adminOrderAlertCount}
          </span>
        ) : null}
      </NavLink>
      <NavLink
        to="/admin/reports"
        onClick={() => setMobileMenuOpen(false)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
      >
        <BarChart3 size={16} />
        Reports
      </NavLink>
    </>
  ) : (
    <NavLink
      to="/cart"
      onClick={() => setMobileMenuOpen(false)}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-[#fff8ef] transition hover:bg-primary-strong"
      style={{ color: 'var(--bg-strong)' }}
    >
      <ShoppingBag size={16} color="currentColor" />
      <span style={{ color: 'var(--bg-strong)' }}>Cart</span>
      <span
        className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-[#fff8ef]"
        style={{ color: 'var(--bg-strong)' }}
      >
        {itemCount}
      </span>
    </NavLink>
  )

  return (
    <div className="page-shell min-h-screen px-4 py-4 text-text sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col rounded-[32px] border border-border bg-surface/50 p-4 shadow-soft backdrop-blur-xl sm:p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/menu" className="min-w-0" onClick={() => setMobileMenuOpen(false)}>
              <img
                src={getCloudinaryImageUrl('https://res.cloudinary.com/ddeorktvp/image/upload/v1773960493/Gemini_Generated_Image_oqdjszoqdjszoqdj-removebg-preview_ivzq9h.png', {
                  width: 320,
                  height: 120,
                  crop: 'fit',
                })}
                alt="John Belvedere"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-14 w-auto object-contain sm:h-16"
              />
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              {customerAccountAction}
              {customerAuthAction}
              {primaryActions}
              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              />
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface-strong"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 md:hidden ${
              mobileMenuOpen ? 'max-h-80 pt-4 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="glass-panel rounded-[28px] p-4">
              <div className="grid gap-3">
                {customerAccountAction}
                {customerAuthAction}
                {primaryActions}
              </div>
            </div>
          </div>
        </header>
        <main className={`flex-1 ${showBottomCartButton ? 'pb-24' : ''}`}>{children}</main>
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
        {showScrollTop ? (
          <button
            type="button"
            onClick={handleScrollTop}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-text shadow-soft transition hover:bg-surface-strong"
            aria-label="Go to top"
          >
            <ArrowUp size={18} />
          </button>
        ) : null}

        {showBottomCartButton ? (
          <NavLink
            to="/cart"
            className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-primary px-5 py-4 text-sm font-semibold text-[#fff8ef] shadow-soft transition hover:bg-primary-strong"
            style={{ color: 'var(--bg-strong)' }}
          >
            <ShoppingBag size={18} color="currentColor" />
            <span style={{ color: 'var(--bg-strong)' }}>Cart</span>
            <span
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-[#fff8ef]"
              style={{ color: 'var(--bg-strong)' }}
            >
              {itemCount}
            </span>
          </NavLink>
        ) : null}
      </div>
    </div>
  )
}

export default AppShell
