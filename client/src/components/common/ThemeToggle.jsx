import { Moon, Sun } from 'lucide-react'

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:scale-105 hover:bg-surface-strong"
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default ThemeToggle
