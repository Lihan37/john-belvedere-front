import { useRef } from 'react'

function CategoryTabs({ categories, activeCategory, onChange }) {
  const scrollRef = useRef(null)

  return (
    <div className="category-tabs-shell glass-panel rounded-[30px] p-2.5">
      <div className="flex items-center">
        <div
          ref={scrollRef}
          className="category-scrollbar flex min-w-0 flex-1 gap-2.5 overflow-x-auto scroll-smooth px-1 pb-2"
        >
          {categories.map((category) => {
            const active = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                onClick={() => onChange(category)}
                className={`category-tab shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'category-tab-active border-primary text-bg-strong shadow-soft'
                    : 'text-text hover:border-secondary/25 hover:text-primary'
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
