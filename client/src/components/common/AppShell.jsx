import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, ShoppingBag, User, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

function AppShell({ children }) {
  const { itemCount } = useCart()
  const { isAdmin, isAuthenticated, logout, user } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('jb_theme') || 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('jb_theme', theme)
  }, [theme])

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
        <span>{user?.name || 'Customer'}</span>
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
    <NavLink
      to="/admin/dashboard"
      onClick={() => setMobileMenuOpen(false)}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
    >
      <LayoutDashboard size={16} />
      Dashboard
    </NavLink>
  ) : (
    <NavLink
      to="/cart"
      onClick={() => setMobileMenuOpen(false)}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-strong"
    >
      <ShoppingBag size={16} />
      Cart
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
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
                src="https://res.cloudinary.com/ddeorktvp/image/upload/v1773960493/Gemini_Generated_Image_oqdjszoqdjszoqdj-removebg-preview_ivzq9h.png"
                alt="John Belvedere"
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
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
