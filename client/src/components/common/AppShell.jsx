import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, ShoppingBag, User } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { APP_NAME } from '../../utils/helpers'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

function AppShell({ children }) {
  const { itemCount } = useCart()
  const { isAdmin, isAuthenticated, logout, user } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('jb_theme') || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('jb_theme', theme)
  }, [theme])

  return (
    <div className="page-shell min-h-screen px-4 py-4 text-text sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col rounded-[32px] border border-border bg-surface/50 p-4 shadow-soft backdrop-blur-xl sm:p-6">
        <header className="mb-6 flex items-center justify-between gap-3">
          <Link to="/menu" className="min-w-0">
            <p className="font-display text-2xl tracking-wide text-text sm:text-3xl">
              {APP_NAME}
            </p>
            <p className="text-sm text-muted">QR menu and ordering</p>
          </Link>
          <div className="flex items-center gap-2">
            {!isAdmin ? (
              isAuthenticated ? (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">{user?.name || 'Customer'}</span>
                  <LogOut size={16} />
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
                >
                  <User size={16} />
                  Customer login
                </NavLink>
              )
            ) : null}
            {isAdmin ? (
              <NavLink
                to="/admin/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-strong"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>
            ) : (
              <NavLink
                to="/cart"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-strong"
              >
                <ShoppingBag size={16} />
                Cart
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {itemCount}
                </span>
              </NavLink>
            )}
            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
