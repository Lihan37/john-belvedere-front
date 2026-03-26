import { useRef } from 'react'

function CategoryTabs({ categories, activeCategory, onChange }) {
  const scrollRef = useRef(null)

  return (
    <div className="glass-panel rounded-[28px] p-2">
      <div className="flex items-center">
        <div
          ref={scrollRef}
          className="category-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth pb-2"
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
      </div>
    </div>
  )
}

export default CategoryTabs
