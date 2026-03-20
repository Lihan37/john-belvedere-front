import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function CategoryTabs({ categories, activeCategory, onChange }) {
  const scrollRef = useRef(null)

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    })
  }

  return (
    <div className="glass-panel flex items-center gap-2 rounded-[28px] p-2">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong text-text transition hover:bg-bg-strong"
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={18} />
      </button>
      <div
        ref={scrollRef}
        className="hide-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth"
      >
        {categories.map((category) => {
          const active = category === activeCategory
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'border-primary bg-primary text-bg-strong shadow-soft'
                  : 'border-border bg-surface-strong text-text hover:border-secondary/30 hover:bg-bg-strong'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong text-text transition hover:bg-bg-strong"
        aria-label="Scroll categories right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default CategoryTabs
